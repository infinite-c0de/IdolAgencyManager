import { createGroupFromIdols } from '../features/groups';
import type { CreateGroupPayload, CreateGroupResult, UseGroupActionsParams } from '../features/groups';

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

  return { createGroup };
}
