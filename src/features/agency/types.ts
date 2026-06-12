import type { Dispatch, SetStateAction } from 'react';
import type { Agency, Idol, Trainee } from '../../types';

export type CreateAgencyPayload = {
  agencyName: string;
  ceoName: string;
  cityId: string;
};

export type RecruitResult =
  | { ok: true; idolName: string }
  | { ok: false; reason: 'NOT_FOUND' | 'INSUFFICIENT_FUNDS' | 'ALREADY_RECRUITED' };

export type UseAgencyActionsParams = {
  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  setAgency: Dispatch<SetStateAction<Agency>>;
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setTrainees: Dispatch<SetStateAction<Trainee[]>>;
  setIsAgencyCreated: Dispatch<SetStateAction<boolean>>;
};
