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
      groupId: string;
      groupName: string;
      updatedGroup: Group;
      updatedIdols: Idol[];
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
  region: string;
  text: string;
  tone: 'mint' | 'hot' | 'violet' | 'teal';
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
