import { initialAgency, initialIdols, initialTrainees } from '../../data/gameData';
import type { Idol, Trainee } from '../../types';
import type { SaveData } from './types';

function cloneDefaultIdols(): Idol[] {
  return initialIdols.map(idol => ({
    ...idol,
    languages: [...idol.languages],
    gradient: [...idol.gradient],
    stats: { ...idol.stats },
  }));
}

function cloneDefaultTrainees(): Trainee[] {
  return initialTrainees.map(trainee => ({
    ...trainee,
    languages: [...trainee.languages],
    gradient: [...trainee.gradient],
  }));
}

function cloneDefaultAgency() {
  return { ...initialAgency };
}

export function createDefaultSaveData(slotId: number): SaveData {
  return {
    agency: cloneDefaultAgency(),
    idols: cloneDefaultIdols(),
    trainees: cloneDefaultTrainees(),
    isAgencyCreated: false,
    activeSlotId: slotId,
    updatedAt: new Date().toISOString(),
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
  const isAgencyCreated = typeof raw.isAgencyCreated === 'boolean' ? raw.isAgencyCreated : defaults.isAgencyCreated;
  const activeSlotId =
    typeof raw.activeSlotId === 'number' && Number.isFinite(raw.activeSlotId)
      ? raw.activeSlotId
      : defaults.activeSlotId;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : defaults.updatedAt;

  return {
    agency,
    idols,
    trainees,
    isAgencyCreated,
    activeSlotId,
    updatedAt,
  };
}
