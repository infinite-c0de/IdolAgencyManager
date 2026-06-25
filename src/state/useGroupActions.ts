import { addMembersToExistingGroup, createGroupFromIdols, disbandGroup, removeGroupMember, renameGroup, updateGroupRoles } from '../features/groups';
import type {
  AddGroupMembersPayload,
  AddGroupMembersResult,
  CreateGroupPayload,
  CreateGroupResult,
  DisbandGroupResult,
  RemoveGroupMemberPayload,
  RemoveGroupMemberResult,
  RenameGroupPayload,
  RenameGroupResult,
  UpdateGroupRolesPayload,
  UpdateGroupRolesResult,
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

  const updateRoles = (payload: UpdateGroupRolesPayload): UpdateGroupRolesResult => {
    const result = updateGroupRoles(payload, idols, groups);
    if (!result.ok) {
      return result;
    }

    setGroups(current => current.map(group => (group.id === result.group.id ? result.group : group)));
    setIdols(result.updatedIdols);
    return { ok: true, groupName: result.group.name };
  };

  const disbandGroupAction = (groupId: string): DisbandGroupResult => {
    const result = disbandGroup(groups, idols, groupId);
    if (!result.ok) return result;

    setGroups(current => current.map(g => (g.id === result.group.id ? result.group : g)));
    setIdols(result.updatedIdols);
    return { ok: true, groupName: result.group.name };
  };

  const removeGroupMemberAction = (payload: RemoveGroupMemberPayload): RemoveGroupMemberResult => {
    const result = removeGroupMember(groups, idols, payload);
    if (!result.ok) return result;

    setGroups(current => current.map(g => (g.id === result.group.id ? result.group : g)));
    setIdols(result.updatedIdols);
    return { ok: true, groupName: result.group.name };
  };

  const renameGroupAction = (payload: RenameGroupPayload): RenameGroupResult => {
    const result = renameGroup(groups, idols, payload);
    if (!result.ok) return result;

    setGroups(current => current.map(g => (g.id === result.group.id ? result.group : g)));
    setIdols(result.updatedIdols);
    return { ok: true, groupName: result.group.name };
  };

  return {
    createGroup,
    addGroupMembers,
    updateGroupRoles: updateRoles,
    disbandGroup: disbandGroupAction,
    removeGroupMember: removeGroupMemberAction,
    renameGroup: renameGroupAction,
  };
}
