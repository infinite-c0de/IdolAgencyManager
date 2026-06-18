import type { Agency, City, Group, Idol } from '../../types';
import { fmt } from '../../utils/format';
import { getCityById } from '../cities';
import {
  calculateCityProjection,
  calculateTotalFanbase,
  calculateWeeklyEconomy,
  defaultEconomyModifiers,
  formatCompactCount,
} from './service';
import type {
  EconomyTransaction,
  OnboardingCityCardData,
  OnboardingCityData,
  OnboardingMetricItem,
  OnboardingTagItem,
  TopBarMetrics,
} from './types';

export function selectTopBarMetrics(
  agency: Agency,
  city: City,
  idols: Idol[],
  groups: Group[],
  transactions: EconomyTransaction[],
  currentWeek?: number,
): TopBarMetrics {
  const totalFanbase = calculateTotalFanbase(idols, groups);
  const topBarTransactions = transactions.filter(
    transaction => transaction.label !== 'Weekly Income' && transaction.label !== 'Weekly Operations',
  );
  const scopedTransactions =
    typeof currentWeek === 'number'
      ? topBarTransactions.filter(transaction => transaction.date === `Week ${currentWeek}`)
      : topBarTransactions;
  const { netWeekly: weeklyNet } = calculateWeeklyEconomy(
    agency,
    city,
    defaultEconomyModifiers,
    scopedTransactions,
  );

  return {
    totalFanbase,
    weeklyNet,
    fanbaseLabel: formatCompactCount(totalFanbase),
  };
}

type RevenueHistoryPoint = {
  m: string;
  group: number;
  solo: number;
  merch: number;
};

type MarketPoint = {
  region: string;
  fans: string;
  revenue: string;
  rank: string;
  trend: string;
};

export function selectProfitLossSeries(revenueHistory: RevenueHistoryPoint[]) {
  return revenueHistory.map(point => ({
    m: point.m,
    profit: Math.round(point.group + point.solo + point.merch - 220 - point.solo * 0.4),
  }));
}

export function selectFinanceSummary(
  agency: Agency,
  city: City,
  transactions: EconomyTransaction[],
) {
  const weekly = calculateWeeklyEconomy(
    agency,
    city,
    defaultEconomyModifiers,
    transactions,
  );

  return {
    income: weekly.grossWeekly + weekly.transactionIncomeWeekly,
    expense: weekly.transactionExpenseWeekly + weekly.taxWeekly + weekly.operationsWeekly,
    net: weekly.netWeekly,
    weekly,
  };
}

export function selectMarketByRegion(markets: MarketPoint[], region: string) {
  return markets.find(market => market.region === region) ?? null;
}

function toSigned(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function buildCityTags(city: City): OnboardingTagItem[] {
  return [
    { label: 'Tax Rate', value: `${Math.round(city.taxRate * 100)}%` },
    { label: 'Office Rent/Week', value: fmt(city.officeRentWeekly) },
    { label: 'Local Reputation', value: toSigned(city.localReputationBoost) },
    { label: 'Domestic Streaming', value: `+${Math.round(city.domesticStreamingBonus * 100)}%` },
  ];
}

function buildPreviewMetrics(city: City): OnboardingMetricItem[] {
  const projection = calculateCityProjection(city);
  return [
    { label: 'Starting Seed Capital', value: city.budget },
    { label: 'Starting Reputation Score', value: `${projection.startingReputation}` },
    { label: 'Office Rent (Weekly)', value: fmt(city.officeRentWeekly) },
    { label: 'Government Tax Rate', value: `${Math.round(city.taxRate * 100)}%` },
    { label: 'Projected Weekly Gross', value: fmt(projection.grossWeekly) },
    { label: 'Projected Weekly Tax', value: fmt(-projection.taxWeekly) },
    { label: 'Projected Weekly Operations', value: fmt(-projection.operationsWeekly) },
    { label: 'Projected Weekly Net Balance', value: fmt(projection.netWeekly) },
    { label: 'Domestic Streaming Bonus', value: `+${Math.round(city.domesticStreamingBonus * 100)}%` },
    { label: 'Local Market Competition', value: `${city.competition}%` },
  ];
}

function buildCityCards(cities: City[]): OnboardingCityCardData[] {
  return cities.map(city => ({
    id: city.id,
    name: city.name,
    flag: city.flag,
    description: city.desc,
    difficulty: city.difficulty,
    tags: buildCityTags(city),
  }));
}

export function selectOnboardingCityData(cities: City[], selectedCityId: string): OnboardingCityData {
  const selectedCity = getCityById(cities, selectedCityId);
  return {
    selectedCityId: selectedCity.id,
    selectedCityName: selectedCity.name,
    cityCards: buildCityCards(cities),
    previewMetrics: buildPreviewMetrics(selectedCity),
  };
}
