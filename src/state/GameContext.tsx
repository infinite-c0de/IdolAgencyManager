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
  createAgency: (payload: CreateAgencyPayload) => void;
  recruitTrainee: (traineeId: string) => RecruitResult;
  resetGame: () => Promise<void>;
};

const GameContext = createContext<GameState | null>(null);
const SAVE_KEY = 'idol_agency_save_v1';
const SAVE_VERSION = 1;

type SaveData = {
  version: number;
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  isAgencyCreated: boolean;
};

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

export function GameProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = useState<Agency>(initialAgency);
  const [idols, setIdols] = useState<Idol[]>(initialIdols);
  const [trainees, setTrainees] = useState<Trainee[]>(initialTrainees);
  const [isAgencyCreated, setIsAgencyCreated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVE_KEY);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw) as SaveData;
        if (parsed?.version !== SAVE_VERSION) {
          return;
        }

        if (!parsed.agency || !Array.isArray(parsed.idols) || !Array.isArray(parsed.trainees)) {
          return;
        }

        if (!active) {
          return;
        }

        setAgency(parsed.agency);
        setIdols(parsed.idols);
        setTrainees(withCurrentTraineeAssets(parsed.trainees));
        setIsAgencyCreated(Boolean(parsed.isAgencyCreated));
      } catch {
        // Ignore corrupted or missing saves and continue with defaults.
      } finally {
        if (active) {
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
    if (!isHydrated) {
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
      };
      AsyncStorage.setItem(SAVE_KEY, JSON.stringify(payload)).catch(() => {
        // Ignore save errors for now; app remains playable.
      });
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [agency, idols, trainees, isAgencyCreated, isHydrated]);

  const resetGame = async () => {
    setAgency(initialAgency);
    setIdols(initialIdols);
    setTrainees(initialTrainees);
    setIsAgencyCreated(false);
    await AsyncStorage.removeItem(SAVE_KEY);
  };

  const createAgency = ({ agencyName, ceoName, cityId }: CreateAgencyPayload) => {
    const pickedCity = cities.find(c => c.id === cityId) ?? cities[0];
    const normalizedName = agencyName.trim().length > 0 ? agencyName.trim() : initialAgency.name;
    const normalizedCeo = ceoName.trim().length > 0 ? ceoName.trim() : 'CEO';

    setAgency(current => ({
      ...current,
      name: normalizedName.toUpperCase(),
      ceoName: normalizedCeo,
      city: pickedCity.name,
      money: pickedCity.startingBudget,
      reputation: 50,
      monthlyIncome: Math.round(140_000_000 * pickedCity.revenue),
    }));
    setIsAgencyCreated(true);
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
      createAgency,
      recruitTrainee,
      resetGame,
    }),
    [agency, idols, trainees, isAgencyCreated, isHydrated],
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
