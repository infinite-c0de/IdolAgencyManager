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
  fans: string;
  rep: string;
  fatigue: string;
  time: string;
  target: string;
  lockedReason?: string;
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

export function selectPromotionOptions(agency: Agency, idols: Idol[], groups: Group[]): PromotionOption[] {
  const group = primaryGroup(groups);
  const popularity = group?.popularity ?? avg(idols.map(idol => idol.popularity));
  const memberScale = Math.max(1, group?.memberIds.length ?? idols.length);
  const unlocked = Boolean(group);
  const lockedReason = unlocked ? undefined : 'Create a group before scheduling group promotions.';
  const baseFans = Math.max(3, Math.round(popularity * memberScale * 0.08));

  return [
    {
      id: 'social',
      name: 'Social Media Campaign',
      cost: Math.round(5_000_000 + agency.reputation * 80_000),
      fans: `+${baseFans}k`,
      rep: '+1',
      fatigue: '+3',
      time: '3 days',
      target: group?.name ?? 'No group',
      lockedReason,
    },
    {
      id: 'dance',
      name: 'Dance Challenge',
      cost: Math.round(3_000_000 + memberScale * 1_000_000),
      fans: `+${baseFans + 8}k`,
      rep: '+2',
      fatigue: '+5',
      time: '5 days',
      target: group?.name ?? 'No group',
      lockedReason,
    },
    {
      id: 'fan-meet',
      name: 'Fan Meeting',
      cost: Math.round(14_000_000 + memberScale * 2_500_000),
      fans: `+${baseFans + 12}k`,
      rep: '+5',
      fatigue: '+12',
      time: '1 day',
      target: group?.name ?? 'No group',
      lockedReason,
    },
    {
      id: 'music-show',
      name: 'Music Show Performance',
      cost: Math.round(18_000_000 + popularity * 120_000),
      fans: `+${baseFans + 16}k`,
      rep: '+3',
      fatigue: '+15',
      time: '1 day',
      target: group?.name ?? 'No group',
      lockedReason: group?.status === 'Active' ? undefined : 'Debut the group before music show promotions.',
    },
  ];
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
