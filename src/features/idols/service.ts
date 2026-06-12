import type { Idol, Trainee } from '../../types';

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
