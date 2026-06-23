import type { Agency, City, Group, Idol, Status } from '../../types';
import { normalizePersonalityProfile } from '../idols';
import { computeGroupSynergy, estimateGroupMonthlyRevenue } from '../groups';

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
  nextLevel: number;
  trainingCostAmount: number;
  revenuePoint: RevenuePoint;
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
  city,
  idols,
  groups,
  trainingPlans,
  currentWeek,
}: WeeklyProgressionInput): WeeklyProgressionResult {
  const groupIdByName = new Map(groups.map(group => [group.name, group.id]));
  const nextWeek = currentWeek + 1;
  const monthTick = nextWeek % 4 === 0 ? 1 : 0;
  const yearTick = nextWeek % WEEKS_PER_YEAR === 0 ? 1 : 0;

  const nextIdols = idols.map(idol => {
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

    // Personality-driven efficiency: discipline makes skill drills more
    // reliable; adaptability boosts media/language; responsibility cushions
    // morale/health drops; low energy (fatigue) reduces all gains.
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
      status: nextIdolStatus(idol.status, nextHealth, nextEnergy, Boolean(idol.group)),
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
    // Reuse the personality/role synergy model, smoothed for stability and
    // penalised when the group is fatigued.
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

  // Agency level scales with reputation and number of debuted groups.
  const nextLevel = Math.max(
    agency.level,
    1 + Math.floor(nextReputation / 20) + activeGroupCount,
  );

  // Training costs across every idol's resolved plan.
  let trainingCostAmount = 0;
  for (const idol of idols) {
    const plan = resolvePlan(idol, trainingPlans, groupIdByName);
    for (const typeId of Object.values(plan)) {
      trainingCostAmount += SESSION_COST[typeId] ?? 0;
    }
  }

  return {
    nextIdols,
    nextGroups,
    nextMonthlyIncome,
    nextReputation,
    nextRanking,
    nextLevel,
    trainingCostAmount,
    revenuePoint: {
      m: `W${currentWeek + 1}`,
      group: Math.round(groupsRevenue / 4),
      solo: Math.round(Math.max(nextIdols.length, 1) * 2_200_000),
      merch: Math.round(Math.max(nextGroups.length, 0) * 6_500_000),
    },
  };
}
