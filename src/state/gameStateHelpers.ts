import { initialAgency, traineeArtPool } from '../data/gameData';
import { generateScoutingPoolFromArtPool } from '../features/idols';
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

export function cloneInitialTrainees(): Trainee[] {
  return generateScoutingPoolFromArtPool(traineeArtPool).map(trainee => ({
    ...trainee,
    languages: [...trainee.languages],
    gradient: [...trainee.gradient],
    personalityProfile: trainee.personalityProfile
      ? {
          ...trainee.personalityProfile,
          traits: { ...trainee.personalityProfile.traits },
        }
      : undefined,
  }));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function unlockWeeklyScoutingCandidates(trainees: Trainee[], weeks: number): Trainee[] {
  if (weeks <= 0) {
    return trainees;
  }

  let next = trainees.map(trainee => ({ ...trainee }));

  for (let i = 0; i < weeks; i += 1) {
    const hiddenIndexes = next
      .map((trainee, index) => ({ trainee, index }))
      .filter(({ trainee }) => trainee.isScoutingVisible === false)
      .map(({ index }) => index);

    if (hiddenIndexes.length === 0) {
      break;
    }

    const unlockCount = Math.min(hiddenIndexes.length, randInt(1, 2));
    for (let j = 0; j < unlockCount; j += 1) {
      const pickIndex = randInt(0, hiddenIndexes.length - 1);
      const target = hiddenIndexes.splice(pickIndex, 1)[0];
      next[target] = { ...next[target], isScoutingVisible: true };
    }
  }

  return next;
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

export function createInitialSave(slotId: number): SaveData {
  const now = new Date().toISOString();
  return {
    agency: cloneInitialAgency(),
    idols: [],
    trainees: cloneInitialTrainees(),
    groups: [],
    isAgencyCreated: false,
    activeSlotId: slotId,
    scoutingLastGrowthAt: now,
    updatedAt: now,
  };
}
