import type { Agency, City, Group, Idol } from '../../types';
import { fmt } from '../../utils/format';
import { calculateTotalFanbase, formatCompactCount } from '../economy';

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

type PromotionTemplate = {
  id: string;
  name: string;
  baseCost: number;
  baseFansK: number;
  baseReputation: number;
  baseFatigue: number;
  durationHours: number;
  popularityWeight: number;
  synergyWeight: number;
  memberWeight: number;
  intensity: number;
  requiresDebut?: boolean;
};

const PROMOTION_TEMPLATES: PromotionTemplate[] = [
  {
    id: 'social',
    name: 'Social Media Campaign',
    baseCost: 5_200_000,
    baseFansK: 9,
    baseReputation: 1,
    baseFatigue: 3,
    durationHours: 72,
    popularityWeight: 0.6,
    synergyWeight: 0.25,
    memberWeight: 0.2,
    intensity: 0.8,
  },
  {
    id: 'dance',
    name: 'Dance Challenge',
    baseCost: 3_600_000,
    baseFansK: 14,
    baseReputation: 2,
    baseFatigue: 5,
    durationHours: 120,
    popularityWeight: 0.85,
    synergyWeight: 0.5,
    memberWeight: 0.35,
    intensity: 1.1,
  },
  {
    id: 'fan-meet',
    name: 'Fan Meeting',
    baseCost: 14_500_000,
    baseFansK: 16,
    baseReputation: 4,
    baseFatigue: 10,
    durationHours: 24,
    popularityWeight: 0.55,
    synergyWeight: 0.7,
    memberWeight: 0.45,
    intensity: 1.5,
  },
  {
    id: 'music-show',
    name: 'Music Show Performance',
    baseCost: 19_000_000,
    baseFansK: 20,
    baseReputation: 3,
    baseFatigue: 13,
    durationHours: 24,
    popularityWeight: 1.0,
    synergyWeight: 0.85,
    memberWeight: 0.4,
    intensity: 1.7,
    requiresDebut: true,
  },
];

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function signedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

function primaryGroup(groups: Group[]) {
  return groups[0] ?? null;
}

function activeGroupCount(groups: Group[]) {
  return groups.filter(group => group.status === 'Active').length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function selectDynamicSchedule(idols: Idol[], groups: Group[]): DynamicScheduleItem[] {
  const group = primaryGroup(groups);

  if (idols.length === 0) {
    return [
      {
        id: 'scout-trainees',
        num: 1,
        title: 'Scout First Trainee',
        category: 'Recruitment',
        date: 'Week 1 · Mon',
        dayIndex: 0,
        progress: 0,
        accent: 'teal',
        badge: 'pinned',
      },
      {
        id: 'agency-setup',
        num: 2,
        title: 'Prepare Practice Room',
        category: 'Operations',
        date: 'Week 1 · Tue',
        dayIndex: 1,
        progress: 20,
        accent: 'violet',
        badge: 'ready',
      },
    ];
  }

  if (!group) {
    return [
      {
        id: 'form-lineup',
        num: 1,
        title: 'Form First Group',
        category: `${idols.length} recruited idol${idols.length > 1 ? 's' : ''}`,
        date: 'Week 1 · Mon',
        dayIndex: 0,
        progress: Math.min(90, idols.length * 30),
        accent: 'teal',
        badge: 'pinned',
      },
      {
        id: 'weekly-training',
        num: 2,
        title: 'Individual Training Block',
        category: 'Training',
        date: 'Week 1 · Wed',
        dayIndex: 2,
        progress: 35,
        accent: 'mint',
        badge: 'ready',
      },
    ];
  }

  const memberCount = group.memberIds.length;
  const debutProgress = group.status === 'Active' ? 100 : Math.min(95, 40 + memberCount * 12 + Math.round(group.synergy / 3));

  return [
    {
      id: `${group.id}-concept`,
      num: 1,
      title: `${group.name} Concept Workshop`,
      category: group.concept,
      date: 'Week 1 · Mon',
      dayIndex: 0,
      progress: debutProgress,
      accent: 'teal',
      badge: 'pinned',
    },
    {
      id: `${group.id}-training`,
      num: 2,
      title: 'Vocal / Dance Rehearsal',
      category: `${memberCount} members · Synergy ${group.synergy}`,
      date: 'Week 1 · Wed',
      dayIndex: 2,
      progress: Math.min(100, group.synergy),
      accent: 'mint',
      badge: 'ready',
    },
    {
      id: `${group.id}-promo`,
      num: 3,
      title: group.status === 'Active' ? 'Music Show Promotion' : 'Pre-Debut Content Shoot',
      category: group.status,
      date: 'Week 1 · Fri',
      dayIndex: 4,
      progress: group.status === 'Active' ? 65 : 25,
      accent: group.status === 'Active' ? 'violet' : 'hot',
      badge: group.status === 'Active' ? 'ready' : 'alert',
    },
  ];
}

export function selectPromotionOptions(
  cities: City[],
  agency: Agency,
  idols: Idol[],
  groups: Group[],
): PromotionOption[] {
  const group = primaryGroup(groups);
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const popularity = group?.popularity ?? avg(idols.map(idol => idol.popularity));
  const memberCount = Math.max(1, group?.memberIds.length ?? idols.length);
  const synergy = group?.synergy ?? avg(idols.map(idol => idol.morale));
  const cityCostFactor = homeCity ? homeCity.cost : 1;
  const cityRevenueFactor = homeCity ? homeCity.revenue : 1;
  const streamingBoost = homeCity ? 1 + homeCity.domesticStreamingBonus : 1;
  const competitionPenalty = homeCity ? clamp(1 - homeCity.competition / 250, 0.55, 1) : 1;
  const repFactor = clamp(0.85 + agency.reputation / 250, 0.85, 1.35);
  const unlocked = Boolean(group);
  const lockedReason = unlocked ? undefined : 'Create a group before scheduling group promotions.';

  return PROMOTION_TEMPLATES.map(template => {
    // Cost scales with the local market and group size only. Reputation makes
    // promotions more *effective* (below), not more expensive.
    const cost = Math.round(template.baseCost * cityCostFactor * (1 + popularity / 260));
    const energyCost = Math.max(5, Math.round(template.intensity * 12));
    const fansGain = Math.max(
      1000,
      Math.round(
        (template.baseFansK * 1000 +
          popularity * template.popularityWeight * 120 +
          synergy * template.synergyWeight * 80 +
          memberCount * template.memberWeight * 900) *
          streamingBoost *
          competitionPenalty *
          repFactor,
      ),
    );
    const reputationGain = Math.max(
      1,
      Math.round(
        template.baseReputation +
          synergy / 40 +
          popularity / 55 -
          (homeCity?.competition ?? 50) / 90,
      ),
    );
    const fatigueGain = Math.max(
      1,
      Math.round(
        template.baseFatigue + memberCount * template.intensity + (template.requiresDebut ? 2 : 0),
      ),
    );
    const expectedRevenue = Math.round(
      fansGain * (0.015 + cityRevenueFactor * 0.006) +
        reputationGain * 1_200_000 -
        fatigueGain * 350_000,
    );
    const efficiencyScore = Math.max(
      1,
      Math.round((expectedRevenue / Math.max(cost, 1)) * 100),
    );

    return {
      id: template.id,
      name: template.name,
      cost,
      energyCost,
      fansGain,
      reputationGain,
      fatigueGain,
      durationHours: template.durationHours,
      expectedRevenue,
      efficiencyScore,
      target: group?.name ?? 'No group',
      lockedReason:
        template.requiresDebut && group?.status !== 'Active'
          ? 'Debut the group before music show promotions.'
          : lockedReason,
    };
  });
}

export function runPromotionAction(
  cities: City[],
  agency: Agency,
  idols: Idol[],
  groups: Group[],
  payload: RunPromotionPayload,
): RunPromotionResult {
  const targetGroup = payload.groupId
    ? groups.find(group => group.id === payload.groupId) ?? null
    : primaryGroup(groups);
  if (!targetGroup) {
    return { ok: false, reason: 'GROUP_NOT_FOUND' };
  }

  const options = selectPromotionOptions(cities, agency, idols, [targetGroup]);
  const option = options.find(item => item.id === payload.promotionId);
  if (!option) {
    return { ok: false, reason: 'PROMOTION_NOT_FOUND' };
  }
  if (option.lockedReason) {
    return { ok: false, reason: 'PROMOTION_LOCKED' };
  }
  if (agency.energy < option.energyCost) {
    return { ok: false, reason: 'INSUFFICIENT_ENERGY' };
  }
  if (agency.money < option.cost) {
    return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
  }

  const popularityBoost = Math.max(1, Math.round(option.fansGain / 5_800));
  const members = idols.filter(idol => targetGroup.memberIds.includes(idol.id));
  const avgEnergy =
    members.reduce((sum, member) => sum + member.energy, 0) / Math.max(members.length, 1);
  const avgMorale =
    members.reduce((sum, member) => sum + member.morale, 0) / Math.max(members.length, 1);
  const readinessFactor = clamp((avgEnergy * 0.55 + avgMorale * 0.45) / 100, 0.55, 1.15);
  const saturationFactor = clamp(
    1 - targetGroup.popularity / 180 - (targetGroup.releases?.length ?? 0) * 0.03,
    0.55,
    1,
  );
  const performanceFactor = clamp(readinessFactor * saturationFactor, 0.45, 1.2);
  const fansGained = Math.max(900, Math.round(option.fansGain * performanceFactor));
  const reputationGained = Math.max(
    1,
    Math.round(option.reputationGain * (0.75 + readinessFactor * 0.25)),
  );
  const revenueGained = Math.round(option.expectedRevenue * (0.65 + performanceFactor * 0.5));
  const memberPopularityBoost = Math.max(1, Math.round(fansGained / 8_400));
  const memberMoraleDelta = Math.max(1, Math.round(option.fatigueGain * (0.45 + (1.1 - readinessFactor))));
  const memberEnergyDelta = Math.max(1, Math.round(option.fatigueGain * (0.8 + (1.05 - readinessFactor))));
  const groupPopularityBoost = Math.max(1, Math.round(fansGained / 7_200));

  const updatedIdols = idols.map(idol =>
    targetGroup.memberIds.includes(idol.id)
      ? {
          ...idol,
          popularity: clamp(idol.popularity + memberPopularityBoost, 0, 100),
          morale: clamp(idol.morale - memberMoraleDelta, 0, 100),
          energy: clamp(idol.energy - memberEnergyDelta, 0, 100),
          status: 'Promoting' as const,
        }
      : idol,
  );

  const updatedGroup: Group = {
    ...targetGroup,
    popularity: clamp(targetGroup.popularity + Math.max(popularityBoost, groupPopularityBoost), 0, 100),
    monthlyRevenue: Math.max(0, Math.round(targetGroup.monthlyRevenue + revenueGained / 2)),
  };

  return {
    ok: true,
    promotionName: option.name,
    groupId: targetGroup.id,
    groupName: targetGroup.name,
    updatedGroup,
    updatedIdols,
    totalCost: option.cost,
    revenueGained,
    netDelta: revenueGained - option.cost,
    fansGained,
    reputationGained,
    fatigueApplied: option.fatigueGain,
    energySpent: option.energyCost,
    performanceFactor,
  };
}

export function selectMarketPulse(cities: City[], agency: Agency, idols: Idol[], groups: Group[]): MarketPulse[] {
  const totalFanbase = calculateTotalFanbase(idols, groups);
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const groupRevenue = groups.reduce((sum, group) => sum + group.monthlyRevenue, 0);
  const baseRevenue = Math.max(agency.monthlyIncome, groupRevenue);

  const cityMarkets = cities.map((city, index) => {
    const homeBoost = city.id === homeCity.id ? 1.35 : 1;
    const fans = Math.round((totalFanbase * city.fan * homeBoost) / Math.max(cities.length, 1));
    const revenue = Math.round(baseRevenue * city.revenue * (0.3 + fans / Math.max(totalFanbase || 1, 1)));
    const trend = Math.round(city.domesticStreamingBonus * 100 + groups.length * 2 - city.competition / 20);
    const rank = Math.max(1, agency.ranking + index * 2 - activeGroupCount(groups) * 3);

    return {
      region: city.name,
      fans: formatCompactCount(fans),
      revenue: fmt(revenue),
      trend: signedPercent(trend),
      rank: `#${rank}`,
    };
  });

  const globalFans = cityMarkets.reduce((sum, market) => {
    const numeric = Number.parseFloat(market.fans.replace(/[MK]/g, ''));
    const scale = market.fans.includes('M') ? 1_000_000 : market.fans.includes('K') ? 1_000 : 1;
    return sum + numeric * scale;
  }, 0);

  return [
    ...cityMarkets,
    {
      region: 'Global',
      fans: formatCompactCount(Math.round(globalFans)),
      revenue: fmt(Math.round(baseRevenue * Math.max(1, groups.length || 0.4))),
      trend: signedPercent(Math.max(0, groups.length * 4 + avg(groups.map(group => group.synergy)) / 20)),
      rank: `#${agency.ranking}`,
    },
  ];
}

export function selectMarketOpportunities(cities: City[], agency: Agency, idols: Idol[], groups: Group[]): MarketOpportunity[] {
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const group = primaryGroup(groups);

  if (idols.length === 0) {
    return [
      { region: homeCity.name, text: 'Open trainee scouting to start building local awareness.', tone: 'teal' },
      { region: 'Global', text: 'No market traction yet. Recruiting is the first growth lever.', tone: 'violet' },
    ];
  }

  if (!group) {
    return [
      { region: homeCity.name, text: 'You have recruited talent. Form a group to unlock promotion campaigns.', tone: 'mint' },
      { region: homeCity.name, text: `Competition pressure is ${homeCity.competition}%, so role balance matters before debut.`, tone: 'hot' },
    ];
  }

  return [
    {
      region: homeCity.name,
      text: `${group.name} can convert local reputation into stronger early fan growth.`,
      tone: 'mint',
    },
    {
      region: 'Global',
      text: group.status === 'Active' ? 'Active promotions can lift global rank this month.' : 'A debut release will unlock chart movement.',
      tone: 'teal',
    },
    {
      region: homeCity.name,
      text: `Office costs are ${fmt(homeCity.officeRentWeekly)}/week, so avoid over-scheduling low-return campaigns.`,
      tone: 'violet',
    },
  ];
}

export function selectRivalIntel(agency: Agency, groups: Group[], idols: Idol[]): RivalIntel[] {
  const playerPressure = Math.min(30, groups.length * 4 + Math.round(avg(idols.map(idol => idol.popularity)) / 8));
  const templates = [
    { id: 'nova', name: 'NOVA MEDIA', baseRep: 92, baseGroups: 5, baseShare: 28 },
    { id: 'prism', name: 'PRISM LABEL', baseRep: 86, baseGroups: 3, baseShare: 19 },
    { id: 'zenith', name: 'ZENITH ENT.', baseRep: 78, baseGroups: 4, baseShare: 14 },
    { id: 'halo', name: 'HALO STUDIOS', baseRep: 71, baseGroups: 2, baseShare: 9 },
  ];

  return templates.map((rival, index) => {
    const reputation = Math.max(45, rival.baseRep - Math.round(playerPressure / (index + 2)));
    const share = Math.max(4, rival.baseShare - Math.round(playerPressure / (index + 3)));
    const threat = reputation > agency.reputation + 25 ? 'High' : reputation > agency.reputation + 8 ? 'Medium' : 'Low';

    return {
      id: rival.id,
      name: rival.name,
      reputation,
      groups: rival.baseGroups,
      share,
      threat,
      recent:
        threat === 'High'
          ? `Protect your rank: ${rival.name} still controls ${share}% market share.`
          : `${rival.name} is vulnerable as your agency gains momentum.`,
    };
  });
}

export function selectRivalFeed(agency: Agency, groups: Group[], idols: Idol[]): RivalFeedItem[] {
  const group = primaryGroup(groups);

  return [
    {
      t: group ? `${agency.name} formed ${group.name}, forcing rivals to adjust scouting.` : `${agency.name} is still in talent acquisition phase.`,
      time: 'This week',
      tone: group ? 'mint' : 'teal',
    },
    {
      t: idols.length > 0 ? `${idols.length} signed idol${idols.length > 1 ? 's' : ''} now visible to rival scouts.` : 'Rivals are watching trainee markets for your first signing.',
      time: '2d ago',
      tone: 'violet',
    },
    {
      t: agency.reputation >= 60 ? 'Industry press expects your next promotion to affect market share.' : 'Low reputation keeps rival pressure manageable for now.',
      time: '4d ago',
      tone: agency.reputation >= 60 ? 'hot' : 'teal',
    },
  ];
}
