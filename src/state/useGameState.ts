import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  initialAgency,
  cities,
  initialGroups as baseGroups,
  initialRevenueHistory as baseRevenueHistory,
  initialTransactions as baseTransactions,
  conceptOptions,
  languageOptions,
  trainingTypes,
} from '../data/gameData';
import type {
  CreateAgencyPayload,
  RecruitResult,
  RefreshScoutingResult,
  ScoutingFilters,
  SpendAgencyMoneyResult,
} from '../features/agency';
import { getCityByName } from '../features/cities';
import { applyWeeklyEconomyTick, defaultEconomyModifiers } from '../features/economy';
import type {
  AddGroupMembersPayload,
  AddGroupMembersResult,
  CreateGroupPayload,
  CreateGroupResult,
  ReleaseDebutPayload,
  ReleaseDebutResult,
  UpdateGroupRolesPayload,
  UpdateGroupRolesResult,
} from '../features/groups';
import { RELEASE_QUALITY_COST, releaseDebut as releaseDebutService } from '../features/groups';
import type { FinanceTransaction, RevenueHistoryPoint, SaveSlotSummary, TrainingPlans } from '../features/saves';
import {
  calculateWeeklyProgression,
  runPromotionAction,
  type PromotionScheduleEntry,
  type RunPromotionPayload,
  type RunPromotionResult,
} from '../features/simulation';
import type { Agency, Group, Idol, Trainee } from '../types';
import { useAgencyActions } from './useAgencyActions';
import { cloneInitialTrainees, rotateScoutingPool } from './gameStateHelpers';
import { useGroupActions } from './useGroupActions';
import { useSaveLifecycle } from './useSaveLifecycle';

export type SaveSlot = SaveSlotSummary;

export type GameState = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  cities: typeof cities;
  groups: Group[];
  revenueHistory: RevenueHistoryPoint[];
  transactions: FinanceTransaction[];
  promotionSchedule: PromotionScheduleEntry[];
  trainingPlans: TrainingPlans;
  currentWeek: number;
  conceptOptions: typeof conceptOptions;
  languageOptions: typeof languageOptions;
  trainingTypes: typeof trainingTypes;
  isAgencyCreated: boolean;
  isHydrated: boolean;
  activeSlotId: number | null;
  scoutingLastGrowthAt: string;
  saveSlots: SaveSlot[];
  createAgency: (payload: CreateAgencyPayload) => boolean;
  recruitTrainee: (traineeId: string) => RecruitResult;
  refreshScoutingCandidates: (filters: ScoutingFilters, overrideCost?: number) => RefreshScoutingResult;
  spendAgencyMoney: (cost: number) => SpendAgencyMoneyResult;
  createGroup: (payload: CreateGroupPayload) => CreateGroupResult;
  addGroupMembers: (payload: AddGroupMembersPayload) => AddGroupMembersResult;
  updateGroupRoles: (payload: UpdateGroupRolesPayload) => UpdateGroupRolesResult;
  setTrainingPlan: (targetId: string, plan: Record<string, string>) => void;
  advanceWeek: () => void;
  releaseDebut: (payload: ReleaseDebutPayload) => ReleaseDebutResult;
  runPromotion: (payload: RunPromotionPayload) => RunPromotionResult;
  addPromotionScheduleEntry: (entry: PromotionScheduleEntry) => void;
  renewContract: (idolId: string) => { ok: boolean; reason?: string; cost?: number };
  takeMarketOpportunity: (
    actionId: string,
    cost: number,
    reputationGain: number,
    incomeGain: number,
  ) => { ok: boolean; reason?: string };
  startNewGameInSlot: (slotId: number) => Promise<void>;
  loadGameFromSlot: (slotId: number) => Promise<'AgencyDashboard' | 'Onboarding' | false>;
  deleteSaveSlot: (slotId: number) => Promise<void>;
  resetGame: () => Promise<void>;
  updateAgencyProfile: (updates: Partial<Pick<Agency, 'name' | 'ceoName'>>) => void;
};

export function useGameState(): GameState {
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
  const [agency, setAgency] = useState<Agency>(initialAgency);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>(cloneInitialTrainees);
  const [groups, setGroups] = useState<Group[]>(baseGroups);
  const [revenueHistory, setRevenueHistory] = useState<RevenueHistoryPoint[]>(() =>
    baseRevenueHistory.map(point => ({ ...point })),
  );
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() =>
    baseTransactions.map(transaction => ({ ...transaction })),
  );
  const [promotionSchedule, setPromotionSchedule] = useState<PromotionScheduleEntry[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlans>({ SOLO_DEFAULT: {} });
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [isAgencyCreated, setIsAgencyCreated] = useState(false);
  const [scoutingLastGrowthAt, setScoutingLastGrowthAt] = useState<string>(
    () => new Date().toISOString(),
  );

  const {
    isHydrated,
    saveSlots,
    startNewGameInSlot,
    loadGameFromSlot,
    deleteSaveSlot,
    resetGame,
  } = useSaveLifecycle({
    agency,
    idols,
    trainees,
    groups,
    revenueHistory,
    transactions,
    promotionSchedule,
    trainingPlans,
    currentWeek,
    isAgencyCreated,
    activeSlotId,
    scoutingLastGrowthAt,
    setAgency,
    setIdols,
    setTrainees,
    setGroups,
    setRevenueHistory,
    setTransactions,
    setPromotionSchedule,
    setTrainingPlans,
    setCurrentWeek,
    setIsAgencyCreated,
    setActiveSlotId,
    setScoutingLastGrowthAt,
  });

  const { createAgency, recruitTrainee, refreshScoutingCandidates, spendAgencyMoney } = useAgencyActions({
    agency,
    idols,
    trainees,
    currentWeek,
    setAgency,
    setIdols,
    setTrainees,
    setIsAgencyCreated,
  });

  const { createGroup, addGroupMembers, updateGroupRoles } = useGroupActions({
    idols,
    groups,
    setIdols,
    setGroups,
  });

  const setTrainingPlan = (targetId: string, plan: Record<string, string>) => {
    setTrainingPlans(current => ({
      ...current,
      [targetId]: { ...plan },
    }));
  };

  const advanceWeek = () => {
    const city = getCityByName(cities, agency.city);
    // Single economy model: gross income (last month's income / 4), tax and
    // operations come from economy/service; training cost comes from the
    // progression tick. The ledger below logs exactly these amounts so the
    // wallet and Finance history always reconcile.
    const economy = applyWeeklyEconomyTick(agency, city, defaultEconomyModifiers, []);
    const progression = calculateWeeklyProgression({
      agency,
      city,
      idols,
      groups,
      trainingPlans,
      currentWeek,
    });

    const { grossWeekly, taxWeekly, operationsWeekly } = economy.weekly;

    setAgency(() => ({
      ...economy.agency,
      money: economy.agency.money - progression.trainingCostAmount + progression.weeklyMerchRevenue,
      monthlyIncome: progression.nextMonthlyIncome,
      reputation: progression.nextReputation,
      ranking: progression.nextRanking,
      energy: agency.energyMax,
    }));

    setIdols(progression.nextIdols);
    setGroups(prev => {
      // Remove departed members from groups
      if (progression.departedIdolIds.length === 0) return progression.nextGroups;
      const departed = new Set(progression.departedIdolIds);
      return progression.nextGroups.map(g => ({
        ...g,
        memberIds: g.memberIds.filter(id => !departed.has(id)),
        roleAssignments: g.roleAssignments
          ? Object.fromEntries(
              Object.entries(g.roleAssignments).filter(([, id]) => !departed.has(id)),
            ) as typeof g.roleAssignments
          : undefined,
      }));
    });
    setTrainees(current => rotateScoutingPool(current));
    setScoutingLastGrowthAt(new Date().toISOString());

    // Show event alerts grouped by severity
    const urgentEvents = progression.events.filter(e => e.type === 'injury' || e.type === 'contract_expired');
    const warningEvents = progression.events.filter(e =>
      e.type === 'contract_warning' || e.type === 'low_morale' || e.type === 'burnout' || e.type === 'low_health',
    );
    if (urgentEvents.length > 0) {
      const body = urgentEvents.map(e => `• ${e.message}`).join('\n');
      Alert.alert('⚠ Agency Alert', body);
    } else if (warningEvents.length > 0) {
      const body = warningEvents.map(e => `• ${e.message}`).join('\n');
      Alert.alert('Management Warning', body);
    }

    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const dateLabel = `Week ${currentWeek + 1}`;
      const entries: FinanceTransaction[] = [
        {
          id: baseId + 1,
          label: 'Weekly Income',
          type: 'income',
          amount: grossWeekly,
          date: dateLabel,
        },
        {
          id: baseId + 2,
          label: 'Weekly Operations',
          type: 'expense',
          amount: -(taxWeekly + operationsWeekly),
          date: dateLabel,
        },
      ];
      if (progression.trainingCostAmount > 0) {
        entries.push({
          id: baseId + 3,
          label: 'Training Costs',
          type: 'expense',
          amount: -progression.trainingCostAmount,
          date: dateLabel,
        });
      }
      if (progression.weeklyMerchRevenue > 0) {
        entries.push({
          id: baseId + 4,
          label: 'Merchandise Sales',
          type: 'income',
          amount: progression.weeklyMerchRevenue,
          date: dateLabel,
        });
      }
      return [...current, ...entries].slice(-40);
    });

    setRevenueHistory(current => {
      return [...current.slice(-200), progression.revenuePoint];
    });

    setCurrentWeek(week => week + 1);
  };

  const releaseDebut = (payload: ReleaseDebutPayload): ReleaseDebutResult => {
    const totalReleaseCost = RELEASE_QUALITY_COST[payload.quality] + payload.budget;
    if (agency.money < totalReleaseCost) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    const result = releaseDebutService(groups, idols, payload, currentWeek);
    if (!result.ok) return result;

    setGroups(current => current.map(g => (g.id === payload.groupId ? result.group : g)));
    setIdols(result.updatedIdols);
    setAgency(current => ({
      ...current,
      money: current.money + result.moneyDelta,
      reputation: Math.min(100, current.reputation + result.reputationDelta),
    }));
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const dateLabel = `Week ${currentWeek}`;
      const entries: FinanceTransaction[] = [];
      if (result.productionCost > 0) {
        entries.push({
          id: baseId + 1,
          label: `Production: ${payload.title}`,
          type: 'expense',
          amount: -result.productionCost,
          date: dateLabel,
        });
      }
      if (result.promotionCost > 0) {
        entries.push({
          id: baseId + 2,
          label: `Release Promo: ${payload.title}`,
          type: 'expense',
          amount: -result.promotionCost,
          date: dateLabel,
        });
      }
      if (result.projection.revenueGained > 0) {
        entries.push({
          id: baseId + 3,
          label: `Release Revenue: ${payload.title}`,
          type: 'income',
          amount: result.projection.revenueGained,
          date: dateLabel,
        });
      }
      return [...current, ...entries].slice(-40);
    });

    return { ok: true, projection: result.projection };
  };

  const runPromotion = (payload: RunPromotionPayload): RunPromotionResult => {
    const result = runPromotionAction(cities, agency, idols, groups, payload);
    if (!result.ok) {
      return result;
    }

    setGroups(current =>
      current.map(group => (group.id === result.groupId && result.updatedGroup ? result.updatedGroup : group)),
    );
    setIdols(result.updatedIdols);
    setAgency(current => ({
      ...current,
      money: current.money + result.netDelta,
      reputation: Math.min(100, current.reputation + result.reputationGained),
      energy: Math.max(0, current.energy - result.energySpent),
    }));
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const week = payload.week ?? currentWeek;
      const day =
        typeof payload.dayIndex === 'number'
          ? DAY_LABELS[Math.max(0, Math.min(6, payload.dayIndex))]
          : undefined;
      const dateLabel = day ? `Week ${week} · ${day}` : `Week ${week}`;
      const entries: FinanceTransaction[] = [];
      entries.push({
        id: baseId + 1,
        label: `Promotion Spend: ${result.promotionName} (${result.groupName})`,
        type: 'expense',
        amount: -result.totalCost,
        date: dateLabel,
      });
      if (result.revenueGained > 0) {
        entries.push({
          id: baseId + 2,
          label: `Promotion Revenue: ${result.promotionName} (${result.groupName})`,
          type: 'income',
          amount: result.revenueGained,
          date: dateLabel,
        });
      }
      return [...current, ...entries].slice(-40);
    });

    return result;
  };

  const addPromotionScheduleEntry = (entry: PromotionScheduleEntry) => {
    setPromotionSchedule(current => [...current, entry].slice(-120));
  };

  /** Take a market opportunity: spend cost, gain reputation + one-time income. */
  const takeMarketOpportunity = (
    actionId: string,
    cost: number,
    reputationGain: number,
    incomeGain: number,
  ): { ok: boolean; reason?: string } => {
    if (agency.money < cost) return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    setAgency(current => ({
      ...current,
      money: Math.max(0, current.money - cost + incomeGain),
      reputation: Math.min(100, current.reputation + reputationGain),
    }));
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const label = actionId
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const entries: FinanceTransaction[] = [
        { id: baseId + 1, label: `Market: ${label}`, type: 'expense', amount: -cost, date: `Week ${currentWeek}` },
      ];
      if (incomeGain > 0) {
        entries.push({ id: baseId + 2, label: `Market Return: ${label}`, type: 'income', amount: incomeGain, date: `Week ${currentWeek}` });
      }
      return [...current, ...entries].slice(-40);
    });
    return { ok: true };
  };
  const renewContract = (idolId: string): { ok: boolean; reason?: string; cost?: number } => {
    const idol = idols.find(i => i.id === idolId);
    if (!idol) return { ok: false, reason: 'NOT_FOUND' };
    const cost = Math.max(5_000_000, Math.min(50_000_000, Math.round(idol.popularity * 500_000)));
    if (agency.money < cost) return { ok: false, reason: 'INSUFFICIENT_FUNDS' };

    setAgency(current => ({ ...current, money: Math.max(0, current.money - cost) }));
    setIdols(current =>
      current.map(i =>
        i.id === idolId ? { ...i, contractExpiresWeek: (i.contractExpiresWeek ?? currentWeek) + 52 } : i,
      ),
    );
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      return [
        ...current,
        {
          id: baseId + 1,
          label: `Contract Renewal: ${idol.stageName}`,
          type: 'expense' as const,
          amount: -cost,
          date: `Week ${currentWeek}`,
        },
      ].slice(-40);
    });
    return { ok: true, cost };
  };

  return useMemo(
    () => ({
      agency,
      idols,
      trainees,
      cities,
      groups,
      revenueHistory,
      transactions,
      promotionSchedule,
      trainingPlans,
      currentWeek,
      conceptOptions,
      languageOptions,
      trainingTypes,
      isAgencyCreated,
      isHydrated,
      activeSlotId,
      scoutingLastGrowthAt,
      saveSlots,
      createAgency,
      recruitTrainee,
      refreshScoutingCandidates,
      spendAgencyMoney,
      createGroup,
      addGroupMembers,
      updateGroupRoles,
      setTrainingPlan,
      advanceWeek,
      releaseDebut,
      runPromotion,
      addPromotionScheduleEntry,
      renewContract,
      takeMarketOpportunity,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
      updateAgencyProfile: (updates: Partial<Pick<Agency, 'name' | 'ceoName'>>) => {
        setAgency(current => ({ ...current, ...updates }));
      },
    }),
    [
      agency,
      idols,
      trainees,
      groups,
      revenueHistory,
      transactions,
      promotionSchedule,
      trainingPlans,
      currentWeek,
      isAgencyCreated,
      isHydrated,
      activeSlotId,
      scoutingLastGrowthAt,
      saveSlots,
      createAgency,
      recruitTrainee,
      refreshScoutingCandidates,
      spendAgencyMoney,
      createGroup,
      addGroupMembers,
      updateGroupRoles,
      setTrainingPlan,
      advanceWeek,
      releaseDebut,
      runPromotion,
      addPromotionScheduleEntry,
      renewContract,
      takeMarketOpportunity,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    ],
  );
}
