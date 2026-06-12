import type { AgencyLogoPreset, Idol, Trainee } from '../../types';

export const agencyLogoPresets: Array<{ id: AgencyLogoPreset; label: string }> = [
  { id: 'NEON_STAR', label: 'Neon Star' },
  { id: 'AURORA_CROWN', label: 'Aurora Crown' },
  { id: 'LUNAR_SPOTLIGHT', label: 'Lunar Spotlight' },
  { id: 'NOVA_COMPASS', label: 'Nova Compass' },
  { id: 'CRYSTAL_WINGS', label: 'Crystal Wings' },
  { id: 'PRISM_DIAMOND', label: 'Prism Diamond' },
  { id: 'STAGE_LIGHTS', label: 'Stage Lights' },
  { id: 'HEART_ORBIT', label: 'Heart Orbit' },
  { id: 'SOUNDWAVE', label: 'Soundwave' },
  { id: 'STAR_RING', label: 'Star Ring' },
  { id: 'LOTUS_IDOL', label: 'Lotus Idol' },
  { id: 'OCEAN_WAVE', label: 'Ocean Wave' },
  { id: 'ORBIT_STAR', label: 'Orbit Star' },
  { id: 'NEON_CHEVRON', label: 'Neon Chevron' },
  { id: 'WINGED_STAR', label: 'Winged Star' },
  { id: 'CRYSTAL_CITY', label: 'Crystal City' },
];

export function hasIdolWithStageName(idols: Idol[], stageName: string) {
  return idols.some(idol => idol.stageName.toLowerCase() === stageName.toLowerCase());
}

export function findTraineeById(trainees: Trainee[], traineeId: string) {
  return trainees.find(trainee => trainee.id === traineeId);
}
