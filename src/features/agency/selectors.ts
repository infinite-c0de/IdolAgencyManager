import type { Idol, Trainee } from '../../types';

export function hasIdolWithStageName(idols: Idol[], stageName: string) {
  return idols.some(idol => idol.stageName.toLowerCase() === stageName.toLowerCase());
}

export function findTraineeById(trainees: Trainee[], traineeId: string) {
  return trainees.find(trainee => trainee.id === traineeId);
}
