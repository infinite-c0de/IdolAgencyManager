import {
  initialAgency,
  initialRevenueHistory,
  initialTransactions,
  traineeArtPool,
} from '../../data/gameData';
import { generateScoutingPoolFromArtPool, normalizePersonalityProfile } from '../idols';
import type { Agency, AgencyLogo, Group, Idol, IdolStats, Release, Status, Trainee } from '../../types';
import type { FinanceTransaction, RevenueHistoryPoint, SaveData, TrainingPlans } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

// Map old string logo presets → numeric IDs (1-40)
const LEGACY_LOGO_PRESET_MAP: Record<string, number> = {
  NEON_STAR: 1, DIAMOND_ROSE: 2, FLAME_PHOENIX: 3, CRYSTAL_MOON: 4,
  SILVER_WING: 5, GOLDEN_SUN: 6, SHADOW_CAT: 7, SAKURA_BLOOM: 8,
  THUNDER_BOLT: 9, ICE_CROWN: 10, NIGHT_OWL: 11, ROYAL_CREST: 12,
  OCEAN_WAVE: 13, FOREST_SPIRIT: 14, COSMIC_EYE: 15, INFINITY_LOOP: 16,
};

function normalizeLogo(raw: unknown): AgencyLogo {
  if (!isRecord(raw)) return { kind: 'none' };
  if (raw.kind === 'custom' && typeof raw.uri === 'string') return { kind: 'custom', uri: raw.uri };
  if (raw.kind === 'preset') {
    if (typeof raw.preset === 'number' && raw.preset >= 1 && raw.preset <= 40) {
      return { kind: 'preset', preset: raw.preset };
    }
    if (typeof raw.preset === 'string') {
      const mapped = LEGACY_LOGO_PRESET_MAP[raw.preset] ?? 1;
      return { kind: 'preset', preset: mapped };
    }
    return { kind: 'preset', preset: 1 };
  }
  return { kind: 'none' };
}

function normalizeIdolStats(raw: unknown): IdolStats {
  const r = isRecord(raw) ? raw : {};
  return {
    vocal:    num(r.vocal,    50),
    dance:    num(r.dance,    50),
    rap:      num(r.rap,      50),
    visual:   num(r.visual,   50),
    charisma: num(r.charisma, 50),
    stamina:  num(r.stamina,  80),
    variety:  num(r.variety,  40),
    acting:   num(r.acting,   40),
  };
}

const VALID_STATUSES: Status[] = ['Active', 'Trainee', 'Resting', 'Injured', 'Promoting'];
function normalizeStatus(v: unknown): Status {
  return VALID_STATUSES.includes(v as Status) ? (v as Status) : 'Trainee';
}

const VALID_GROUP_STATUSES = ['Active', 'Pre-debut', 'Disbanded'] as const;
type GroupStatus = typeof VALID_GROUP_STATUSES[number];
function normalizeGroupStatus(v: unknown): GroupStatus {
  return VALID_GROUP_STATUSES.includes(v as GroupStatus) ? (v as GroupStatus) : 'Pre-debut';
}

function normalizeRelease(raw: unknown): Release | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null;
  return {
    id:              str(raw.id, ''),
    title:           str(raw.title, 'Unknown'),
    concept:         str(raw.concept, 'Pop'),
    quality:         ([1,2,3,4,5].includes(raw.quality as number) ? raw.quality : 3) as Release['quality'],
    language:        str(raw.language, 'Korean'),
    budgetSpent:     num(raw.budgetSpent, 0),
    weekReleased:    num(raw.weekReleased, 1),
    chartPosition:   num(raw.chartPosition, 99),
    totalSales:      num(raw.totalSales, 0),
    fansGained:      num(raw.fansGained, 0),
    reputationGained: num(raw.reputationGained, 0),
    revenueGained:   num(raw.revenueGained, 0),
  };
}

function normalizeGroup(raw: unknown): Group | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null;
  const releases = Array.isArray(raw.releases)
    ? (raw.releases as unknown[]).map(normalizeRelease).filter((r): r is Release => r !== null)
    : [];
  return {
    id:             str(raw.id, ''),
    name:           str(raw.name, 'Unknown Group'),
    fanName:        str(raw.fanName, 'Fans'),
    concept:        str(raw.concept, 'Pop'),
    logo:           normalizeLogo(raw.logo),
    status:         normalizeGroupStatus(raw.status),
    popularity:     num(raw.popularity, 0),
    monthlyRevenue: num(raw.monthlyRevenue, 0),
    synergy:        num(raw.synergy, 50),
    memberIds:      Array.isArray(raw.memberIds) ? (raw.memberIds as string[]) : [],
    roleAssignments: isRecord(raw.roleAssignments) ? (raw.roleAssignments as Group['roleAssignments']) : undefined,
    gradient:       Array.isArray(raw.gradient) ? (raw.gradient as string[]) : ['#1a1a2e', '#16213e'],
    releases,
  };
}

function normalizeIdol(raw: unknown): Idol | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null;
  return {
    id:                 str(raw.id, ''),
    artKey:             typeof raw.artKey === 'number' || typeof raw.artKey === 'string' ? raw.artKey : undefined,
    stageName:          str(raw.stageName, 'Unknown'),
    fullName:           str(raw.fullName, str(raw.stageName, 'Unknown')),
    gender:             raw.gender === 'male' || raw.gender === 'female' ? raw.gender : undefined,
    age:                num(raw.age, 20),
    dob:                str(raw.dob, ''),
    nationality:        str(raw.nationality, 'Unknown'),
    flag:               str(raw.flag, '🏳️'),
    languages:          Array.isArray(raw.languages) ? (raw.languages as string[]) : [],
    personality:        str(raw.personality, 'Focused'),
    personalityProfile: isRecord(raw.personalityProfile)
      ? normalizePersonalityProfile(raw.personalityProfile as never, str(raw.personality, 'Focused'))
      : undefined,
    trainingMonths:     num(raw.trainingMonths, Math.max(0, Math.round(num(raw.trainingYears, 0) * 12))),
    role:               str(raw.role, 'Vocalist'),
    group:              typeof raw.group === 'string' ? raw.group : undefined,
    status:             normalizeStatus(raw.status),
    popularity:         num(raw.popularity, 0),
    rank:               num(raw.rank, 999),
    gradient:           Array.isArray(raw.gradient) ? (raw.gradient as string[]) : ['#1a1a2e', '#16213e'],
    stats:              normalizeIdolStats(raw.stats),
    health:             num(raw.health, 100),
    morale:             num(raw.morale, 100),
    energy:             num(raw.energy, 100),
    image:              typeof raw.image === 'number' ? raw.image : undefined,
  };
}

function normalizeAgency(raw: unknown, defaults: Agency): Agency {
  if (!isRecord(raw)) return defaults;
  return {
    ...defaults,
    ...raw,
    logo: normalizeLogo((raw as Record<string, unknown>).logo ?? defaults.logo),
  } as Agency;
}

// ─────────────────────────────────────────────
// Default constructors
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

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

export function normalizeSaveData(raw: unknown, slotId: number): SaveData | null {
  if (!isRecord(raw)) return null;

  const defaults = createDefaultSaveData(slotId);
  const agency = normalizeAgency(raw.agency, defaults.agency);

  const idols = Array.isArray(raw.idols)
    ? (raw.idols as unknown[]).map(normalizeIdol).filter((x): x is Idol => x !== null)
    : defaults.idols;

  const trainees = Array.isArray(raw.trainees) ? (raw.trainees as Trainee[]) : defaults.trainees;

  const groups = Array.isArray(raw.groups)
    ? (raw.groups as unknown[]).map(normalizeGroup).filter((x): x is Group => x !== null)
    : defaults.groups;

  const revenueHistory = Array.isArray(raw.revenueHistory)
    ? (raw.revenueHistory as RevenueHistoryPoint[])
    : defaults.revenueHistory;
  const transactions = Array.isArray(raw.transactions)
    ? (raw.transactions as FinanceTransaction[])
    : defaults.transactions;
  const trainingPlans =
    isRecord(raw.trainingPlans) ? (raw.trainingPlans as TrainingPlans) : defaults.trainingPlans;
  const currentWeek =
    typeof raw.currentWeek === 'number' && Number.isFinite(raw.currentWeek) && raw.currentWeek > 0
      ? Math.floor(raw.currentWeek)
      : defaults.currentWeek;
  const isAgencyCreated = bool(raw.isAgencyCreated, defaults.isAgencyCreated);
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
