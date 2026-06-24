import type { Group, Idol } from '../../types';

export type DynamicScheduleItem = {
  id: string;
  num: number;
  title: string;
  category: string;
  date: string;
  dayIndex: number;
  progress: number;
  accent: 'teal' | 'violet' | 'hot' | 'mint';
  badge: 'pinned' | 'ready' | 'alert';
};

export type PromotionOption = {
  id: string;
  name: string;
  cost: number;
  energyCost: number;
  fansGain: number;
  reputationGain: number;
  fatigueGain: number;
  durationHours: number;
  expectedRevenue: number;
  efficiencyScore: number;
  target: string;
  lockedReason?: string;
};

export type RunPromotionPayload = {
  promotionId: string;
  groupId?: string;
  /** Set for solo idol promotions (no group required). */
  idolId?: string;
  week?: number;
  dayIndex?: number;
};

export type PromotionScheduleEntry = {
  id: string;
  week: number;
  dayIndex: number;
  groupName: string;
  promotionName: string;
  net: number;
  fans: number;
};

export type RunPromotionResult =
  | {
      ok: true;
      promotionName: string;
      /** Undefined for solo promotions. */
      groupId?: string;
      groupName: string;
      /** Undefined for solo promotions. */
      updatedGroup?: Group;
      updatedIdols: Idol[];
      /** Set for solo promotions. */
      idolId?: string;
      totalCost: number;
      revenueGained: number;
      netDelta: number;
      fansGained: number;
      reputationGained: number;
      fatigueApplied: number;
      energySpent: number;
      performanceFactor: number;
    }
  | {
      ok: false;
      reason:
        | 'GROUP_NOT_FOUND'
        | 'IDOL_NOT_FOUND'
        | 'PROMOTION_NOT_FOUND'
        | 'PROMOTION_LOCKED'
        | 'INSUFFICIENT_FUNDS'
        | 'INSUFFICIENT_ENERGY';
    };

export type MarketPulse = {
  region: string;
  fans: string;
  revenue: string;
  trend: string;
  rank: string;
};

export type MarketOpportunity = {
  id: string;
  region: string;
  text: string;
  tone: 'mint' | 'hot' | 'violet' | 'teal';
  actionLabel: string;
  actionCost: number;
  reputationGain: number;
  incomeGain: number;
};

export type RivalIntel = {
  id: string;
  name: string;
  reputation: number;
  groups: number;
  share: number;
  threat: 'High' | 'Medium' | 'Low';
  recent: string;
};

export type RivalFeedItem = {
  t: string;
  time: string;
  tone: 'mint' | 'hot' | 'violet' | 'teal';
};

export type ProgressionEventType =
  | 'injury'
  | 'burnout'
  | 'low_morale'
  | 'low_health'
  | 'contract_warning'
  | 'contract_expired';

export type ProgressionEvent = {
  type: ProgressionEventType;
  idolId: string;
  idolName: string;
  message: string;
};
