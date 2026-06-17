import type { Group, GroupRole, Idol } from '../../types';
import { normalizePersonalityProfile } from '../idols';
import type { CreateGroupBuildResult, CreateGroupPayload } from './types';
import type { GroupMember, GroupRadarPoint, GroupReadiness } from './types';

const GROUP_GRADIENTS = [
  ['rgba(34,211,238,0.45)', 'rgba(217,70,239,0.42)', 'rgba(52,211,153,0.35)'],
  ['rgba(217,70,239,0.45)', 'rgba(139,92,246,0.42)', 'rgba(251,113,133,0.35)'],
  ['rgba(52,211,153,0.45)', 'rgba(20,184,166,0.42)', 'rgba(6,182,212,0.35)'],
  ['rgba(252,211,77,0.42)', 'rgba(251,113,133,0.38)', 'rgba(217,70,239,0.35)'],
];

const MIN_GROUP_MEMBERS = 2;
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
  if (REQUIRED_ROLES.some(role => !roleAssignments[role])) {
    return { ok: false, reason: 'MISSING_REQUIRED_ROLE' };
  }

  const selectedMembers = memberIds
    .map(id => idols.find(idol => idol.id === id && !idol.group))
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

export function buildGroupRadar(members: GroupMember[]): GroupRadarPoint[] {
  return [
    { skill: 'VOCAL', v: avg(members.map(member => member.stats.vocal)) },
    { skill: 'DANCE', v: avg(members.map(member => member.stats.dance)) },
    { skill: 'RAP', v: avg(members.map(member => member.stats.rap)) },
    { skill: 'VISUAL', v: avg(members.map(member => member.stats.visual)) },
    { skill: 'CHARISMA', v: avg(members.map(member => member.stats.charisma)) },
  ];
}

export function buildGroupReadiness(members: GroupMember[], isActive: boolean): GroupReadiness {
  const vocalAvg = avg(members.map(member => member.stats.vocal));
  const danceAvg = avg(members.map(member => member.stats.dance));
  const hasLeader = members.some(member => member.role.includes('Leader'));

  const checks = [
    { ok: members.length >= 3, t: '≥ 3 members' },
    { ok: hasLeader, t: 'Leader assigned' },
    { ok: vocalAvg >= 70, t: 'Vocal avg ≥ 70' },
    { ok: danceAvg >= 70, t: 'Dance avg ≥ 70' },
    { ok: isActive, t: 'Debut song' },
    { ok: isActive, t: 'Promotion plan' },
  ];

  return {
    ready: members.length >= 3 && hasLeader && vocalAvg >= 70 && danceAvg >= 70,
    checks,
  };
}
