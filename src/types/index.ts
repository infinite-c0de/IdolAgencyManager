export type Status = 'Active' | 'Trainee' | 'Resting' | 'Injured' | 'Promoting';

export type PersonalityArchetype =
  | 'Center'
  | 'Anchor'
  | 'Performer'
  | 'Strategist'
  | 'Mediator'
  | 'All-Rounder';

export type PersonalityTraits = {
  ambition: number;
  ego: number;
  teamwork: number;
  responsibility: number;
  discipline: number;
  adaptability: number;
};

export type PersonalityProfile = {
  archetype: PersonalityArchetype;
  dominance: number;
  traits: PersonalityTraits;
};

export type GroupRole =
  | 'Leader'
  | 'Main Vocal'
  | 'Main Dancer'
  | 'Main Rapper'
  | 'Visual'
  | 'Center';

export type AgencyLogoPreset = number;

export type AgencyLogo =
  | { kind: 'none' }
  | { kind: 'preset'; preset: AgencyLogoPreset }
  | { kind: 'custom'; uri: string };

export type Agency = {
  name: string;
  ceoName: string;
  money: number;
  energy: number;
  energyMax: number;
  reputation: number;
  monthlyIncome: number;
  ranking: number;
  city: string;
  logo: AgencyLogo;
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
  artKey?: number | string;
  stageName: string;
  fullName: string;
  gender?: 'male' | 'female';
  age: number;
  dob: string;
  nationality: string;
  flag: string;
  languages: string[];
  personality: string;
  personalityProfile?: PersonalityProfile;
  trainingMonths: number;
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

export type Release = {
  id: string;
  title: string;
  concept: string;
  quality: 1 | 2 | 3 | 4 | 5;
  language: string;
  budgetSpent: number;
  weekReleased: number;
  chartPosition: number;
  totalSales: number;
  fansGained: number;
  reputationGained: number;
  revenueGained: number;
};

export type Group = {
  id: string;
  name: string;
  fanName: string;
  concept: string;
  logo?: AgencyLogo;
  status: 'Active' | 'Pre-debut' | 'Disbanded';
  popularity: number;
  monthlyRevenue: number;
  synergy: number;
  memberIds: string[];
  roleAssignments?: Partial<Record<GroupRole, string>>;
  gradient: string[];
  releases?: Release[];
};

export type Trainee = {
  id: string;
  artKey?: number | string;
  gender?: 'male' | 'female';
  isScoutingVisible?: boolean;
  shownCount?: number;
  name: string;
  fullName?: string;
  age: number;
  dob?: string;
  nationality: string;
  flag: string;
  languages: string[];
  potential: number;
  skill: string;
  personality: string;
  personalityProfile?: PersonalityProfile;
  cost: number;
  gradient: string[];
  image?: number;
};
