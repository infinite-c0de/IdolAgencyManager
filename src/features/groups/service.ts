import type { Group, GroupRole, Idol } from '../../types';
import { normalizePersonalityProfile } from '../idols';
import type {
  AddGroupMembersBuildResult,
  AddGroupMembersPayload,
  CreateGroupBuildResult,
  CreateGroupPayload,
  UpdateGroupRolesBuildResult,
  UpdateGroupRolesPayload,
} from './types';
import type { GroupMember, GroupRadarPoint, GroupReadiness } from './types';

const GROUP_GRADIENTS = [
  ['rgba(34,211,238,0.45)', 'rgba(217,70,239,0.42)', 'rgba(52,211,153,0.35)'],  ['rgba(217,70,239,0.45)', 'rgba(139,92,246,0.42)', 'rgba(251,113,133,0.35)'],
  ['rgba(52,211,153,0.45)', 'rgba(20,184,166,0.42)', 'rgba(6,182,212,0.35)'],
  ['rgba(252,211,77,0.42)', 'rgba(251,113,133,0.38)', 'rgba(217,70,239,0.35)'],
];

const MIN_GROUP_MEMBERS = 2;
const MAX_GROUP_MEMBERS = 6;
const REQUIRED_ROLES: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer'];
const CORE_ROLES: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer', 'Main Rapper', 'Visual', 'Center'];

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniq(values: string[]) {
  return [...new Set(values)];
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isAssignedToExistingGroup(idol: Idol, groups: Group[]) {
  const groupRef = idol.group?.trim();
  if (!groupRef) {
    return false;
  }
  return groups.some(group => group.id === groupRef || group.name === groupRef);
}

function calculatePersonalitySynergy(members: Idol[]) {
  const profiles = members.map(member =>
    normalizePersonalityProfile(member.personalityProfile, member.personality),
  );
  const teamworkAvg = avg(profiles.map(profile => profile.traits.teamwork));
  const responsibilityAvg = avg(profiles.map(profile => profile.traits.responsibility));
  const disciplineAvg = avg(profiles.map(profile => profile.traits.discipline));
  const egoAvg = avg(profiles.map(profile => profile.traits.ego));
  const ambitionAvg = avg(profiles.map(profile => profile.traits.ambition));
  const dominanceLeaders = profiles.filter(profile => profile.dominance >= 75).length;
  const centerCount = profiles.filter(profile => profile.archetype === 'Center').length;
  const uniqueArchetypes = new Set(profiles.map(profile => profile.archetype)).size;
  const leader = [...profiles].sort((a, b) => b.traits.responsibility - a.traits.responsibility)[0];

  const cohesionBase = Math.round((teamworkAvg * 0.42 + responsibilityAvg * 0.32 + disciplineAvg * 0.26));
  const diversityBonus = Math.min(12, uniqueArchetypes * 2);
  const leaderMitigation =
    Math.round((leader.traits.responsibility - 50) * 0.18 + (leader.traits.teamwork - 50) * 0.12) +
    (leader.archetype === 'Anchor' || leader.archetype === 'Mediator' ? 4 : 0);
  const dominancePenalty = Math.max(0, dominanceLeaders - 1) * 7 + Math.max(0, centerCount - 1) * 5;
  const egoPenalty = Math.max(0, Math.round((egoAvg - 65) * 0.45));
  const ambitionPenalty = ambitionAvg > 78 && teamworkAvg < 60 ? Math.round((ambitionAvg - 78) * 0.4) : 0;

  return clampScore(
    cohesionBase + diversityBonus + leaderMitigation - dominancePenalty - egoPenalty - ambitionPenalty,
  );
}

function cleanAssignments(roleAssignments: Partial<Record<GroupRole, string>>) {
  return CORE_ROLES.reduce(
    (acc, role) => {
      const idolId = roleAssignments[role];
      if (idolId) {
        acc[role] = idolId;
      }
      return acc;
    },
    {} as Partial<Record<GroupRole, string>>,
  );
}

function scoreForRole(idol: Idol, role: GroupRole) {
  const profile = normalizePersonalityProfile(idol.personalityProfile, idol.personality);
  const responsibilityScore = Math.round((profile.traits.responsibility + profile.traits.teamwork) / 2);
  const centerScore = Math.round((idol.stats.charisma + idol.popularity) / 2);

  switch (role) {
    case 'Leader':
      return responsibilityScore;
    case 'Main Vocal':
      return idol.stats.vocal;
    case 'Main Dancer':
      return idol.stats.dance;
    case 'Main Rapper':
      return idol.stats.rap;
    case 'Visual':
      return idol.stats.visual;
    case 'Center':
      return centerScore;
    default:
      return 50;
  }
}

function calculateRoleSynergy(
  members: Idol[],
  roleAssignments: Partial<Record<GroupRole, string>>,
) {
  const assignedRoles = Object.entries(roleAssignments)
    .map(([role, idolId]) => {
      const member = members.find(m => m.id === idolId);
      return member ? scoreForRole(member, role as GroupRole) : null;
    })
    .filter((score): score is number => score !== null);

  if (!assignedRoles.length) {
    return 45;
  }

  const avgRoleFit = avg(assignedRoles);
  const missingCorePenalty = REQUIRED_ROLES.filter(role => !roleAssignments[role]).length * 12;
  return clampScore(avgRoleFit - missingCorePenalty);
}

function recalculateGroupMetrics(group: Group, members: Idol[]) {
  const popularity = avg(members.map(member => member.popularity));
  const performanceSynergy = Math.round(
    (avg(members.map(member => member.morale)) +
      avg(members.map(member => member.stats.charisma)) +
      avg(members.map(member => member.stats.stamina))) /
      3,
  );
  const personalitySynergy = calculatePersonalitySynergy(members);
  const roleSynergy = calculateRoleSynergy(members, group.roleAssignments ?? {});
  const synergy = clampScore(
    performanceSynergy * 0.45 + personalitySynergy * 0.35 + roleSynergy * 0.2,
  );
  const monthlyRevenue = Math.round((popularity * 1_400_000 + synergy * 900_000) * members.length);

  return { popularity, synergy, monthlyRevenue };
}

export function createGroupFromIdols(
  payload: CreateGroupPayload,
  idols: Idol[],
  existingGroups: Group[],
): CreateGroupBuildResult {
  const name = payload.name.trim();
  const fanName = payload.fanName.trim();
  const concept = payload.concept.trim();
  const logo = payload.logo;
  const memberIds = uniq(payload.memberIds);
  const roleAssignments = cleanAssignments(payload.roleAssignments);

  if (!name) {
    return { ok: false, reason: 'MISSING_NAME' };
  }
  if (!fanName) {
    return { ok: false, reason: 'MISSING_FAN_NAME' };
  }
  if (!concept) {
    return { ok: false, reason: 'MISSING_CONCEPT' };
  }
  if (memberIds.length < MIN_GROUP_MEMBERS) {
    return { ok: false, reason: 'NOT_ENOUGH_MEMBERS' };
  }
  if (memberIds.length > MAX_GROUP_MEMBERS) {
    return { ok: false, reason: 'TOO_MANY_MEMBERS' };
  }
  if (REQUIRED_ROLES.some(role => !roleAssignments[role])) {
    return { ok: false, reason: 'MISSING_REQUIRED_ROLE' };
  }

  const selectedMembers = memberIds
    .map(id => idols.find(idol => idol.id === id && !isAssignedToExistingGroup(idol, existingGroups)))
    .filter((idol): idol is Idol => Boolean(idol));

  if (selectedMembers.length !== memberIds.length) {
    return { ok: false, reason: 'MEMBER_UNAVAILABLE' };
  }
  const hasInvalidRoleAssignee = Object.values(roleAssignments).some(
    idolId => idolId && !memberIds.includes(idolId),
  );
  if (hasInvalidRoleAssignee) {
    return { ok: false, reason: 'INVALID_ROLE_ASSIGNMENT' };
  }

  const popularity = avg(selectedMembers.map(member => member.popularity));
  const performanceSynergy = Math.round(
    (avg(selectedMembers.map(member => member.morale)) +
      avg(selectedMembers.map(member => member.stats.charisma)) +
      avg(selectedMembers.map(member => member.stats.stamina))) /
      3,
  );
  const personalitySynergy = calculatePersonalitySynergy(selectedMembers);
  const roleSynergy = calculateRoleSynergy(selectedMembers, roleAssignments);
  const synergy = clampScore(
    performanceSynergy * 0.45 + personalitySynergy * 0.35 + roleSynergy * 0.2,
  );
  const monthlyRevenue = Math.round((popularity * 1_400_000 + synergy * 900_000) * selectedMembers.length);
  const idBase = slugify(name) || 'group';
  const id = `${idBase}-${Date.now()}`;
  const gradient = GROUP_GRADIENTS[existingGroups.length % GROUP_GRADIENTS.length];
  const group: Group = {
    id,
    name,
    fanName,
    concept,
    logo,
    status: 'Pre-debut',
    popularity,
    monthlyRevenue,
    synergy,
    memberIds,
    roleAssignments,
    gradient,
  };
  const updatedIdols = idols.map(idol =>
    memberIds.includes(idol.id)
      ? {
          ...idol,
          group: name,
          status: 'Active' as const,
          role: Object.entries(roleAssignments)
            .filter(([, memberId]) => memberId === idol.id)
            .map(([role]) => role)
            .join(' / ') || idol.role.replace(' Trainee', ''),
        }
      : idol,
  );

  return { ok: true, group, updatedIdols };
}

export function addMembersToExistingGroup(
  payload: AddGroupMembersPayload,
  idols: Idol[],
  groups: Group[],
): AddGroupMembersBuildResult {
  const group = groups.find(item => item.id === payload.groupId);
  if (!group) {
    return { ok: false, reason: 'GROUP_NOT_FOUND' };
  }

  const requestedIds = uniq(payload.memberIds).filter(id => !group.memberIds.includes(id));
  if (requestedIds.length === 0) {
    return { ok: false, reason: 'NO_MEMBERS_SELECTED' };
  }

  if (group.memberIds.length + requestedIds.length > MAX_GROUP_MEMBERS) {
    return { ok: false, reason: 'TOO_MANY_MEMBERS' };
  }

  const candidates = requestedIds
    .map(id => idols.find(idol => idol.id === id && !isAssignedToExistingGroup(idol, groups)))
    .filter((idol): idol is Idol => Boolean(idol));
  if (candidates.length !== requestedIds.length) {
    return { ok: false, reason: 'MEMBER_UNAVAILABLE' };
  }

  // Bare skill-word roles (e.g. "Visual Trainee" → "Visual") look like formal
  // GroupRole assignments. Replace them with "Member" so newly added idols
  // don't automatically appear as role-holders.
  const BARE_SKILL_ROLES = new Set(['Vocal', 'Dance', 'Rap', 'Visual', 'Charisma', 'Acting']);

  const updatedGroupMemberIds = uniq([...group.memberIds, ...requestedIds]);
  const updatedIdols = idols.map(idol => {
    if (!requestedIds.includes(idol.id)) return idol;
    const cleanedRole = idol.role.replace(' Trainee', '');
    const displayRole = BARE_SKILL_ROLES.has(cleanedRole) ? 'Member' : cleanedRole;
    return {
      ...idol,
      group: group.name,
      status: 'Active' as const,
      role: displayRole,
    };
  });
  const updatedMembers = updatedGroupMemberIds
    .map(id => updatedIdols.find(idol => idol.id === id))
    .filter((idol): idol is Idol => Boolean(idol));
  const metrics = recalculateGroupMetrics(group, updatedMembers);
  const updatedGroup: Group = {
    ...group,
    memberIds: updatedGroupMemberIds,
    popularity: metrics.popularity,
    synergy: metrics.synergy,
    monthlyRevenue: metrics.monthlyRevenue,
  };

  return {
    ok: true,
    group: updatedGroup,
    updatedIdols,
    addedCount: requestedIds.length,
  };
}

export function updateGroupRoles(
  payload: UpdateGroupRolesPayload,
  idols: Idol[],
  groups: Group[],
): UpdateGroupRolesBuildResult {
  const group = groups.find(item => item.id === payload.groupId);
  if (!group) {
    return { ok: false, reason: 'GROUP_NOT_FOUND' };
  }

  const cleanedAssignments = cleanAssignments(payload.roleAssignments);
  const hasInvalidRoleAssignee = Object.values(cleanedAssignments).some(
    idolId => idolId && !group.memberIds.includes(idolId),
  );
  if (hasInvalidRoleAssignee) {
    return { ok: false, reason: 'INVALID_ROLE_ASSIGNMENT' };
  }

  const rolesByMember = new Map<string, GroupRole[]>();
  (Object.entries(cleanedAssignments) as Array<[GroupRole, string]>).forEach(([role, idolId]) => {
    const current = rolesByMember.get(idolId) ?? [];
    current.push(role);
    rolesByMember.set(idolId, current);
  });

  const updatedIdols = idols.map(idol => {
    if (!group.memberIds.includes(idol.id)) return idol;
    const assignedRoles = rolesByMember.get(idol.id) ?? [];
    return {
      ...idol,
      role: assignedRoles.join(' / ') || 'Member',
    };
  });

  const updatedMembers = group.memberIds
    .map(id => updatedIdols.find(idol => idol.id === id))
    .filter((idol): idol is Idol => Boolean(idol));
  const updatedGroupBase: Group = {
    ...group,
    roleAssignments: cleanedAssignments,
  };
  const metrics = recalculateGroupMetrics(updatedGroupBase, updatedMembers);
  const updatedGroup: Group = {
    ...updatedGroupBase,
    popularity: metrics.popularity,
    synergy: metrics.synergy,
    monthlyRevenue: metrics.monthlyRevenue,
  };

  return { ok: true, group: updatedGroup, updatedIdols };
}

export function buildGroupRadar(members: GroupMember[]): GroupRadarPoint[] {
  return [
    { skill: 'VOCAL', v: avg(members.map(member => member.stats.vocal)) },
    { skill: 'DANCE', v: avg(members.map(member => member.stats.dance)) },
    { skill: 'RAP', v: avg(members.map(member => member.stats.rap)) },
    { skill: 'VISUAL', v: avg(members.map(member => member.stats.visual)) },
    { skill: 'CHARISMA', v: avg(members.map(member => member.stats.charisma)) },
  ];
}

export function buildGroupReadiness(members: GroupMember[], group: import('../../types').Group): GroupReadiness {
  const vocalAvg = avg(members.map(member => member.stats.vocal));
  const danceAvg = avg(members.map(member => member.stats.dance));
  const hasLeader = members.some(member => member.role.includes('Leader'));
  const hasRelease = (group.releases?.length ?? 0) > 0;

  const checks = [
    { ok: members.length >= 3, t: '≥ 3 members' },
    { ok: hasLeader, t: 'Leader assigned' },
    { ok: vocalAvg >= 70, t: 'Vocal avg ≥ 70' },
    { ok: danceAvg >= 70, t: 'Dance avg ≥ 70' },
    { ok: hasRelease, t: 'Debut song' },
    { ok: group.status === 'Active', t: 'Promotion plan' },
  ];

  return {
    ready: members.length >= 3 && hasLeader && vocalAvg >= 70 && danceAvg >= 70,
    checks,
  };
}

/** Pure projection used both for preview and actual release. */
export function projectRelease(
  group: Group,
  members: Idol[],
  quality: 1 | 2 | 3 | 4 | 5,
  budget: number,
): import('./types').ReleaseDebutProjection {
  const avgPopularity = members.reduce((s, m) => s + m.popularity, 0) / Math.max(members.length, 1);
  const avgStat = members.reduce((s, m) => s + m.stats.vocal + m.stats.dance + m.stats.charisma, 0) / Math.max(members.length * 3, 1);
  const synergyFactor = group.synergy / 100;
  const qualityMultiplier = [0.5, 0.75, 1.0, 1.35, 1.8][quality - 1];
  const budgetFactor = Math.min(2.0, 1 + budget / 500_000_000);
  const baseScore = (avgPopularity * 0.4 + avgStat * 0.4 + synergyFactor * 20) * qualityMultiplier * budgetFactor;

  const chartPosition = Math.max(1, Math.round(100 - baseScore * 0.85));
  const totalSales = Math.round(baseScore * 4200 * (group.status === 'Pre-debut' ? 1.2 : 1.0));
  const fansGained = Math.round(baseScore * 680 * qualityMultiplier);
  const reputationGained = Math.round(Math.min(12, baseScore / 8 + quality));
  const revenueGained = Math.round(totalSales * 3_800 * qualityMultiplier);

  return { chartPosition, totalSales, fansGained, reputationGained, revenueGained };
}

export function releaseDebut(
  groups: Group[],
  idols: Idol[],
  payload: import('./types').ReleaseDebutPayload,
  currentWeek: number,
): import('./types').ReleaseDebutBuildResult {
  const group = groups.find(g => g.id === payload.groupId);
  if (!group) return { ok: false, reason: 'GROUP_NOT_FOUND' };
  const members = idols.filter(m => group.memberIds.includes(m.id));
  if (members.length < 2) return { ok: false, reason: 'NOT_ENOUGH_MEMBERS' };

  const projection = projectRelease(group, members, payload.quality, payload.budget);
  const popularityBoost = Math.min(15, Math.round(projection.fansGained / 1200));

  const release: import('../../types').Release = {
    id: `${group.id}-rel-${Date.now()}`,
    title: payload.title,
    concept: payload.concept,
    quality: payload.quality,
    language: payload.language,
    budgetSpent: payload.budget,
    weekReleased: currentWeek,
    chartPosition: projection.chartPosition,
    totalSales: projection.totalSales,
    fansGained: projection.fansGained,
    reputationGained: projection.reputationGained,
    revenueGained: projection.revenueGained,
  };

  const updatedGroup: Group = {
    ...group,
    status: 'Active',
    popularity: Math.min(100, group.popularity + popularityBoost),
    monthlyRevenue: Math.round(group.monthlyRevenue + projection.revenueGained / 4),
    releases: [...(group.releases ?? []), release],
  };

  return {
    ok: true,
    group: updatedGroup,
    projection,
    moneyDelta: -payload.budget + projection.revenueGained,
    reputationDelta: projection.reputationGained,
  };
}
