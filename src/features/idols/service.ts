import type { Idol, PersonalityArchetype, PersonalityProfile, Trainee } from '../../types';

const DEFAULT_PROFILE: PersonalityProfile = {
  archetype: 'All-Rounder',
  dominance: 55,
  traits: {
    ambition: 62,
    ego: 48,
    teamwork: 64,
    responsibility: 60,
    discipline: 60,
    adaptability: 58,
  },
};

function clampStat(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseLegacyPersonality(label?: string) {
  const text = (label ?? '').toLowerCase();
  const traits = { ...DEFAULT_PROFILE.traits };
  let dominance = DEFAULT_PROFILE.dominance;
  let archetype: PersonalityArchetype = DEFAULT_PROFILE.archetype;

  if (text.includes('ambitious') || text.includes('driven')) {
    traits.ambition += 14;
    dominance += 8;
  }
  if (text.includes('bold') || text.includes('confident') || text.includes('magnetic')) {
    traits.ego += 12;
    dominance += 10;
    archetype = 'Center';
  }
  if (text.includes('strategic') || text.includes('focused') || text.includes('precise')) {
    traits.discipline += 12;
    traits.responsibility += 8;
    archetype = archetype === 'Center' ? archetype : 'Strategist';
  }
  if (text.includes('calm') || text.includes('quiet')) {
    traits.ego -= 8;
    traits.adaptability += 6;
    archetype = archetype === 'Center' ? archetype : 'Anchor';
  }
  if (text.includes('bright') || text.includes('energetic') || text.includes('outgoing')) {
    traits.adaptability += 10;
    traits.teamwork += 8;
    archetype = archetype === 'Center' ? archetype : 'Performer';
  }
  if (text.includes('warm') || text.includes('graceful') || text.includes('hardworking')) {
    traits.teamwork += 8;
    traits.responsibility += 10;
    archetype = archetype === 'Center' ? archetype : 'Mediator';
  }

  return {
    archetype,
    dominance: clampStat(dominance),
    traits: {
      ambition: clampStat(traits.ambition),
      ego: clampStat(traits.ego),
      teamwork: clampStat(traits.teamwork),
      responsibility: clampStat(traits.responsibility),
      discipline: clampStat(traits.discipline),
      adaptability: clampStat(traits.adaptability),
    },
  } satisfies PersonalityProfile;
}

export function normalizePersonalityProfile(
  profile: PersonalityProfile | undefined,
  legacyPersonality?: string,
): PersonalityProfile {
  if (!profile) {
    return parseLegacyPersonality(legacyPersonality);
  }

  return {
    archetype: profile.archetype ?? DEFAULT_PROFILE.archetype,
    dominance: clampStat(profile.dominance ?? DEFAULT_PROFILE.dominance),
    traits: {
      ambition: clampStat(profile.traits?.ambition ?? DEFAULT_PROFILE.traits.ambition),
      ego: clampStat(profile.traits?.ego ?? DEFAULT_PROFILE.traits.ego),
      teamwork: clampStat(profile.traits?.teamwork ?? DEFAULT_PROFILE.traits.teamwork),
      responsibility: clampStat(profile.traits?.responsibility ?? DEFAULT_PROFILE.traits.responsibility),
      discipline: clampStat(profile.traits?.discipline ?? DEFAULT_PROFILE.traits.discipline),
      adaptability: clampStat(profile.traits?.adaptability ?? DEFAULT_PROFILE.traits.adaptability),
    },
  };
}

export function traineeToIdol(trainee: Trainee): Idol {
  const stage = trainee.name.trim();
  const initialBase = stage.toLowerCase().replace(/\s+/g, '-');
  return {
    id: `${initialBase}-${Date.now()}`,
    stageName: stage,
    fullName: stage,
    age: trainee.age,
    dob: 'TBD',
    nationality: trainee.nationality,
    flag: trainee.flag,
    languages: trainee.languages,
    personality: trainee.personality,
    personalityProfile: normalizePersonalityProfile(trainee.personalityProfile, trainee.personality),
    trainingYears: 0,
    role: `${trainee.skill} Trainee`,
    status: 'Trainee',
    popularity: Math.round(40 + trainee.potential * 0.35),
    rank: 99,
    gradient: trainee.gradient,
    image: trainee.image,
    stats: {
      vocal: trainee.skill === 'Vocal' ? 76 : 58,
      dance: trainee.skill === 'Dance' ? 76 : 58,
      rap: trainee.skill === 'Rap' ? 74 : 56,
      visual: trainee.skill === 'Visual' ? 80 : 62,
      charisma: trainee.skill === 'Charisma' ? 82 : 60,
      stamina: 64,
      variety: 52,
      acting: 50,
    },
    health: 84,
    morale: 78,
    energy: 86,
  };
}
