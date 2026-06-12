import { initialAgency, initialIdols, initialTrainees } from '../data/gameData';
import type { SaveData } from '../features/saves';
import type { Agency, Idol, Trainee } from '../types';

export function cloneInitialAgency(): Agency {
  return { ...initialAgency };
}

export function cloneInitialIdols(): Idol[] {
  return initialIdols.map(idol => ({
    ...idol,
    languages: [...idol.languages],
    gradient: [...idol.gradient],
    stats: { ...idol.stats },
  }));
}

export function cloneInitialTrainees(): Trainee[] {
  return initialTrainees.map(trainee => ({
    ...trainee,
    languages: [...trainee.languages],
    gradient: [...trainee.gradient],
  }));
}

export function withCurrentTraineeAssets(trainees: Trainee[]) {
  return trainees.map(trainee => {
    const current = initialTrainees.find(t => t.id === trainee.id);
    return {
      ...trainee,
      image: trainee.image ?? current?.image,
    };
  });
}

export function createInitialSave(slotId: number): SaveData {
  return {
    agency: cloneInitialAgency(),
    idols: cloneInitialIdols(),
    trainees: cloneInitialTrainees(),
    isAgencyCreated: false,
    activeSlotId: slotId,
    updatedAt: new Date().toISOString(),
  };
}
