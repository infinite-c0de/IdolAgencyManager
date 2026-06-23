import type { Dispatch, SetStateAction } from 'react';
import type { PromotionScheduleEntry } from '../simulation';
import type { Agency, Group, Idol, Trainee } from '../../types';

export type RevenueHistoryPoint = {
  m: string;
  group: number;
  solo: number;
  merch: number;
};

export type FinanceTransaction = {
  id: number;
  label: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
};

export type TrainingPlans = Record<string, Record<string, string>>;

export type SaveData = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  groups: Group[];
  revenueHistory: RevenueHistoryPoint[];
  transactions: FinanceTransaction[];
  promotionSchedule: PromotionScheduleEntry[];
  trainingPlans: TrainingPlans;
  currentWeek: number;
  isAgencyCreated: boolean;
  activeSlotId: number;
  scoutingLastGrowthAt: string;
  updatedAt: string;
};

export type SaveSlotSummary = {
  id: number;
  label: string;
  hasSave: boolean;
  agencyName?: string;
  city?: string;
  updatedAt?: string;
};

export type UseSaveLifecycleParams = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  groups: Group[];
  revenueHistory: RevenueHistoryPoint[];
  transactions: FinanceTransaction[];
  promotionSchedule: PromotionScheduleEntry[];
  trainingPlans: TrainingPlans;
  currentWeek: number;
  isAgencyCreated: boolean;
  activeSlotId: number | null;
  scoutingLastGrowthAt: string;
  setAgency: Dispatch<SetStateAction<Agency>>;
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setTrainees: Dispatch<SetStateAction<Trainee[]>>;
  setGroups: Dispatch<SetStateAction<Group[]>>;
  setRevenueHistory: Dispatch<SetStateAction<RevenueHistoryPoint[]>>;
  setTransactions: Dispatch<SetStateAction<FinanceTransaction[]>>;
  setPromotionSchedule: Dispatch<SetStateAction<PromotionScheduleEntry[]>>;
  setTrainingPlans: Dispatch<SetStateAction<TrainingPlans>>;
  setCurrentWeek: Dispatch<SetStateAction<number>>;
  setIsAgencyCreated: Dispatch<SetStateAction<boolean>>;
  setActiveSlotId: Dispatch<SetStateAction<number | null>>;
  setScoutingLastGrowthAt: Dispatch<SetStateAction<string>>;
};
