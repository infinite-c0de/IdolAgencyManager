import type { GroupMember, GroupRadarPoint, GroupReadiness } from './types';

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
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
