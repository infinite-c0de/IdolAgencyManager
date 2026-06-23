import type { Dispatch, SetStateAction } from 'react';
import type { Agency, AgencyLogo, Idol, Trainee } from '../../types';

export type CreateAgencyPayload = {
  agencyName: string;
  ceoName: string;
  cityId: string;
  logo: AgencyLogo;
};

export type RecruitResult =
  | { ok: true; idolName: string }
  | { ok: false; reason: 'NOT_FOUND' | 'INSUFFICIENT_FUNDS' | 'ALREADY_RECRUITED' | 'ROSTER_FULL' };

export type RefreshScoutingResult =
  | { ok: true; cost: number; visibleCount: number; filterMatches: number }
  | { ok: false; reason: 'INSUFFICIENT_FUNDS' | 'NO_CANDIDATES' };

export type SpendAgencyMoneyResult =
  | { ok: true; cost: number }
  | { ok: false; reason: 'INSUFFICIENT_FUNDS' };

export type ScoutingFilters = {
  skill: string;
  gender: 'All' | 'male' | 'female';
  nationality: string;
};

export type UseAgencyActionsParams = {  agency: Agency;
  idols: Idol[];
  trainees: Trainee[];
  setAgency: Dispatch<SetStateAction<Agency>>;
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setTrainees: Dispatch<SetStateAction<Trainee[]>>;
  setIsAgencyCreated: Dispatch<SetStateAction<boolean>>;
};
