export type Status = 'Active' | 'Trainee' | 'Resting' | 'Injured' | 'Promoting';

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
