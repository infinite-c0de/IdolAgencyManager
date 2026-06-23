import { useMemo, useState } from 'react';
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
import type { CreateAgencyPayload, RecruitResult, RefreshScoutingResult, ScoutingFilters } from '../features/agency';
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
import { releaseDebut as releaseDebutService } from '../features/groups';
import type { FinanceTransaction, RevenueHistoryPoint, SaveSlotSummary, TrainingPlans } from '../features/saves';
import { calculateWeeklyProgression } from '../features/simulation';
import type { Agency, Group, Idol, Trainee } from '../types';
import { useAgencyActions } from './useAgencyActions';
import { cloneInitialTrainees } from './gameStateHelpers';
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
  createGroup: (payload: CreateGroupPayload) => CreateGroupResult;
  addGroupMembers: (payload: AddGroupMembersPayload) => AddGroupMembersResult;
  updateGroupRoles: (payload: UpdateGroupRolesPayload) => UpdateGroupRolesResult;
  setTrainingPlan: (targetId: string, plan: Record<string, string>) => void;
  advanceWeek: () => void;
  releaseDebut: (payload: ReleaseDebutPayload) => ReleaseDebutResult;
  startNewGameInSlot: (slotId: number) => Promise<void>;
  loadGameFromSlot: (slotId: number) => Promise<'AgencyDashboard' | 'Onboarding' | false>;
  deleteSaveSlot: (slotId: number) => Promise<void>;
  resetGame: () => Promise<void>;
};

export function useGameState(): GameState {
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
    setTrainingPlans,
    setCurrentWeek,
    setIsAgencyCreated,
    setActiveSlotId,
    setScoutingLastGrowthAt,
  });

  const { createAgency, recruitTrainee, refreshScoutingCandidates } = useAgencyActions({
    agency,
    idols,
    trainees,
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
    const economy = applyWeeklyEconomyTick(agency, city, defaultEconomyModifiers, []);
    const progression = calculateWeeklyProgression({
      agency,
      city,
      idols,
      groups,
      trainingPlans,
      currentWeek,
    });

    setAgency(current => ({
      ...economy.agency,
      monthlyIncome: progression.nextMonthlyIncome,
      reputation: progression.nextReputation,
      ranking: progression.nextRanking,
      money: economy.agency.money - progression.trainingCostAmount,
    }));

    setIdols(progression.nextIdols);
    setGroups(progression.nextGroups);

    const expenseAmount = Math.round(economy.weekly.taxWeekly + economy.weekly.operationsWeekly);
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const dateLabel = `Week ${currentWeek + 1}`;
      const weeklyIncome: FinanceTransaction = {
        id: baseId + 1,
        label: 'Weekly Income',
        type: 'income',
        amount: progression.weeklyIncomeAmount,
        date: dateLabel,
      };
      const weeklyOperations: FinanceTransaction = {
        id: baseId + 2,
        label: 'Weekly Operations',
        type: 'expense',
        amount: -Math.max(expenseAmount, progression.weeklyExpenseAmount),
        date: dateLabel,
      };
      const entries: FinanceTransaction[] = [weeklyIncome, weeklyOperations];
      if (progression.trainingCostAmount > 0) {
        entries.push({
          id: baseId + 3,
          label: 'Training Costs',
          type: 'expense',
          amount: -progression.trainingCostAmount,
          date: dateLabel,
        });
      }
      return [...current, ...entries].slice(-40);
    });

    setRevenueHistory(current => {
      return [...current.slice(-8), progression.revenuePoint];
    });

    setCurrentWeek(week => week + 1);
  };

  const releaseDebut = (payload: ReleaseDebutPayload): ReleaseDebutResult => {
    const result = releaseDebutService(groups, idols, payload, currentWeek);
    if (!result.ok) return result;

    setGroups(current => current.map(g => (g.id === payload.groupId ? result.group : g)));
    setAgency(current => ({
      ...current,
      money: current.money + result.moneyDelta,
      reputation: Math.min(100, current.reputation + result.reputationDelta),
    }));
    setTransactions(current => {
      const baseId = current[current.length - 1]?.id ?? 0;
      const dateLabel = `Week ${currentWeek}`;
      const entries: FinanceTransaction[] = [];
      if (payload.budget > 0) {
        entries.push({ id: baseId + 1, label: `Release: ${payload.title}`, type: 'expense', amount: -payload.budget, date: dateLabel });
      }
      if (result.projection.revenueGained > 0) {
        entries.push({ id: baseId + 2, label: `Release Revenue: ${payload.title}`, type: 'income', amount: result.projection.revenueGained, date: dateLabel });
      }
      return [...current, ...entries].slice(-40);
    });

    return { ok: true, projection: result.projection };
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
      createGroup,
      addGroupMembers,
      updateGroupRoles,
      setTrainingPlan,
      advanceWeek,
      releaseDebut,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    }),
    [
      agency,
      idols,
      trainees,
      groups,
      revenueHistory,
      transactions,
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
      createGroup,
      addGroupMembers,
      updateGroupRoles,
      setTrainingPlan,
      advanceWeek,
      releaseDebut,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    ],
  );
}
