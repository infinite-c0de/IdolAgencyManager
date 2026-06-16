import { initialAgency, traineeArtPool } from '../../data/gameData';
import { generateScoutingPoolFromArtPool } from '../idols';
import type { Group, Idol, Trainee } from '../../types';
import type { SaveData } from './types';

function cloneDefaultTrainees(): Trainee[] {
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

function cloneDefaultAgency() {
  return { ...initialAgency };
}

export function createDefaultSaveData(slotId: number): SaveData {
  const now = new Date().toISOString();
  return {
    agency: cloneDefaultAgency(),
    idols: [],
    trainees: cloneDefaultTrainees(),
    groups: [],
    isAgencyCreated: false,
    activeSlotId: slotId,
    scoutingLastGrowthAt: now,
    updatedAt: now,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeSaveData(raw: unknown, slotId: number): SaveData | null {
  if (!isRecord(raw)) {
    return null;
  }

  const defaults = createDefaultSaveData(slotId);
  const agency = isRecord(raw.agency) ? { ...defaults.agency, ...raw.agency } : defaults.agency;
  const idols = Array.isArray(raw.idols) ? (raw.idols as Idol[]) : defaults.idols;
  const trainees = Array.isArray(raw.trainees) ? (raw.trainees as Trainee[]) : defaults.trainees;
  const groups = Array.isArray(raw.groups) ? (raw.groups as Group[]) : defaults.groups;
  const isAgencyCreated = typeof raw.isAgencyCreated === 'boolean' ? raw.isAgencyCreated : defaults.isAgencyCreated;
  const activeSlotId =
    typeof raw.activeSlotId === 'number' && Number.isFinite(raw.activeSlotId)
      ? raw.activeSlotId
      : defaults.activeSlotId;
  const scoutingLastGrowthAt =
    typeof raw.scoutingLastGrowthAt === 'string'
      ? raw.scoutingLastGrowthAt
      : defaults.scoutingLastGrowthAt;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : defaults.updatedAt;

  return {
    agency,
    idols,
    trainees,
    groups,
    isAgencyCreated,
    activeSlotId,
    scoutingLastGrowthAt,
    updatedAt,
  };
}
