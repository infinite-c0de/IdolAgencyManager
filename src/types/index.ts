export type Status = 'Active' | 'Trainee' | 'Resting' | 'Injured' | 'Promoting';

export type Agency = {
  name: string;
  ceoName: string;
  level: number;
  money: number;
  gems: number;
  energy: number;
  energyMax: number;
  reputation: number;
  monthlyIncome: number;
  ranking: number;
  city: string;
};

export type City = {
  id: string;
  name: string;
  flag: string;
  desc: string;
  budget: string;
  startingBudget: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  fan: number;
  cost: number;
  revenue: number;
  competition: number;
  taxRate: number;
  officeRentWeekly: number;
  localReputationBoost: number;
  domesticStreamingBonus: number;
  operationalCostMultiplier: number;
};

export type IdolStats = {
  vocal: number;
  dance: number;
  rap: number;
  visual: number;
  charisma: number;
  stamina: number;
  variety: number;
  acting: number;
};

export type Idol = {
  id: string;
  stageName: string;
  fullName: string;
  age: number;
  dob: string;
  nationality: string;
  flag: string;
  languages: string[];
  personality: string;
  trainingYears: number;
  role: string;
  group?: string;
  status: Status;
  popularity: number;
  rank: number;
  /** LinearGradient color stops. */
  gradient: string[];
  stats: IdolStats;
  health: number;
  morale: number;
  energy: number;
  image?: number;
};

export type Group = {
  id: string;
  name: string;
  fanName: string;
  concept: string;
  status: 'Active' | 'Pre-debut' | 'Disbanded';
  popularity: number;
  monthlyRevenue: number;
  synergy: number;
  memberIds: string[];
  gradient: string[];
};

export type Trainee = {
  id: string;
  name: string;
  age: number;
  nationality: string;
  flag: string;
  languages: string[];
  potential: number;
  skill: string;
  personality: string;
  cost: number;
  gradient: string[];
  image?: number;
};
