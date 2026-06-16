import type { Dispatch, SetStateAction } from 'react';
import type { Agency, Group, Idol, Trainee } from '../../types';

export type SaveData = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  groups: Group[];
  isAgencyCreated: boolean;
  activeSlotId: number;
  scoutingLastGrowthAt: string;
  updatedAt: string;
};

export type SaveSlotSummary = {
  id: number;
  label: string;
  hasSave: boolean;
  agencyName?: string;
  city?: string;
  updatedAt?: string;
};

export type UseSaveLifecycleParams = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  groups: Group[];
  isAgencyCreated: boolean;
  activeSlotId: number | null;
  scoutingLastGrowthAt: string;
  setAgency: Dispatch<SetStateAction<Agency>>;
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setTrainees: Dispatch<SetStateAction<Trainee[]>>;
  setGroups: Dispatch<SetStateAction<Group[]>>;
  setIsAgencyCreated: Dispatch<SetStateAction<boolean>>;
  setActiveSlotId: Dispatch<SetStateAction<number | null>>;
  setScoutingLastGrowthAt: Dispatch<SetStateAction<string>>;
};
