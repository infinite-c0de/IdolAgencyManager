import type { AgencyLogoPreset, Idol, Trainee } from '../../types';

export const agencyLogoPresets: Array<{ id: AgencyLogoPreset; label: string }> = Array.from(
  { length: 35 },
  (_, i) => ({ id: i + 1, label: `Logo ${i + 1}` }),
);

export function hasIdolWithStageName(idols: Idol[], stageName: string) {
  return idols.some(idol => idol.stageName.toLowerCase() === stageName.toLowerCase());
}

export function findTraineeById(trainees: Trainee[], traineeId: string) {
  return trainees.find(trainee => trainee.id === traineeId);
}
