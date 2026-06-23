import {
  initialAgency,
  initialRevenueHistory,
  initialTransactions,
  traineeArtPool,
} from '../data/gameData';
import { generateScoutingPoolFromArtPool, normalizePersonalityProfile } from '../features/idols';
import type { SaveData } from '../features/saves';
import type { Agency, Idol, Trainee } from '../types';

const LEGACY_ART_KEY_MAP: Record<string, number> = {
  anh: 1,
  joon: 2,
  lena: 3,
  mina: 4,
  narin: 5,
  riku: 6,
  sora: 7,
  tao: 8,
  wei: 9,
  yara: 10,
  aria: 11,
  renjun: 12,
  mai: 13,
  theo: 14,
  sky: 15,
  hyeri: 16,
  kaito: 17,
  xinyi: 18,
  pim: 19,
  minhan: 20,
  akari: 21,
  donghyun: 22,
  quynh: 23,
  ming: 24,
  fah: 25,
  yejun: 26,
  nana: 27,
  lan: 28,
  tonkla: 29,
  trang: 30,
  hyerin: 31,
  shion: 32,
  yue: 33,
  mint: 34,
  duy: 35,
  seojin: 36,
  ren: 37,
  jia: 38,
  namfon: 39,
  baominh: 40,
};

export function cloneInitialAgency(): Agency {
  return { ...initialAgency };
}

export function cloneInitialRevenueHistory() {
  return initialRevenueHistory.map(point => ({ ...point }));
}

export function cloneInitialTransactions() {
  return initialTransactions.map(transaction => ({ ...transaction }));
}

export function createInitialTrainingPlans() {
  return { SOLO_DEFAULT: {} as Record<string, string> };
}

/**
 * Rotates which scouting candidates are visible, favouring the least-recently
 * shown trainees. Called each week so the finite pool refreshes over time
 * (the "scoutingLastGrowthAt" cadence) without spending money.
 */
export function rotateScoutingPool(trainees: Trainee[], count = 10): Trainee[] {
  if (trainees.length === 0) {
    return trainees;
  }
  const target = Math.min(count, trainees.length);
  const ranked = trainees
    .map((trainee, index) => ({ trainee, index }))
    .sort((a, b) => {
      const diff = (a.trainee.shownCount ?? 0) - (b.trainee.shownCount ?? 0);
      return diff !== 0 ? diff : Math.random() - 0.5;
    });
  const selected = new Set(ranked.slice(0, target).map(item => item.index));
  return trainees.map((trainee, index) =>
    selected.has(index)
      ? { ...trainee, isScoutingVisible: true, shownCount: (trainee.shownCount ?? 0) + 1 }
      : { ...trainee, isScoutingVisible: false },
  );
}

export function cloneInitialTrainees(): Trainee[] {
  return generateScoutingPoolFromArtPool(traineeArtPool).map(trainee => ({
    ...trainee,
    languages: [...trainee.languages],
    gradient: [...trainee.gradient],
    personalityProfile: trainee.personalityProfile
      ? (() => {
          const normalizedProfile = normalizePersonalityProfile(
            trainee.personalityProfile,
            trainee.personality,
          );
          return {
            ...normalizedProfile,
            traits: { ...normalizedProfile.traits },
          };
        })()
      : undefined,
  }));
}

export function withCurrentTraineeAssets(trainees: Trainee[]) {
  return trainees.map(trainee => {
    const numericArtKey =
      typeof trainee.artKey === 'number'
        ? trainee.artKey
        : typeof trainee.artKey === 'string'
          ? (LEGACY_ART_KEY_MAP[trainee.artKey] ?? Number(trainee.artKey))
          : undefined;
    const current = traineeArtPool.find(
      art => (numericArtKey !== undefined && Number.isFinite(numericArtKey) ? art.artKey === numericArtKey : false),
    );
    return {
      ...trainee,
      image: trainee.image ?? current?.image,
    };
  });
}

function identityKey(value?: string) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sanitizeScoutingRoster(trainees: Trainee[], idols: Idol[]) {
  const usedArtKeys = new Set(
    idols
      .map(idol =>
        idol.artKey !== undefined && Number.isFinite(Number(idol.artKey)) ? Number(idol.artKey) : undefined,
      )
      .filter((value): value is number => value !== undefined),
  );
  const usedStageNames = new Set(idols.map(idol => identityKey(idol.stageName)).filter(Boolean));
  const usedFullNames = new Set(idols.map(idol => identityKey(idol.fullName)).filter(Boolean));
  const keptTraineeIds = new Set<string>();
  const next: Trainee[] = [];

  for (const trainee of trainees) {
    if (keptTraineeIds.has(trainee.id)) {
      continue;
    }
    const numericArtKey =
      trainee.artKey !== undefined && Number.isFinite(Number(trainee.artKey))
        ? Number(trainee.artKey)
        : undefined;
    if (numericArtKey !== undefined && usedArtKeys.has(numericArtKey)) {
      continue;
    }
    const stageKey = identityKey(trainee.name);
    const fullNameKey = identityKey(trainee.fullName);
    if ((stageKey && usedStageNames.has(stageKey)) || (fullNameKey && usedFullNames.has(fullNameKey))) {
      continue;
    }

    keptTraineeIds.add(trainee.id);
    if (numericArtKey !== undefined) {
      usedArtKeys.add(numericArtKey);
    }
    if (stageKey) {
      usedStageNames.add(stageKey);
    }
    if (fullNameKey) {
      usedFullNames.add(fullNameKey);
    }
    next.push(trainee);
  }

  return next;
}

export function createInitialSave(slotId: number): SaveData {
  const now = new Date().toISOString();
  return {
    agency: cloneInitialAgency(),
    idols: [],
    trainees: cloneInitialTrainees(),
    groups: [],
    revenueHistory: cloneInitialRevenueHistory(),
    transactions: cloneInitialTransactions(),
    promotionSchedule: [],
    trainingPlans: createInitialTrainingPlans(),
    currentWeek: 1,
    isAgencyCreated: false,
    activeSlotId: slotId,
    scoutingLastGrowthAt: now,
    updatedAt: now,
  };
}
