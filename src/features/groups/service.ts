import type { Group, Idol } from '../../types';
import type { CreateGroupBuildResult, CreateGroupPayload } from './types';
import type { GroupMember, GroupRadarPoint, GroupReadiness } from './types';

const GROUP_GRADIENTS = [
  ['rgba(34,211,238,0.45)', 'rgba(217,70,239,0.42)', 'rgba(52,211,153,0.35)'],
  ['rgba(217,70,239,0.45)', 'rgba(139,92,246,0.42)', 'rgba(251,113,133,0.35)'],
  ['rgba(52,211,153,0.45)', 'rgba(20,184,166,0.42)', 'rgba(6,182,212,0.35)'],
  ['rgba(252,211,77,0.42)', 'rgba(251,113,133,0.38)', 'rgba(217,70,239,0.35)'],
];

const MIN_GROUP_MEMBERS = 2;

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

export function createGroupFromIdols(
  payload: CreateGroupPayload,
  idols: Idol[],
  existingGroups: Group[],
): CreateGroupBuildResult {
  const name = payload.name.trim();
  const fanName = payload.fanName.trim();
  const concept = payload.concept.trim();
  const memberIds = uniq(payload.memberIds);

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

  const selectedMembers = memberIds
    .map(id => idols.find(idol => idol.id === id && !idol.group))
    .filter((idol): idol is Idol => Boolean(idol));

  if (selectedMembers.length !== memberIds.length) {
    return { ok: false, reason: 'MEMBER_UNAVAILABLE' };
  }

  const popularity = avg(selectedMembers.map(member => member.popularity));
  const synergy = Math.min(
    100,
    Math.round(
      (avg(selectedMembers.map(member => member.morale)) +
        avg(selectedMembers.map(member => member.stats.charisma)) +
        avg(selectedMembers.map(member => member.stats.stamina))) /
        3,
    ),
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
    status: 'Pre-debut',
    popularity,
    monthlyRevenue,
    synergy,
    memberIds,
    gradient,
  };
  const updatedIdols = idols.map(idol =>
    memberIds.includes(idol.id)
      ? {
          ...idol,
          group: name,
          status: 'Active' as const,
          role: idol.role.replace(' Trainee', ''),
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

  const checks = [
    { ok: members.length >= 3, t: '≥ 3 members' },
    { ok: true, t: 'Leader assigned' },
    { ok: vocalAvg >= 70, t: 'Vocal avg ≥ 70' },
    { ok: danceAvg >= 70, t: 'Dance avg ≥ 70' },
    { ok: isActive, t: 'Debut song' },
    { ok: isActive, t: 'Promotion plan' },
  ];

  return {
    ready: members.length >= 3 && vocalAvg >= 70 && danceAvg >= 70,
    checks,
  };
}
