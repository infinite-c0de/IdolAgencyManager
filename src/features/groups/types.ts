import type { Dispatch, SetStateAction } from 'react';
import type { AgencyLogo, Group, GroupRole, Idol } from '../../types';

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
  logo: AgencyLogo;
  memberIds: string[];
  roleAssignments: Partial<Record<GroupRole, string>>;
};

export type CreateGroupResult =
  | { ok: true; groupName: string }
  | {
      ok: false;
      reason:
        | 'MISSING_NAME'
        | 'MISSING_FAN_NAME'
        | 'MISSING_CONCEPT'
        | 'NOT_ENOUGH_MEMBERS'
        | 'TOO_MANY_MEMBERS'
        | 'MEMBER_UNAVAILABLE'
        | 'MISSING_REQUIRED_ROLE'
        | 'INVALID_ROLE_ASSIGNMENT';
    };

export type CreateGroupBuildResult =
  | { ok: true; group: Group; updatedIdols: Idol[] }
  | Extract<CreateGroupResult, { ok: false }>;

export type AddGroupMembersPayload = {
  groupId: string;
  memberIds: string[];
};

export type AddGroupMembersResult =
  | { ok: true; groupName: string; addedCount: number }
  | { ok: false; reason: 'GROUP_NOT_FOUND' | 'NO_MEMBERS_SELECTED' | 'MEMBER_UNAVAILABLE' | 'TOO_MANY_MEMBERS' };

export type AddGroupMembersBuildResult =
  | { ok: true; group: Group; updatedIdols: Idol[]; addedCount: number }
  | Extract<AddGroupMembersResult, { ok: false }>;

export type UpdateGroupRolesPayload = {
  groupId: string;
  roleAssignments: Partial<Record<GroupRole, string>>;
};

export type UpdateGroupRolesResult =
  | { ok: true; groupName: string }
  | { ok: false; reason: 'GROUP_NOT_FOUND' | 'INVALID_ROLE_ASSIGNMENT' };

export type UpdateGroupRolesBuildResult =
  | { ok: true; group: Group; updatedIdols: Idol[] }
  | Extract<UpdateGroupRolesResult, { ok: false }>;

export type ReleaseDebutPayload = {
  groupId: string;
  title: string;
  concept: string;
  quality: 1 | 2 | 3 | 4 | 5;
  language: string;
  budget: number;
};

export type ReleaseDebutProjection = {
  chartPosition: number;
  totalSales: number;
  fansGained: number;
  reputationGained: number;
  revenueGained: number;
};

export type ReleaseDebutResult =
  | { ok: true; projection: ReleaseDebutProjection }
  | { ok: false; reason: 'GROUP_NOT_FOUND' | 'INSUFFICIENT_FUNDS' | 'NOT_ENOUGH_MEMBERS' };

export type ReleaseDebutBuildResult =
  | { ok: true; group: Group; projection: ReleaseDebutProjection; moneyDelta: number; reputationDelta: number }
  | Extract<ReleaseDebutResult, { ok: false }>;

export type UseGroupActionsParams = {
  idols: Idol[];
  groups: Group[];
  setIdols: Dispatch<SetStateAction<Idol[]>>;
  setGroups: Dispatch<SetStateAction<Group[]>>;
};
