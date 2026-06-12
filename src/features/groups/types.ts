import type { Idol } from '../../types';

export type GroupRadarPoint = {
  skill: 'VOCAL' | 'DANCE' | 'RAP' | 'VISUAL' | 'CHARISMA';
  v: number;
};

export type GroupReadinessCheck = {
  ok: boolean;
  t: string;
};

export type GroupReadiness = {
  ready: boolean;
  checks: GroupReadinessCheck[];
};

export type GroupMember = Idol;
