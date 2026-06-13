import type { Dispatch, SetStateAction } from 'react';
import type { Group, Idol } from '../../types';

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

export type CreateGroupPayload = {
  name: string;
  fanName: string;
  concept: string;
  memberIds: string[];
};

export type CreateGroupResult =
  | { ok: true; groupName: string }
  | {
      ok: false;
      reason: 'MISSING_NAME' | 'MISSING_FAN_NAME' | 'MISSING_CONCEPT' | 'NOT_ENOUGH_MEMBERS' | 'MEMBER_UNAVAILABLE';
    };

export type CreateGroupBuildResult =
  | { ok: true; group: Group; updatedIdols: Idol[] }
  | Extract<CreateGroupResult, { ok: false }>;

export type UseGroupActionsParams = {
  idols: Idol[];
  groups: Group[];
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setGroups: Dispatch<SetStateAction<Group[]>>;
};
