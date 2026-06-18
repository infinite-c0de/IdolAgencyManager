import {
  initialAgency,
  initialRevenueHistory,
  initialTransactions,
  traineeArtPool,
} from '../../data/gameData';
import { generateScoutingPoolFromArtPool, normalizePersonalityProfile } from '../idols';
import type { Group, Idol, Trainee } from '../../types';
import type { FinanceTransaction, RevenueHistoryPoint, SaveData, TrainingPlans } from './types';

function cloneDefaultTrainees(): Trainee[] {
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

function cloneDefaultAgency() {
  return { ...initialAgency };
}

function cloneDefaultRevenueHistory(): RevenueHistoryPoint[] {
  return initialRevenueHistory.map(point => ({ ...point }));
}

function cloneDefaultTransactions(): FinanceTransaction[] {
  return initialTransactions.map(transaction => ({ ...transaction }));
}

function createDefaultTrainingPlans(): TrainingPlans {
  return { SOLO_DEFAULT: {} };
}

export function createDefaultSaveData(slotId: number): SaveData {
  const now = new Date().toISOString();
  return {
    agency: cloneDefaultAgency(),
    idols: [],
    trainees: cloneDefaultTrainees(),
    groups: [],
    revenueHistory: cloneDefaultRevenueHistory(),
    transactions: cloneDefaultTransactions(),
    trainingPlans: createDefaultTrainingPlans(),
    currentWeek: 1,
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
  const revenueHistory = Array.isArray(raw.revenueHistory)
    ? (raw.revenueHistory as RevenueHistoryPoint[])
    : defaults.revenueHistory;
  const transactions = Array.isArray(raw.transactions)
    ? (raw.transactions as FinanceTransaction[])
    : defaults.transactions;
  const trainingPlans =
    typeof raw.trainingPlans === 'object' && raw.trainingPlans !== null
      ? (raw.trainingPlans as TrainingPlans)
      : defaults.trainingPlans;
  const currentWeek =
    typeof raw.currentWeek === 'number' && Number.isFinite(raw.currentWeek) && raw.currentWeek > 0
      ? Math.floor(raw.currentWeek)
      : defaults.currentWeek;
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
    revenueHistory,
    transactions,
    trainingPlans,
    currentWeek,
    isAgencyCreated,
    activeSlotId,
    scoutingLastGrowthAt,
    updatedAt,
  };
}
