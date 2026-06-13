import { initialAgency, initialTrainees } from '../data/gameData';
import type { SaveData } from '../features/saves';
import type { Agency, Idol, Trainee } from '../types';

export function cloneInitialAgency(): Agency {
  return { ...initialAgency };
}

export function cloneInitialTrainees(): Trainee[] {
  return initialTrainees.map(trainee => ({
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
    idols: [],
    trainees: cloneInitialTrainees(),
    groups: [],
    isAgencyCreated: false,
    activeSlotId: slotId,
    updatedAt: new Date().toISOString(),
  };
}
