import type { Idol, PersonalityArchetype, PersonalityProfile, Trainee } from '../../types';
import { scoutingNationalityProfiles, scoutingSkillOptions } from '../../data/gameData';

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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function randomGaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function gaussianInt(mean: number, stdDev: number, min: number, max: number) {
  return clampRange(mean + randomGaussian() * stdDev, min, max);
}

function randomPick<T>(list: readonly T[]) {
  return list[randInt(0, list.length - 1)];
}

function shuffle<T>(values: T[]) {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildPersonalitySummary(profile: PersonalityProfile) {
  const words: string[] = [];
  if (profile.traits.teamwork >= 72) words.push('Collaborative');
  if (profile.traits.discipline >= 72) words.push('Focused');
  if (profile.traits.ambition >= 74) words.push('Ambitious');
  if (profile.traits.ego >= 70) words.push('Assertive');
  if (profile.traits.adaptability >= 72) words.push('Adaptive');
  if (words.length === 0) words.push('Balanced');
  return `${words[0]}, ${words[Math.min(1, words.length - 1)]}`;
}

const RANDOM_GRADIENTS = [
  ['rgba(217,70,239,0.4)', 'rgba(139,92,246,0.4)', 'rgba(34,211,238,0.4)'],
  ['rgba(34,211,238,0.4)', 'rgba(14,165,233,0.4)', 'rgba(139,92,246,0.4)'],
  ['rgba(251,113,133,0.4)', 'rgba(217,70,239,0.4)', 'rgba(99,102,241,0.4)'],
  ['rgba(52,211,153,0.4)', 'rgba(20,184,166,0.4)', 'rgba(6,182,212,0.4)'],
  ['rgba(252,211,77,0.4)', 'rgba(251,113,133,0.4)', 'rgba(217,70,239,0.4)'],
  ['rgba(129,140,248,0.4)', 'rgba(139,92,246,0.4)', 'rgba(236,72,153,0.4)'],
];

const INITIAL_VISIBLE_SCOUTING_COUNT = 12;

function getNationalityProfile(nationality?: string) {
  return (
    scoutingNationalityProfiles.find(profile => profile.nationality === nationality) ??
    randomPick(scoutingNationalityProfiles)
  );
}

function estimateDob(age: number, key: string) {
  const now = new Date();
  const year = now.getFullYear() - age;
  const hash = Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const month = ((hash % 12) + 1).toString().padStart(2, '0');
  const day = (((hash % 27) + 1)).toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeNameIdentity(trainee: Trainee, fallbackKey: string) {
  const nationality = getNationalityProfile(trainee.nationality);
  const stage = trainee.name.trim();
  const family = randomPick(nationality.familyNames);
  const given = randomPick(nationality.givenNames);
  return {
    stageName: stage || randomPick(nationality.stageNames),
    fullName: trainee.fullName?.trim() || `${family} ${given}`,
    dob: trainee.dob || estimateDob(trainee.age, fallbackKey),
  };
}

export function normalizeTraineeIdentity(trainee: Trainee) {
  const identity = normalizeNameIdentity(trainee, trainee.id);
  return {
    ...trainee,
    name: identity.stageName,
    fullName: identity.fullName,
    dob: identity.dob,
  };
}

export function normalizeIdolIdentity(idol: Idol) {
  return {
    ...idol,
    fullName: idol.fullName?.trim() || idol.stageName,
    dob: idol.dob && idol.dob !== 'TBD' ? idol.dob : estimateDob(idol.age, idol.id),
  };
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

type TraineeArtSeed = {
  artKey: number;
  gender: 'male' | 'female';
  availableNationality: string;
  image: number;
};

function pickNationalityForArt(art: TraineeArtSeed) {
  if (art.availableNationality.trim() === 'All') {
    return randomPick(scoutingNationalityProfiles);
  }

  const allowed = art.availableNationality
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const eligible = scoutingNationalityProfiles.filter(profile =>
    allowed.includes(profile.nationality),
  );

  return eligible.length > 0 ? randomPick(eligible) : randomPick(scoutingNationalityProfiles);
}

export function generateScoutingPoolFromArtPool(artPool: readonly TraineeArtSeed[]): Trainee[] {
  const usedStageNames = new Set<string>();
  const shuffledArtPool = shuffle([...artPool]);
  const archetypeProfiles: Record<PersonalityArchetype, { dominance: number; traits: PersonalityProfile['traits'] }> = {
    Center: {
      dominance: 74,
      traits: { ambition: 80, ego: 72, teamwork: 62, responsibility: 64, discipline: 66, adaptability: 62 },
    },
    Anchor: {
      dominance: 48,
      traits: { ambition: 60, ego: 42, teamwork: 72, responsibility: 76, discipline: 74, adaptability: 58 },
    },
    Performer: {
      dominance: 63,
      traits: { ambition: 72, ego: 58, teamwork: 70, responsibility: 60, discipline: 66, adaptability: 76 },
    },
    Strategist: {
      dominance: 58,
      traits: { ambition: 70, ego: 50, teamwork: 64, responsibility: 76, discipline: 80, adaptability: 58 },
    },
    Mediator: {
      dominance: 54,
      traits: { ambition: 66, ego: 44, teamwork: 78, responsibility: 74, discipline: 68, adaptability: 70 },
    },
    'All-Rounder': {
      dominance: 56,
      traits: { ambition: 68, ego: 52, teamwork: 68, responsibility: 68, discipline: 68, adaptability: 68 },
    },
  };

  return shuffledArtPool.map((art, index) => {
    const nationality = pickNationalityForArt(art);
    const skill = randomPick(scoutingSkillOptions);
    const age = gaussianInt(18.5, 1.7, 16, 22);
    // Gaussian distribution keeps most trainees mid-tier and rare outliers.
    const potential = gaussianInt(78, 7.5, 62, 96);
    const archetype = randomPick([
      'Center',
      'Anchor',
      'Performer',
      'Strategist',
      'Mediator',
      'All-Rounder',
    ] as const satisfies readonly PersonalityArchetype[]);
    const archetypeBase = archetypeProfiles[archetype];
    const personalityProfile: PersonalityProfile = {
      archetype,
      dominance: gaussianInt(archetypeBase.dominance, 8, 35, 90),
      traits: {
        ambition: gaussianInt(archetypeBase.traits.ambition, 9, 35, 95),
        ego: gaussianInt(archetypeBase.traits.ego, 10, 20, 92),
        teamwork: gaussianInt(archetypeBase.traits.teamwork, 9, 35, 95),
        responsibility: gaussianInt(archetypeBase.traits.responsibility, 9, 35, 95),
        discipline: gaussianInt(archetypeBase.traits.discipline, 9, 35, 95),
        adaptability: gaussianInt(archetypeBase.traits.adaptability, 9, 35, 95),
      },
    };
    const stagePool = shuffle([...nationality.stageNames]);
    const pickedStage = stagePool[index % stagePool.length] ?? randomPick(nationality.stageNames);
    const stageName = usedStageNames.has(pickedStage) ? `${pickedStage}${index + 1}` : pickedStage;
    usedStageNames.add(stageName);
    const id = `trn-${art.gender[0]}-${Date.now()}-${index}-${randInt(1000, 9999)}`;

    return {
      id,
      artKey: art.artKey,
      gender: art.gender,
      isScoutingVisible: index < INITIAL_VISIBLE_SCOUTING_COUNT,
      name: stageName,
      fullName: `${randomPick(nationality.familyNames)} ${randomPick(nationality.givenNames)}`,
      age,
      dob: estimateDob(age, `${art.artKey}-${index}`),
      nationality: nationality.nationality,
      flag: nationality.flag,
      languages: [...nationality.languages],
      potential,
      skill,
      personality: buildPersonalitySummary(personalityProfile),
      personalityProfile,
      cost: Math.round((18_000_000 + potential * 620_000) * (1 + randInt(0, 12) / 100)),
      gradient: randomPick(RANDOM_GRADIENTS),
      image: art.image,
    } satisfies Trainee;
  });
}

export function traineeToIdol(trainee: Trainee): Idol {
  const identity = normalizeNameIdentity(trainee, trainee.id);
  const stage = identity.stageName;
  const initialBase = stage.toLowerCase().replace(/\s+/g, '-');
  return {
    id: `${initialBase}-${Date.now()}`,
    artKey: trainee.artKey,
    stageName: stage,
    fullName: identity.fullName,
    gender: trainee.gender,
    age: trainee.age,
    dob: identity.dob,
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
