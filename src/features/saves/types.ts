import type { Dispatch, SetStateAction } from 'react';
import type { Agency, Idol, Trainee } from '../../types';

export type SaveData = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  isAgencyCreated: boolean;
  activeSlotId: number;
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
  isAgencyCreated: boolean;
  activeSlotId: number | null;
  setAgency: Dispatch<SetStateAction<Agency>>;
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setTrainees: Dispatch<SetStateAction<Trainee[]>>;
  setIsAgencyCreated: Dispatch<SetStateAction<boolean>>;
  setActiveSlotId: Dispatch<SetStateAction<number | null>>;
};
