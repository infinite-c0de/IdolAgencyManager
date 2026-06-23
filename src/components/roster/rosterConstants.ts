import { colors, statColors } from '../../theme';

/** Border + optional glow per idol status. */
export const STATUS_STYLE: Record<string, {
  borderColor: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
}> = {
  Active:    { borderColor: 'rgba(34,211,238,0.55)',  shadowColor: colors.teal,   shadowOpacity: 0.30, shadowRadius: 10 },
  Promoting: { borderColor: 'rgba(217,70,239,0.55)',  shadowColor: colors.violet, shadowOpacity: 0.30, shadowRadius: 10 },
  Resting:   { borderColor: 'rgba(252,211,77,0.45)',  shadowColor: undefined },
  Injured:   { borderColor: 'rgba(251,113,133,0.65)', shadowColor: undefined },
  Trainee:   { borderColor: colors.border,            shadowColor: undefined },
};

/** Accent color per group role. */
export const ROLE_COLOR: Record<string, string> = {
  'Leader':      colors.amber,
  'Main Vocal':  colors.violetBright,
  'Main Dancer': colors.tealBright,
  'Main Rapper': '#F97316',
  'Visual':      statColors.visual,
  'Center':      statColors.visual,
};

export const STAT_ABBREV: Record<string, string> = {
  vocal:    'VOC',
  dance:    'DAN',
  rap:      'RAP',
  visual:   'VIS',
  charisma: 'CHA',
  stamina:  'STM',
  variety:  'VAR',
  acting:   'ACT',
};

export const STAT_FULL: Record<string, string> = {
  vocal:    'Vocal',
  dance:    'Dance',
  rap:      'Rap',
  visual:   'Visual',
  charisma: 'Charisma',
  stamina:  'Stamina',
  variety:  'Variety',
  acting:   'Acting',
};
