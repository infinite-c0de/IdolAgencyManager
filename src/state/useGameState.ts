import { useMemo, useState } from 'react';
import {
  initialAgency,
  initialIdols,
  initialTrainees,
  cities,
  groups as baseGroups,
  revenueHistory,
  schedule,
  promotions,
  rivals,
  markets,
  opportunities,
  transactions,
  agencyRadar,
  conceptOptions,
  languageOptions,
  trainingTypes,
} from '../data/gameData';
import type { CreateAgencyPayload, RecruitResult } from '../features/agency';
import type { SaveSlotSummary } from '../features/saves';
import type { Agency, Idol, Trainee } from '../types';
import { useAgencyActions } from './useAgencyActions';
import { useSaveLifecycle } from './useSaveLifecycle';

export type SaveSlot = SaveSlotSummary;

export type GameState = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  cities: typeof cities;
  groups: typeof baseGroups;
  revenueHistory: typeof revenueHistory;
  schedule: typeof schedule;
  promotions: typeof promotions;
  rivals: typeof rivals;
  markets: typeof markets;
  opportunities: typeof opportunities;
  transactions: typeof transactions;
  agencyRadar: typeof agencyRadar;
  conceptOptions: typeof conceptOptions;
  languageOptions: typeof languageOptions;
  trainingTypes: typeof trainingTypes;
  isAgencyCreated: boolean;
  isHydrated: boolean;
  activeSlotId: number | null;
  saveSlots: SaveSlot[];
  createAgency: (payload: CreateAgencyPayload) => boolean;
  recruitTrainee: (traineeId: string) => RecruitResult;
  startNewGameInSlot: (slotId: number) => Promise<void>;
  loadGameFromSlot: (slotId: number) => Promise<'AgencyDashboard' | 'Onboarding' | false>;
  deleteSaveSlot: (slotId: number) => Promise<void>;
  resetGame: () => Promise<void>;
};

export function useGameState(): GameState {
  const [agency, setAgency] = useState<Agency>(initialAgency);
  const [idols, setIdols] = useState<Idol[]>(initialIdols);
  const [trainees, setTrainees] = useState<Trainee[]>(initialTrainees);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [isAgencyCreated, setIsAgencyCreated] = useState(false);

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
    isAgencyCreated,
    activeSlotId,
    setAgency,
    setIdols,
    setTrainees,
    setIsAgencyCreated,
    setActiveSlotId,
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

  return useMemo(
    () => ({
      agency,
      idols,
      trainees,
      cities,
      groups: baseGroups,
      revenueHistory,
      schedule,
      promotions,
      rivals,
      markets,
      opportunities,
      transactions,
      agencyRadar,
      conceptOptions,
      languageOptions,
      trainingTypes,
      isAgencyCreated,
      isHydrated,
      activeSlotId,
      saveSlots,
      createAgency,
      recruitTrainee,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    }),
    [
      agency,
      idols,
      trainees,
      isAgencyCreated,
      isHydrated,
      activeSlotId,
      saveSlots,
      createAgency,
      recruitTrainee,
      startNewGameInSlot,
      loadGameFromSlot,
      deleteSaveSlot,
      resetGame,
    ],
  );
}
