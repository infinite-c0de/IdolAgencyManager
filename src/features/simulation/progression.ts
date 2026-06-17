import type { Agency, City, Group, Idol } from '../../types';

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
  weeklyIncomeAmount: number;
  weeklyExpenseAmount: number;
  revenuePoint: RevenuePoint;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampSigned(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function countSessions(plan: Record<string, string>, typeId: string) {
  return Object.values(plan).filter(value => value === typeId).length;
}

function statGain(primarySessions: number, totalSessions: number) {
  const heavyLoadPenalty = totalSessions >= 15 ? 1 : 0;
  const gain = primarySessions * 0.32 + (primarySessions >= 5 ? 1 : 0) - heavyLoadPenalty;
  return Math.max(0, Math.round(gain));
}

export function calculateWeeklyProgression({
  agency,
  city,
  idols,
  groups,
  trainingPlans,
  currentWeek,
}: WeeklyProgressionInput): WeeklyProgressionResult {
  const nextIdols = idols.map(idol => {
    const plan =
      idol.group
        ? trainingPlans[idol.group] ?? trainingPlans.SOLO_DEFAULT ?? {}
        : trainingPlans.SOLO_DEFAULT ?? {};
    const vocalSessions = countSessions(plan, 'vocal');
    const danceSessions = countSessions(plan, 'dance');
    const rapSessions = countSessions(plan, 'rap');
    const actingSessions = countSessions(plan, 'acting');
    const languageSessions = countSessions(plan, 'lang');
    const mediaSessions = countSessions(plan, 'media');
    const restSessions = countSessions(plan, 'rest');
    const totalTraining =
      vocalSessions +
      danceSessions +
      rapSessions +
      actingSessions +
      languageSessions +
      mediaSessions;

    const energyDelta = restSessions * 6 - totalTraining * 5;
    const moraleDelta = restSessions * 1.6 - totalTraining * 0.32;
    const healthDelta = restSessions * 1.1 - totalTraining * 0.24;
    const popGain = Math.round((mediaSessions + languageSessions) * 0.28 + (restSessions > 0 ? 1 : 0));

    return {
      ...idol,
      stats: {
        ...idol.stats,
        vocal: clamp(idol.stats.vocal + statGain(vocalSessions, totalTraining)),
        dance: clamp(idol.stats.dance + statGain(danceSessions, totalTraining)),
        rap: clamp(idol.stats.rap + statGain(rapSessions, totalTraining)),
        acting: clamp(idol.stats.acting + statGain(actingSessions, totalTraining)),
        variety: clamp(idol.stats.variety + statGain(mediaSessions, totalTraining)),
        charisma: clamp(idol.stats.charisma + Math.round((mediaSessions + languageSessions) * 0.25)),
      },
      popularity: clamp(idol.popularity + popGain),
      energy: clamp(idol.energy + energyDelta),
      morale: clamp(idol.morale + moraleDelta),
      health: clamp(idol.health + healthDelta),
    };
  });

  const nextGroups = groups.map(group => {
    const members = nextIdols.filter(idol => group.memberIds.includes(idol.id));
    const avgPopularity =
      members.reduce((sum, member) => sum + member.popularity, 0) / Math.max(members.length, 1);
    const avgEnergy = members.reduce((sum, member) => sum + member.energy, 0) / Math.max(members.length, 1);
    const avgMorale = members.reduce((sum, member) => sum + member.morale, 0) / Math.max(members.length, 1);
    const energyPressure = Math.max(0, 70 - avgEnergy) / 10;
    const synergyDrift = (avgMorale - 50) / 18 - energyPressure;
    const nextSynergy = clamp(group.synergy * 0.9 + avgMorale * 0.1 + synergyDrift);
    const nextPopularity = clamp(group.popularity * 0.88 + avgPopularity * 0.12 + nextSynergy / 40);
    const statusBoost = group.status === 'Active' ? 1.12 : 0.92;
    const nextMonthlyRevenue = Math.max(
      0,
      Math.round((nextPopularity * 1_450_000 + nextSynergy * 900_000) * statusBoost),
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
  const targetMonthlyIncome = Math.max(18_000_000, Math.round(groupsRevenue * 0.78 + nextIdols.length * 3_800_000));
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
    Math.round(activeGroupCount * 1.5 + nextReputation / 40 + Math.max(0, averageGroupPopularity - 50) / 60),
  );
  const nextRanking = Math.max(1, agency.ranking - rankDelta);
  const weeklyIncomeAmount = Math.max(0, Math.round(nextMonthlyIncome / 4));
  const weeklyExpenseAmount = Math.round(
    city.officeRentWeekly * city.operationalCostMultiplier + weeklyIncomeAmount * city.taxRate,
  );

  return {
    nextIdols,
    nextGroups,
    nextMonthlyIncome,
    nextReputation,
    nextRanking,
    weeklyIncomeAmount,
    weeklyExpenseAmount,
    revenuePoint: {
      m: `W${currentWeek + 1}`,
      group: Math.round(groupsRevenue / 4),
      solo: Math.round(Math.max(nextIdols.length, 1) * 2_200_000),
      merch: Math.round(Math.max(nextGroups.length, 0) * 6_500_000),
    },
  };
}
