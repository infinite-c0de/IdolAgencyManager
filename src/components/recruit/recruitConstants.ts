import { statColors } from '../../theme';

export const SKILL_COLOR: Record<string, string> = {
  Vocal:    statColors.vocal,
  Dance:    statColors.dance,
  Rap:      statColors.rap,
  Visual:   statColors.visual,
  Charisma: statColors.charisma,
};

export const ARCHETYPE_COLOR: Record<string, string> = {
  Center:        statColors.visual,
  Performer:     statColors.dance,
  Strategist:    statColors.rap,
  Anchor:        statColors.charisma,
  Mediator:      statColors.vocal,
  'All-Rounder': '#9AA3B5',
};

export const TRAIT_LABELS: Record<string, string> = {
  ambition:       'Ambition',
  ego:            'Ego',
  teamwork:       'Teamwork',
  responsibility: 'Responsibility',
  discipline:     'Discipline',
  adaptability:   'Adaptability',
};
