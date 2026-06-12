import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import type { Agency, Idol, Trainee } from '../types';

type CreateAgencyPayload = {
  agencyName: string;
  ceoName: string;
  cityId: string;
};

type RecruitResult =
  | { ok: true; idolName: string }
  | { ok: false; reason: 'NOT_FOUND' | 'INSUFFICIENT_FUNDS' | 'ALREADY_RECRUITED' };

export type SaveSlot = {
  id: number;
  label: string;
  hasSave: boolean;
  agencyName?: string;
  city?: string;
  updatedAt?: string;
};

type GameState = {
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

const GameContext = createContext<GameState | null>(null);
const LEGACY_SAVE_KEY = 'idol_agency_save_v1';
const SLOT_COUNT = 3;
const SAVE_VERSION = 1;

const slotKey = (slotId: number) => `idol_agency_slot_${slotId}_v1`;

type SaveData = {
  version: number;
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  isAgencyCreated: boolean;
  activeSlotId: number;
  updatedAt: string;
};

function cloneInitialAgency(): Agency {
  return { ...initialAgency };
}

function cloneInitialIdols(): Idol[] {
  return initialIdols.map(idol => ({
    ...idol,
    languages: [...idol.languages],
    gradient: [...idol.gradient],
    stats: { ...idol.stats },
  }));
}

function cloneInitialTrainees(): Trainee[] {
  return initialTrainees.map(trainee => ({
    ...trainee,
    languages: [...trainee.languages],
    gradient: [...trainee.gradient],
  }));
}

function withCurrentTraineeAssets(trainees: Trainee[]) {
  return trainees.map(trainee => {
    const current = initialTrainees.find(t => t.id === trainee.id);
    return {
      ...trainee,
      image: trainee.image ?? current?.image,
    };
  });
}

function traineeToIdol(trainee: Trainee): Idol {
  const stage = trainee.name.trim();
  const initialBase = stage.toLowerCase().replace(/\s+/g, '-');
  return {
    id: `${initialBase}-${Date.now()}`,
    stageName: stage,
    fullName: stage,
    age: trainee.age,
    dob: 'TBD',
    nationality: trainee.nationality,
    flag: trainee.flag,
    languages: trainee.languages,
    personality: trainee.personality,
    trainingYears: 0,
    role: `${trainee.skill} Trainee`,
    status: 'Trainee',
    popularity: Math.round(40 + trainee.potential * 0.35),
    rank: 99,
    gradient: trainee.gradient,
    image: trainee.image,
    stats: {
      vocal: trainee.skill === 'Vocal' ? 76 : 58,
      dance: trainee.skill === 'Dance' ? 76 : 58,
      rap: trainee.skill === 'Rap' ? 74 : 56,
      visual: trainee.skill === 'Visual' ? 80 : 62,
      charisma: trainee.skill === 'Charisma' ? 82 : 60,
      stamina: 64,
      variety: 52,
      acting: 50,
    },
    health: 84,
    morale: 78,
    energy: 86,
  };
}

function createInitialSave(slotId: number): SaveData {
  return {
    version: SAVE_VERSION,
    agency: cloneInitialAgency(),
    idols: cloneInitialIdols(),
    trainees: cloneInitialTrainees(),
    isAgencyCreated: false,
    activeSlotId: slotId,
    updatedAt: new Date().toISOString(),
  };
}

function applySaveAssets(save: SaveData): SaveData {
  return {
    ...save,
    trainees: withCurrentTraineeAssets(save.trainees),
  };
}

function isValidSave(save: SaveData | null): save is SaveData {
  return Boolean(
    save?.version === SAVE_VERSION &&
      save.agency &&
      Array.isArray(save.idols) &&
      Array.isArray(save.trainees),
  );
}

function hasAgencyProgress(save: SaveData) {
  return (
    save.isAgencyCreated ||
    save.agency.name !== initialAgency.name ||
    save.agency.ceoName !== initialAgency.ceoName ||
    save.agency.city !== initialAgency.city ||
    save.agency.money !== initialAgency.money
  );
}

async function readSlotSave(slotId: number) {
  try {
    const raw = await AsyncStorage.getItem(slotKey(slotId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SaveData;
    return isValidSave(parsed) ? applySaveAssets(parsed) : null;
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = useState<Agency>(initialAgency);
  const [idols, setIdols] = useState<Idol[]>(initialIdols);
  const [trainees, setTrainees] = useState<Trainee[]>(initialTrainees);
  const [isAgencyCreated, setIsAgencyCreated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(
    Array.from({ length: SLOT_COUNT }, (_, index) => ({
      id: index + 1,
      label: `Slot ${index + 1}`,
      hasSave: false,
    })),
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshSaveSlots = async () => {
    const slots = await Promise.all(
      Array.from({ length: SLOT_COUNT }, async (_, index) => {
        const id = index + 1;
        const save = await readSlotSave(id);
        return {
          id,
          label: `Slot ${id}`,
          hasSave: Boolean(save),
          agencyName: save?.agency.name,
          city: save?.agency.city,
          updatedAt: save?.updatedAt,
        };
      }),
    );
    setSaveSlots(slots);
  };

  const applySave = (save: SaveData) => {
    setAgency({ ...save.agency });
    setIdols(
      save.idols.map(idol => ({
        ...idol,
        languages: [...idol.languages],
        gradient: [...idol.gradient],
        stats: { ...idol.stats },
      })),
    );
    setTrainees(
      withCurrentTraineeAssets(save.trainees).map(trainee => ({
        ...trainee,
        languages: [...trainee.languages],
        gradient: [...trainee.gradient],
      })),
    );
    setIsAgencyCreated(Boolean(save.isAgencyCreated));
    setActiveSlotId(save.activeSlotId);
  };

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const legacyRaw = await AsyncStorage.getItem(LEGACY_SAVE_KEY);
        const firstSlot = await readSlotSave(1);
        if (!firstSlot && legacyRaw) {
          const legacy = JSON.parse(legacyRaw) as SaveData;
          if (isValidSave(legacy)) {
            await AsyncStorage.setItem(
              slotKey(1),
              JSON.stringify({
                ...applySaveAssets(legacy),
                activeSlotId: 1,
                updatedAt: new Date().toISOString(),
              }),
            );
            await AsyncStorage.removeItem(LEGACY_SAVE_KEY);
          }
        }
      } catch {
        // Ignore corrupted or missing saves and continue with defaults.
      } finally {
        if (active) {
          await refreshSaveSlots();
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    setTrainees(current => withCurrentTraineeAssets(current));
  }, [isHydrated]);

  useEffect(() => {
    const slotId = activeSlotId;
    if (!isHydrated || slotId === null) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const payload: SaveData = {
        version: SAVE_VERSION,
        agency,
        idols,
        trainees,
        isAgencyCreated,
        activeSlotId: slotId,
        updatedAt: new Date().toISOString(),
      };
      AsyncStorage.setItem(slotKey(slotId), JSON.stringify(payload)).then(refreshSaveSlots).catch(() => {
        // Ignore save errors for now; app remains playable.
      });
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [agency, idols, trainees, isAgencyCreated, isHydrated, activeSlotId]);

  const resetGame = async () => {
    setAgency(cloneInitialAgency());
    setIdols(cloneInitialIdols());
    setTrainees(cloneInitialTrainees());
    setIsAgencyCreated(false);
    setActiveSlotId(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await Promise.all(
      Array.from({ length: SLOT_COUNT }, (_, index) => AsyncStorage.removeItem(slotKey(index + 1))),
    );
    await AsyncStorage.removeItem(LEGACY_SAVE_KEY);
    await refreshSaveSlots();
  };

  const startNewGameInSlot = async (slotId: number) => {
    const save = createInitialSave(slotId);
    applySave(save);
    await AsyncStorage.setItem(slotKey(slotId), JSON.stringify(save));
    await refreshSaveSlots();
  };

  const loadGameFromSlot = async (slotId: number) => {
    const save = await readSlotSave(slotId);
    if (!save) {
      return false;
    }

    const created = hasAgencyProgress(save);
    const normalizedSave = created && !save.isAgencyCreated ? { ...save, isAgencyCreated: true } : save;

    applySave(normalizedSave);
    if (normalizedSave !== save) {
      await AsyncStorage.setItem(slotKey(slotId), JSON.stringify(normalizedSave));
    }
    await refreshSaveSlots();
    return created ? 'AgencyDashboard' : 'Onboarding';
  };

  const deleteSaveSlot = async (slotId: number) => {
    await AsyncStorage.removeItem(slotKey(slotId));

    if (activeSlotId === slotId) {
      setAgency(cloneInitialAgency());
      setIdols(cloneInitialIdols());
      setTrainees(cloneInitialTrainees());
      setIsAgencyCreated(false);
      setActiveSlotId(null);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    }

    await refreshSaveSlots();
  };

  const createAgency = ({ agencyName, ceoName, cityId }: CreateAgencyPayload) => {
    const pickedCity = cities.find(c => c.id === cityId) ?? cities[0];
    const normalizedName = agencyName.trim();
    const normalizedCeo = ceoName.trim();

    if (!normalizedName || !normalizedCeo) {
      return false;
    }

    setAgency(() => ({
      ...cloneInitialAgency(),
      name: normalizedName.toUpperCase(),
      ceoName: normalizedCeo,
      city: pickedCity.name,
      money: pickedCity.startingBudget,
      reputation: Math.max(0, Math.min(100, 50 + pickedCity.localReputationBoost)),
      monthlyIncome: Math.round(140_000_000 * pickedCity.revenue * (1 + pickedCity.domesticStreamingBonus)),
    }));
    setIsAgencyCreated(true);
    return true;
  };

  const recruitTrainee = (traineeId: string): RecruitResult => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (!trainee) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    const alreadyExists = idols.some(idol => idol.stageName.toLowerCase() === trainee.name.toLowerCase());
    if (alreadyExists) {
      return { ok: false, reason: 'ALREADY_RECRUITED' };
    }

    if (agency.money < trainee.cost) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }

    const created = traineeToIdol(trainee);
    setIdols(current => [created, ...current]);
    setTrainees(current => current.filter(t => t.id !== traineeId));
    setAgency(current => ({ ...current, money: current.money - trainee.cost }));
    return { ok: true, idolName: trainee.name };
  };

  const value = useMemo(
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
    [agency, idols, trainees, isAgencyCreated, isHydrated, activeSlotId, saveSlots],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
