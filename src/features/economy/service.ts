import type { City, Group, Idol } from '../../types';
import type { CityEconomyProjection, WeeklyEconomy } from './types';

const BASE_REPUTATION = 50;
const BASE_MONTHLY_INCOME = 140_000_000;

export function getStartingReputation(city: City, baseReputation = BASE_REPUTATION) {
  return Math.max(0, Math.min(100, baseReputation + city.localReputationBoost));
}

export function getProjectedMonthlyIncome(city: City, baseMonthlyIncome = BASE_MONTHLY_INCOME) {
  return Math.round(baseMonthlyIncome * city.revenue * (1 + city.domesticStreamingBonus));
}

export function calculateWeeklyEconomy(monthlyIncome: number, city: City) {
  const grossWeekly = Math.round(monthlyIncome / 4);
  const taxWeekly = Math.round(grossWeekly * city.taxRate);
  const operationsWeekly = Math.round(city.officeRentWeekly * city.operationalCostMultiplier);
  const netWeekly = grossWeekly - taxWeekly - operationsWeekly;

  return { grossWeekly, taxWeekly, operationsWeekly, netWeekly } satisfies WeeklyEconomy;
}

export function calculateTotalFanbase(idols: Idol[], groups: Group[]) {
  return Math.max(
    0,
    Math.round(
      idols.reduce((sum, idol) => sum + idol.popularity * 3200, 0) +
        groups.reduce((sum, group) => sum + group.popularity * 1800, 0),
    ),
  );
}

export function formatCompactCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return `${value}`;
}

export function calculateCityProjection(city: City) {
  const monthlyIncome = getProjectedMonthlyIncome(city);
  const weekly = calculateWeeklyEconomy(monthlyIncome, city);

  return {
    monthlyIncome,
    startingReputation: getStartingReputation(city),
    ...weekly,
  } satisfies CityEconomyProjection;
}
