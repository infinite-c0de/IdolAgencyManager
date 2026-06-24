import type { Agency, City, Group, Idol } from '../../types';
import { fmt } from '../../utils/format';
import { calculateTotalFanbase } from '../economy';
import { fmtCount } from '../../utils/format';
import type {
  DynamicScheduleItem,
  MarketOpportunity,
  MarketPulse,
  PromotionOption,
  RivalFeedItem,
  RivalIntel,
} from './types';

// ── Promotion templates (used by selectPromotionOptions + runPromotionAction) ──

export type PromotionTemplate = {
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

export const PROMOTION_TEMPLATES: PromotionTemplate[] = [
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

// ── Private helpers ──

function avg(values: number[]) {
  return Math.round(values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1));
}

function signedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

export function primaryGroup(groups: Group[]) {
  return groups[0] ?? null;
}

function activeGroupCount(groups: Group[]) {
  return groups.filter(g => g.status === 'Active').length;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// ── Selectors ──

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
  const debutProgress =
    group.status === 'Active'
      ? 100
      : Math.min(95, 40 + memberCount * 12 + Math.round(group.synergy / 3));

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

export type SoloPromotionTemplate = {
  id: string;
  name: string;
  baseCost: number;
  baseFansK: number;
  baseReputation: number;
  baseFatigue: number;
  baseRevenueK: number;
  durationHours: number;
  popularityWeight: number;
  intensity: number;
  requiresActive?: boolean;
};

export const SOLO_PROMOTION_TEMPLATES: SoloPromotionTemplate[] = [
  {
    id: 'solo-social',
    name: 'Solo Social Post',
    baseCost: 1_200_000,
    baseFansK: 4,
    baseReputation: 1,
    baseFatigue: 2,
    baseRevenueK: 2_500,
    durationHours: 48,
    popularityWeight: 0.65,
    intensity: 0.5,
  },
  {
    id: 'cf-deal',
    name: 'CF / Brand Deal',
    baseCost: 6_000_000,
    baseFansK: 7,
    baseReputation: 2,
    baseFatigue: 4,
    baseRevenueK: 18_000,
    durationHours: 96,
    popularityWeight: 0.8,
    intensity: 0.8,
  },
  {
    id: 'variety-show',
    name: 'Variety Show Appearance',
    baseCost: 4_500_000,
    baseFansK: 12,
    baseReputation: 3,
    baseFatigue: 7,
    baseRevenueK: 8_000,
    durationHours: 72,
    popularityWeight: 0.75,
    intensity: 1.0,
  },
  {
    id: 'solo-fansign',
    name: 'Solo Fan Sign',
    baseCost: 9_000_000,
    baseFansK: 15,
    baseReputation: 3,
    baseFatigue: 9,
    baseRevenueK: 12_000,
    durationHours: 24,
    popularityWeight: 0.55,
    intensity: 1.2,
  },
  {
    id: 'solo-concert',
    name: 'Solo Mini Concert',
    baseCost: 22_000_000,
    baseFansK: 22,
    baseReputation: 5,
    baseFatigue: 14,
    baseRevenueK: 35_000,
    durationHours: 24,
    popularityWeight: 1.0,
    intensity: 1.6,
    requiresActive: true,
  },
];

export function selectSoloPromotionOptions(
  cities: City[],
  agency: Agency,
  idol: Idol,
): PromotionOption[] {
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const cityCostFactor = homeCity ? homeCity.cost : 1;
  const cityRevenueFactor = homeCity ? homeCity.revenue : 1;
  const repFactor = clamp(0.85 + agency.reputation / 250, 0.85, 1.35);
  const isActive = idol.status === 'Active' || idol.status === 'Promoting';

  return SOLO_PROMOTION_TEMPLATES.map(template => {
    const cost = Math.round(template.baseCost * cityCostFactor * (1 + idol.popularity / 300));
    const energyCost = Math.max(4, Math.round(template.intensity * 10));
    const fansGain = Math.max(
      500,
      Math.round(
        (template.baseFansK * 1000 + idol.popularity * template.popularityWeight * 100) *
          repFactor,
      ),
    );
    const reputationGain = Math.max(1, Math.round(template.baseReputation + idol.popularity / 60));
    const fatigueGain = Math.max(1, Math.round(template.baseFatigue + template.intensity * 2));
    const expectedRevenue = Math.round(
      template.baseRevenueK * (1 + cityRevenueFactor * 0.4 + idol.popularity / 200) * repFactor,
    );
    const efficiencyScore = Math.max(1, Math.round((expectedRevenue / Math.max(cost, 1)) * 100));
    const lockedReason = template.requiresActive && !isActive
      ? 'Idol must be active (in a group or promoted) to run solo concerts.'
      : undefined;

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
      target: idol.stageName,
      lockedReason,
    };
  });
}

export function selectPromotionOptions(  cities: City[],
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

export function selectMarketPulse(
  cities: City[],
  agency: Agency,
  idols: Idol[],
  groups: Group[],
): MarketPulse[] {
  const totalFanbase = calculateTotalFanbase(idols, groups);
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const groupRevenue = groups.reduce((sum, g) => sum + g.monthlyRevenue, 0);
  const baseRevenue = Math.max(agency.monthlyIncome, groupRevenue);

  const cityMarkets = cities.map((city, index) => {
    const homeBoost = city.id === homeCity.id ? 1.35 : 1;
    const fans = Math.round((totalFanbase * city.fan * homeBoost) / Math.max(cities.length, 1));
    const revenue = Math.round(
      baseRevenue * city.revenue * (0.3 + fans / Math.max(totalFanbase || 1, 1)),
    );
    const trend = Math.round(
      city.domesticStreamingBonus * 100 + groups.length * 2 - city.competition / 20,
    );
    const rank = Math.max(1, agency.ranking + index * 2 - activeGroupCount(groups) * 3);

    return {
      region: city.name,
      fans: fmtCount(fans),
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
      fans: fmtCount(Math.round(globalFans)),
      revenue: fmt(Math.round(baseRevenue * Math.max(1, groups.length || 0.4))),
      trend: signedPercent(
        Math.max(0, groups.length * 4 + avg(groups.map(g => g.synergy)) / 20),
      ),
      rank: `#${agency.ranking}`,
    },
  ];
}

export function selectMarketOpportunities(
  cities: City[],
  agency: Agency,
  idols: Idol[],
  groups: Group[],
): MarketOpportunity[] {
  const homeCity = cities.find(city => city.name === agency.city) ?? cities[0];
  const group = primaryGroup(groups);

  if (idols.length === 0) {
    return [
      {
        id: 'local-pr',
        region: homeCity.name,
        text: 'Open trainee scouting to start building local awareness.',
        tone: 'teal',
        actionLabel: 'Launch PR Campaign',
        actionCost: 3_000_000,
        reputationGain: 2,
        incomeGain: 0,
      },
      {
        id: 'market-data',
        region: 'Global',
        text: 'No market traction yet. Recruiting is the first growth lever.',
        tone: 'violet',
        actionLabel: 'Buy Market Report',
        actionCost: 2_000_000,
        reputationGain: 1,
        incomeGain: 0,
      },
    ];
  }

  if (!group) {
    return [
      {
        id: 'grassroots',
        region: homeCity.name,
        text: 'You have recruited talent. Form a group to unlock promotion campaigns.',
        tone: 'mint',
        actionLabel: 'Grassroots Campaign',
        actionCost: 8_000_000,
        reputationGain: 2,
        incomeGain: 5_000_000,
      },
      {
        id: 'comp-intel',
        region: homeCity.name,
        text: `Competition pressure is ${homeCity.competition}%, so role balance matters before debut.`,
        tone: 'hot',
        actionLabel: 'Analyse Rivals',
        actionCost: 4_000_000,
        reputationGain: 1,
        incomeGain: 0,
      },
    ];
  }

  const isActive = group.status === 'Active';
  return [
    {
      id: 'local-showcase',
      region: homeCity.name,
      text: `${group.name} can convert local reputation into stronger early fan growth.`,
      tone: 'mint',
      actionLabel: isActive ? 'Book Local Showcase' : 'Host Pre-Debut Event',
      actionCost: isActive ? 18_000_000 : 12_000_000,
      reputationGain: isActive ? 4 : 2,
      incomeGain: isActive ? 16_000_000 : 8_000_000,
    },
    {
      id: 'global-push',
      region: 'Global',
      text: isActive
        ? 'Active promotions can lift global rank this month.'
        : 'A debut release will unlock chart movement.',
      tone: 'teal',
      actionLabel: isActive ? 'Streaming Push' : 'Teaser Campaign',
      actionCost: isActive ? 15_000_000 : 6_000_000,
      reputationGain: isActive ? 3 : 1,
      incomeGain: isActive ? 20_000_000 : 3_000_000,
    },
    {
      id: 'cost-cut',
      region: homeCity.name,
      text: `Office costs are ${fmt(homeCity.officeRentWeekly)}/week, so avoid over-scheduling low-return campaigns.`,
      tone: 'violet',
      actionLabel: 'Optimise Budget',
      actionCost: 4_000_000,
      reputationGain: 0,
      incomeGain: 12_000_000,
    },
  ];
}

export function selectRivalIntel(
  agency: Agency,
  groups: Group[],
  idols: Idol[],
): RivalIntel[] {
  const playerPressure = Math.min(
    30,
    groups.length * 4 + Math.round(avg(idols.map(idol => idol.popularity)) / 8),
  );
  const templates = [
    { id: 'nova',   name: 'NOVA MEDIA',    baseRep: 92, baseGroups: 5, baseShare: 28 },
    { id: 'prism',  name: 'PRISM LABEL',   baseRep: 86, baseGroups: 3, baseShare: 19 },
    { id: 'zenith', name: 'ZENITH ENT.',   baseRep: 78, baseGroups: 4, baseShare: 14 },
    { id: 'halo',   name: 'HALO STUDIOS',  baseRep: 71, baseGroups: 2, baseShare:  9 },
  ];

  return templates.map((rival, index) => {
    const reputation = Math.max(45, rival.baseRep - Math.round(playerPressure / (index + 2)));
    const share = Math.max(4, rival.baseShare - Math.round(playerPressure / (index + 3)));
    const threat =
      reputation > agency.reputation + 25
        ? 'High'
        : reputation > agency.reputation + 8
          ? 'Medium'
          : 'Low';

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

export function selectRivalFeed(
  agency: Agency,
  groups: Group[],
  idols: Idol[],
): RivalFeedItem[] {
  const group = primaryGroup(groups);

  return [
    {
      t: group
        ? `${agency.name} formed ${group.name}, forcing rivals to adjust scouting.`
        : `${agency.name} is still in talent acquisition phase.`,
      time: 'This week',
      tone: group ? 'mint' : 'teal',
    },
    {
      t:
        idols.length > 0
          ? `${idols.length} signed idol${idols.length > 1 ? 's' : ''} now visible to rival scouts.`
          : 'Rivals are watching trainee markets for your first signing.',
      time: '2d ago',
      tone: 'violet',
    },
    {
      t:
        agency.reputation >= 60
          ? 'Industry press expects your next promotion to affect market share.'
          : 'Low reputation keeps rival pressure manageable for now.',
      time: '4d ago',
      tone: agency.reputation >= 60 ? 'hot' : 'teal',
    },
  ];
}
