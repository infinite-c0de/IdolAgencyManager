import type { Agency, City, Group, Idol } from '../../types';
import type { CityEconomyProjection, EconomyModifiers, EconomyTransaction, WeeklyEconomy } from './types';

const BASE_REPUTATION = 50;
const BASE_MONTHLY_INCOME = 140_000_000;

export const defaultEconomyModifiers: EconomyModifiers = {
  incomeMultiplier: 1,
  taxMultiplier: 1,
  operationsMultiplier: 1,
  flatMonthlyIncome: 0,
  flatWeeklyOperations: 0,
};

export function getStartingReputation(city: City, baseReputation = BASE_REPUTATION) {
  return Math.max(0, Math.min(100, baseReputation + city.localReputationBoost));
}

export function getProjectedMonthlyIncome(city: City, baseMonthlyIncome = BASE_MONTHLY_INCOME) {
  return Math.round(baseMonthlyIncome * city.revenue * (1 + city.domesticStreamingBonus));
}

export function calculateWeeklyEconomy(
  agency: Agency,
  city: City,
  modifiers: Partial<EconomyModifiers>,
  transactions: EconomyTransaction[],
) {
  const applied = { ...defaultEconomyModifiers, ...modifiers };
  const adjustedMonthlyIncome = Math.max(
    0,
    Math.round(agency.monthlyIncome * applied.incomeMultiplier + applied.flatMonthlyIncome),
  );
  const grossWeekly = Math.round(adjustedMonthlyIncome / 4);
  const transactionIncomeWeekly = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const transactionExpenseWeekly = Math.abs(
    transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  const taxableWeekly = grossWeekly + transactionIncomeWeekly;
  const taxWeekly = Math.round(taxableWeekly * city.taxRate * applied.taxMultiplier);
  const operationsWeekly = Math.round(
    city.officeRentWeekly * city.operationalCostMultiplier * applied.operationsMultiplier +
      applied.flatWeeklyOperations,
  );
  const netWeekly =
    grossWeekly + transactionIncomeWeekly - transactionExpenseWeekly - taxWeekly - operationsWeekly;

  return {
    grossWeekly,
    transactionIncomeWeekly,
    transactionExpenseWeekly,
    taxWeekly,
    operationsWeekly,
    netWeekly,
  } satisfies WeeklyEconomy;
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
  const projectionAgency: Agency = {
    name: 'PROJECTED AGENCY',
    ceoName: '',
    level: 1,
    money: city.startingBudget,
    gems: 0,
    energy: 100,
    energyMax: 100,
    reputation: getStartingReputation(city),
    monthlyIncome,
    ranking: 999,
    city: city.name,
    logo: { kind: 'none' },
  };
  const weekly = calculateWeeklyEconomy(projectionAgency, city, defaultEconomyModifiers, []);

  return {
    monthlyIncome,
    startingReputation: getStartingReputation(city),
    ...weekly,
  } satisfies CityEconomyProjection;
}

export function applyWeeklyEconomyTick(
  agency: Agency,
  city: City,
  modifiers: Partial<EconomyModifiers>,
  transactions: EconomyTransaction[],
) {
  const weekly = calculateWeeklyEconomy(agency, city, modifiers, transactions);

  return {
    agency: {
      ...agency,
      money: agency.money + weekly.netWeekly,
    },
    weekly,
  };
}
