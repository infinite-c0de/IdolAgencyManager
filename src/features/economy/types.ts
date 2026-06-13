export type WeeklyEconomy = {
  grossWeekly: number;
  transactionIncomeWeekly: number;
  transactionExpenseWeekly: number;
  taxWeekly: number;
  operationsWeekly: number;
  netWeekly: number;
};

export type EconomyModifiers = {
  incomeMultiplier: number;
  taxMultiplier: number;
  operationsMultiplier: number;
  flatMonthlyIncome: number;
  flatWeeklyOperations: number;
};

export type EconomyTransaction = {
  amount: number;
};

export type CityEconomyProjection = WeeklyEconomy & {
  monthlyIncome: number;
  startingReputation: number;
};

export type TopBarMetrics = {
  totalFanbase: number;
  weeklyNet: number;
  fanbaseLabel: string;
};

export type OnboardingTagItem = {
  label: string;
  value: string;
};

export type OnboardingMetricItem = {
  label: string;
  value: string;
};

export type OnboardingCityCardData = {
  id: string;
  name: string;
  flag: string;
  description: string;
  difficulty: string;
  tags: OnboardingTagItem[];
};

export type OnboardingCityData = {
  selectedCityId: string;
  selectedCityName: string;
  cityCards: OnboardingCityCardData[];
  previewMetrics: OnboardingMetricItem[];
};
