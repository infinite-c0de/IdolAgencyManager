import type { Group, Idol } from '../../types';
import type { GroupMember } from './types';

export function getPrimaryGroup(groups: Group[]) {
  return groups[0] ?? null;
}

export function getGroupMembers(group: Group, idols: Idol[]): GroupMember[] {
  return group.memberIds
    .map(id => idols.find(idol => idol.id === id))
    .filter((idol): idol is GroupMember => Boolean(idol));
}
