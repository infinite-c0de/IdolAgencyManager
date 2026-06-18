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
import type { CreateAgencyPayload, RecruitResult, RefreshScoutingResult } from '../features/agency';
import { getCityByName } from '../features/cities';
import { applyWeeklyEconomyTick, defaultEconomyModifiers } from '../features/economy';
import type {
  AddGroupMembersPayload,
  AddGroupMembersResult,
  CreateGroupPayload,
  CreateGroupResult,
} from '../features/groups';
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
  refreshScoutingCandidates: (activeFilter: string, overrideCost?: number) => RefreshScoutingResult;
  createGroup: (payload: CreateGroupPayload) => CreateGroupResult;
  addGroupMembers: (payload: AddGroupMembersPayload) => AddGroupMembersResult;
  setTrainingPlan: (targetId: string, plan: Record<string, string>) => void;
  advanceWeek: () => void;
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

  const { createGroup, addGroupMembers } = useGroupActions({
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
      return [
        ...current,
        weeklyIncome,
        weeklyOperations,
      ].slice(-40);
    });

    setRevenueHistory(current => {
      return [...current.slice(-8), progression.revenuePoint];
    });

    setCurrentWeek(week => week + 1);
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
      setTrainingPlan,
      advanceWeek,
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
      setTrainingPlan,
      advanceWeek,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    ],
  );
}
