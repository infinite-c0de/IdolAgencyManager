import { useMemo, useState } from 'react';
import {
  initialAgency,
  cities,
  initialGroups as baseGroups,
  initialRevenueHistory as revenueHistory,
  initialTransactions as transactions,
  conceptOptions,
  languageOptions,
  trainingTypes,
} from '../data/gameData';
import type { CreateAgencyPayload, RecruitResult } from '../features/agency';
import type { CreateGroupPayload, CreateGroupResult } from '../features/groups';
import type { SaveSlotSummary } from '../features/saves';
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
  revenueHistory: typeof revenueHistory;
  transactions: typeof transactions;
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
  createGroup: (payload: CreateGroupPayload) => CreateGroupResult;
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
    isAgencyCreated,
    activeSlotId,
    scoutingLastGrowthAt,
    setAgency,
    setIdols,
    setTrainees,
    setGroups,
    setIsAgencyCreated,
    setActiveSlotId,
    setScoutingLastGrowthAt,
  });

  const { createAgency, recruitTrainee } = useAgencyActions({
    agency,
    idols,
    trainees,
    setAgency,
    setIdols,
    setTrainees,
    setIsAgencyCreated,
  });

  const { createGroup } = useGroupActions({
    idols,
    groups,
    setIdols,
    setGroups,
  });

  return useMemo(
    () => ({
      agency,
      idols,
      trainees,
      cities,
      groups,
      revenueHistory,
      transactions,
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
      createGroup,
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
      isAgencyCreated,
      isHydrated,
      activeSlotId,
      scoutingLastGrowthAt,
      saveSlots,
      createAgency,
      recruitTrainee,
      createGroup,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    ],
  );
}
