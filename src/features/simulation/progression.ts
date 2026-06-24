import type { Agency, City, Group, Idol, Status } from '../../types';
import { normalizePersonalityProfile } from '../idols';
import { computeGroupSynergy, estimateGroupMonthlyRevenue } from '../groups';
import type { ProgressionEvent } from './types';

type TrainingPlans = Record<string, Record<string, string>>;

type RevenuePoint = {
  m: string;
  group: number;
  solo: number;
  merch: number;
};

export type WeeklyProgressionInput = {
  agency: Agency;
  city: City;
  idols: Idol[];
  groups: Group[];
  trainingPlans: TrainingPlans;
  currentWeek: number;
};

export type WeeklyProgressionResult = {
  nextIdols: Idol[];
  nextGroups: Group[];
  nextMonthlyIncome: number;
  nextReputation: number;
  nextRanking: number;
  trainingCostAmount: number;
  weeklyMerchRevenue: number;
  revenuePoint: RevenuePoint;
  events: ProgressionEvent[];
  departedIdolIds: string[];
};

/** ₩ cost per training session, by training type id. */
export const SESSION_COST: Record<string, number> = {
  vocal: 800_000,
  dance: 800_000,
  rap: 800_000,
  visual: 800_000,
  acting: 600_000,
  lang: 600_000,
  media: 600_000,
  stamina: 500_000,
  rest: 200_000,
};

const WEEKS_PER_YEAR = 52;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampSigned(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function countSessions(plan: Record<string, string>, typeId: string) {
  return Object.values(plan).filter(value => value === typeId).length;
}

/**
 * Stat gain for a discipline of training. `multiplier` folds in personality
 * (discipline/adaptability) and fatigue so two idols on the same plan progress
 * differently.
 */
function statGain(sessions: number, totalSessions: number, multiplier: number) {
  if (sessions <= 0) {
    return 0;
  }
  const heavyLoadPenalty = totalSessions >= 15 ? 1 : 0;
  const base = sessions * 0.32 + (sessions >= 5 ? 1 : 0);
  return Math.max(0, Math.round(base * multiplier - heavyLoadPenalty));
}

function resolvePlan(
  idol: Idol,
  trainingPlans: TrainingPlans,
  groupIdByName: Map<string, string>,
): Record<string, string> {
  const groupPlanKey = idol.group ? groupIdByName.get(idol.group) ?? idol.group : undefined;
  if (groupPlanKey) {
    return (
      trainingPlans[groupPlanKey] ??
      trainingPlans[idol.group ?? ''] ??
      trainingPlans.SOLO_DEFAULT ??
      {}
    );
  }
  return trainingPlans.SOLO_DEFAULT ?? {};
}

function nextIdolStatus(
  current: Status,
  health: number,
  energy: number,
  hasGroup: boolean,
): Status {
  if (health < 25) {
    return 'Injured';
  }
  if (energy < 20) {
    return 'Resting';
  }
  // Recovered idols leave temporary states; debuted (grouped) idols return to
  // Active, ungrouped trainees return to Trainee.
  if (current === 'Injured' || current === 'Resting' || current === 'Promoting') {
    return hasGroup ? 'Active' : 'Trainee';
  }
  return current;
}

export function calculateWeeklyProgression({
  agency,
  city: _city,
  idols,
  groups,
  trainingPlans,
  currentWeek,
}: WeeklyProgressionInput): WeeklyProgressionResult {
  const groupIdByName = new Map(groups.map(group => [group.name, group.id]));
  const nextWeek = currentWeek + 1;
  const monthTick = nextWeek % 4 === 0 ? 1 : 0;
  const yearTick = nextWeek % WEEKS_PER_YEAR === 0 ? 1 : 0;

  const events: ProgressionEvent[] = [];
  const departedIdolIds: string[] = [];

  // Detect contract departures first so we can exclude departed idols from training
  for (const idol of idols) {
    const weeksLeft = (idol.contractExpiresWeek ?? 999) - nextWeek;
    if (weeksLeft <= 0) {
      departedIdolIds.push(idol.id);
      events.push({
        type: 'contract_expired',
        idolId: idol.id,
        idolName: idol.stageName,
        message: `${idol.stageName} has left the agency — their contract has expired.`,
      });
    } else if (weeksLeft <= 8) {
      events.push({
        type: 'contract_warning',
        idolId: idol.id,
        idolName: idol.stageName,
        message: `${idol.stageName}'s contract expires in ${weeksLeft} week${weeksLeft === 1 ? '' : 's'}.`,
      });
    }
  }

  const departedSet = new Set(departedIdolIds);

  const nextIdols = idols
    .filter(idol => !departedSet.has(idol.id))
    .map(idol => {
      const isInjured = idol.status === 'Injured';

      // Injured idols skip training entirely — they rest and recover.
      if (isInjured) {
        const healedHealth = clamp(idol.health + 6);
        const healedEnergy = clamp(idol.energy + 3);
        const healedMorale = clamp(idol.morale - 1);
        return {
          ...idol,
          health: healedHealth,
          energy: healedEnergy,
          morale: healedMorale,
          status: nextIdolStatus('Injured', healedHealth, healedEnergy, Boolean(idol.group)),
          age: idol.age + yearTick,
          trainingMonths: Math.max(0, Math.round((idol.trainingMonths ?? 0) + monthTick)),
        };
      }

      const plan = resolvePlan(idol, trainingPlans, groupIdByName);
      const profile = normalizePersonalityProfile(idol.personalityProfile, idol.personality);

      const vocalSessions = countSessions(plan, 'vocal');
      const danceSessions = countSessions(plan, 'dance');
      const rapSessions = countSessions(plan, 'rap');
      const visualSessions = countSessions(plan, 'visual');
      const actingSessions = countSessions(plan, 'acting');
      const languageSessions = countSessions(plan, 'lang');
      const mediaSessions = countSessions(plan, 'media');
      const staminaSessions = countSessions(plan, 'stamina');
      const restSessions = countSessions(plan, 'rest');
      const totalTraining =
        vocalSessions +
        danceSessions +
        rapSessions +
        visualSessions +
        actingSessions +
        languageSessions +
        mediaSessions +
        staminaSessions;

      const disciplineFactor = clampSigned(0.8 + profile.traits.discipline / 100 * 0.4, 0.8, 1.2);
      const adaptabilityFactor = clampSigned(0.8 + profile.traits.adaptability / 100 * 0.4, 0.8, 1.2);
      const dropScale = clampSigned(1 - (profile.traits.responsibility - 50) / 150, 0.6, 1.3);
      const exhaustionFactor = idol.energy < 25 ? 0.6 : idol.energy < 45 ? 0.85 : 1;
      const skillMultiplier = disciplineFactor * exhaustionFactor;
      const mediaMultiplier = adaptabilityFactor * exhaustionFactor;

      const energyDelta = restSessions * 6 - totalTraining * 5;
      const moraleDelta = restSessions * 1.6 - totalTraining * 0.32 * dropScale;
      const healthDelta = restSessions * 1.1 - totalTraining * 0.24 * dropScale;
      const popGain = Math.round(
        (mediaSessions + languageSessions) * 0.28 * adaptabilityFactor + (restSessions > 0 ? 1 : 0),
      );

      const nextEnergy = clamp(idol.energy + energyDelta);
      const nextMorale = clamp(idol.morale + moraleDelta);
      const nextHealth = clamp(idol.health + healthDelta);
      const nextStatus = nextIdolStatus(idol.status, nextHealth, nextEnergy, Boolean(idol.group));

      // Detect new injuries this tick
      if (idol.status !== 'Injured' && nextStatus === 'Injured') {
        events.push({
          type: 'injury',
          idolId: idol.id,
          idolName: idol.stageName,
          message: `${idol.stageName} has been injured and needs rest. Training is paused until recovery.`,
        });
      }
      // Detect burnout (forced rest from energy collapse)
      if (idol.status !== 'Resting' && nextStatus === 'Resting') {
        events.push({
          type: 'burnout',
          idolId: idol.id,
          idolName: idol.stageName,
          message: `${idol.stageName} is burned out and needs rest. Reduce training intensity.`,
        });
      }
      // Morale crash (first drop below 30)
      if (idol.morale >= 30 && nextMorale < 30) {
        events.push({
          type: 'low_morale',
          idolId: idol.id,
          idolName: idol.stageName,
          message: `${idol.stageName}'s morale has fallen critically low (${nextMorale}). Add rest sessions.`,
        });
      }
      // Health warning (entering danger zone before injury)
      if (idol.health >= 40 && nextHealth < 40 && nextHealth >= 25) {
        events.push({
          type: 'low_health',
          idolId: idol.id,
          idolName: idol.stageName,
          message: `${idol.stageName}'s health is dropping (${nextHealth}). Risk of injury if overworked.`,
        });
      }

      return {
        ...idol,
        stats: {
          ...idol.stats,
          vocal: clamp(idol.stats.vocal + statGain(vocalSessions, totalTraining, skillMultiplier)),
          dance: clamp(idol.stats.dance + statGain(danceSessions, totalTraining, skillMultiplier)),
          rap: clamp(idol.stats.rap + statGain(rapSessions, totalTraining, skillMultiplier)),
          visual: clamp(idol.stats.visual + statGain(visualSessions, totalTraining, skillMultiplier)),
          acting: clamp(idol.stats.acting + statGain(actingSessions, totalTraining, skillMultiplier)),
          stamina: clamp(idol.stats.stamina + statGain(staminaSessions, totalTraining, skillMultiplier)),
          variety: clamp(idol.stats.variety + statGain(mediaSessions, totalTraining, mediaMultiplier)),
          charisma: clamp(
            idol.stats.charisma +
              Math.round((mediaSessions + languageSessions) * 0.25 * adaptabilityFactor),
          ),
        },
        popularity: clamp(idol.popularity + popGain),
        energy: nextEnergy,
        morale: nextMorale,
        health: nextHealth,
        status: nextStatus,
        age: idol.age + yearTick,
        trainingMonths: Math.max(0, Math.round((idol.trainingMonths ?? 0) + monthTick)),
      };
    });

  const nextGroups = groups.map(group => {
    const members = nextIdols.filter(idol => group.memberIds.includes(idol.id));
    const avgPopularity =
      members.reduce((sum, member) => sum + member.popularity, 0) / Math.max(members.length, 1);
    const avgEnergy =
      members.reduce((sum, member) => sum + member.energy, 0) / Math.max(members.length, 1);
    const baseSynergy = computeGroupSynergy(group, members);
    const energyPressure = Math.max(0, 70 - avgEnergy) / 12;
    const nextSynergy = clamp(group.synergy * 0.55 + baseSynergy * 0.45 - energyPressure);
    const nextPopularity = clamp(group.popularity * 0.9 + avgPopularity * 0.1 + nextSynergy / 45);
    const nextMonthlyRevenue = estimateGroupMonthlyRevenue(
      nextPopularity,
      nextSynergy,
      members.length,
      group.status,
    );

    return {
      ...group,
      synergy: nextSynergy,
      popularity: nextPopularity,
      monthlyRevenue: nextMonthlyRevenue,
    };
  });

  const groupsRevenue = nextGroups.reduce((sum, group) => sum + group.monthlyRevenue, 0);
  const activeGroupCount = nextGroups.filter(group => group.status === 'Active').length;
  const targetMonthlyIncome = Math.max(
    18_000_000,
    Math.round(groupsRevenue * 0.78 + nextIdols.length * 3_800_000),
  );
  const nextMonthlyIncome = Math.round(agency.monthlyIncome * 0.68 + targetMonthlyIncome * 0.32);
  const averageSynergy =
    nextGroups.reduce((sum, group) => sum + group.synergy, 0) / Math.max(nextGroups.length, 1);
  const reputationDelta = clampSigned(
    Math.round((averageSynergy - 55) / 14 + activeGroupCount * 0.4),
    -2,
    3,
  );
  const nextReputation = clamp(agency.reputation + reputationDelta);
  const averageGroupPopularity =
    nextGroups.reduce((sum, group) => sum + group.popularity, 0) / Math.max(nextGroups.length, 1);
  const rankDelta = Math.max(
    0,
    Math.round(
      activeGroupCount * 1.5 + nextReputation / 40 + Math.max(0, averageGroupPopularity - 50) / 60,
    ),
  );
  const nextRanking = Math.max(1, agency.ranking - rankDelta);

  // Training costs — departed and injured idols don't incur training cost.
  let trainingCostAmount = 0;
  for (const idol of idols) {
    if (departedSet.has(idol.id) || idol.status === 'Injured') continue;
    const plan = resolvePlan(idol, trainingPlans, groupIdByName);
    for (const typeId of Object.values(plan)) {
      trainingCostAmount += SESSION_COST[typeId] ?? 0;
    }
  }

  // Merchandise revenue from active groups: scales with popularity × synergy × member count.
  const weeklyMerchRevenue = nextGroups
    .filter(g => g.status === 'Active')
    .reduce((sum, g) => {
      const memberCount = nextIdols.filter(i => g.memberIds.includes(i.id)).length;
      return sum + Math.round((g.popularity / 100) * (g.synergy / 100) * Math.max(memberCount, 1) * 2_500_000);
    }, 0);

  return {
    nextIdols,
    nextGroups,
    nextMonthlyIncome,
    nextReputation,
    nextRanking,
    trainingCostAmount,
    weeklyMerchRevenue,
    revenuePoint: {
      m: `W${currentWeek + 1}`,
      group: Math.round(groupsRevenue / 4),
      solo: Math.round(Math.max(nextIdols.filter(i => !i.group).length, 0) * 2_200_000),
      merch: weeklyMerchRevenue,
    },
    events,
    departedIdolIds,
  };
}
