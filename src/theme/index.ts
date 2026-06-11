/**
 * Design tokens converted from the original Lovable/Tailwind v4 (oklch) web theme.
 * oklch values were approximated to the closest hex so the neon / glass look is preserved.
 */

export const colors = {
  // Base background stops (used by the app gradient backdrop)
  bgTop: '#080B12',
  bgBottom: '#10131D',

  background: '#0B0E16',
  foreground: '#F4F6FA',

  // Glass surfaces (oklch surface / surface-2 / card)
  surface: '#1B1E2B',
  surface2: '#23273A',
  card: '#1C2030',

  mutedForeground: '#9AA3B5',

  // Accent palette (teal / violet / mint / hot)
  teal: '#22D3EE', // cyan-400
  tealBright: '#67E8F9', // cyan-300
  violet: '#D946EF', // fuchsia-500
  violetBright: '#E879F9', // fuchsia-400
  mint: '#34D399', // emerald-400
  hot: '#FB7185', // rose-400
  amber: '#FCD34D', // amber-300
  slate900: '#0F172A',

  // Hairline borders (white @ 8-10%)
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.10)',
  whiteA04: 'rgba(255,255,255,0.04)',
  whiteA05: 'rgba(255,255,255,0.05)',
  whiteA10: 'rgba(255,255,255,0.10)',
  whiteA15: 'rgba(255,255,255,0.15)',

  black40: 'rgba(0,0,0,0.4)',
  black60: 'rgba(0,0,0,0.6)',
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 20,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const font = {
  // Space Grotesk / Inter aren't bundled; map to platform defaults but keep weights.
  display: undefined as undefined | string,
  sans: undefined as undefined | string,
} as const;

/** Status color used by StatusDot / status chips. */
export const statusColor: Record<string, string> = {
  Active: colors.mint,
  Trainee: colors.teal,
  Resting: colors.amber,
  Injured: colors.hot,
  Promoting: colors.violetBright,
};

/** Named gradients (LinearGradient color arrays), converted from Tailwind class strings. */
export const gradients = {
  tealViolet: [colors.teal, colors.violet],
  cyanToFuchsia: ['#22D3EE', '#D946EF'],
  primaryButton: ['#22D3EE', '#D946EF'],
  barTealFuchsia: ['#22D3EE', '#D946EF'],
} as const;

export type GradientStops = readonly string[];
