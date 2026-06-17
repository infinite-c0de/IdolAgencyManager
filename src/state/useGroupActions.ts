import { addMembersToExistingGroup, createGroupFromIdols } from '../features/groups';
import type {
  AddGroupMembersPayload,
  AddGroupMembersResult,
  CreateGroupPayload,
  CreateGroupResult,
  UseGroupActionsParams,
} from '../features/groups';

export function useGroupActions({ idols, groups, setIdols, setGroups }: UseGroupActionsParams) {
  const createGroup = (payload: CreateGroupPayload): CreateGroupResult => {
    const result = createGroupFromIdols(payload, idols, groups);

    if (!result.ok) {
      return result;
    }

    setGroups(current => [result.group, ...current]);
    setIdols(result.updatedIdols);

    return { ok: true, groupName: result.group.name };
  };

  const addGroupMembers = (payload: AddGroupMembersPayload): AddGroupMembersResult => {
    const result = addMembersToExistingGroup(payload, idols, groups);
    if (!result.ok) {
      return result;
    }

    setGroups(current => current.map(group => (group.id === result.group.id ? result.group : group)));
    setIdols(result.updatedIdols);
    return { ok: true, groupName: result.group.name, addedCount: result.addedCount };
  };

  return { createGroup, addGroupMembers };
}
