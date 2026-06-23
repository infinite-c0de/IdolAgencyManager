export const colors = {
  // Base background stops (used by the app gradient backdrop)
  bgTop: '#080B12',
  bgBottom: '#10131D',

  // "Outside game" screens (Main Menu, Settings) — slightly warmer
  bgOutsideTop: '#050711',
  bgOutsideMid: '#0D1220',
  bgOutsideBot: '#1A0D2E',

  background: '#0B0E16',
  foreground: '#F4F6FA',

  // Glass surfaces
  surface: '#1B1E2B',
  surface2: '#23273A',
  card: 'rgba(28,32,48,0.7)',

  mutedForeground: '#9AA3B5',

  // Accent palette
  teal: '#22D3EE',       // cyan-400  — operational actions (train, advance week)
  tealBright: '#67E8F9', // cyan-300  — active state labels, links
  violet: '#D946EF',     // fuchsia-500 — idol/creative context (groups, releases)
  violetBright: '#E879F9', // fuchsia-400
  mint: '#34D399',       // emerald-400 — positive outcomes (fans, revenue, health)
  hot: '#FB7185',        // rose-400   — danger, errors
  hotSoft: '#FDA4AF',    // rose-300   — expense labels, cost text
  amber: '#FCD34D',      // amber-300  — warnings, prestige, resting status
  gold: '#D4AF37',       // gold       — premium / legendary tier
  slate900: '#0F172A',

  // Hairline borders
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.18)',  // was 0.10 — now visibly distinct

  // Surface tints
  whiteA04: 'rgba(255,255,255,0.04)',
  whiteA05: 'rgba(255,255,255,0.05)',
  whiteA10: 'rgba(255,255,255,0.10)',
  whiteA15: 'rgba(255,255,255,0.15)',

  // Active-state teal surface (chip/slot selected bg) — one value for entire app
  tealActiveBg: 'rgba(34,211,238,0.10)',
  tealActiveBorder: 'rgba(34,211,238,0.55)',

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

/** 6-step typographic scale. Use these instead of ad-hoc font sizes. */
export const fontSize = {
  xs: 10,   // captions, micro-labels
  sm: 12,   // secondary body
  md: 14,   // primary body
  lg: 17,   // card titles
  xl: 22,   // section/page headings
  '2xl': 28, // hero numerics
} as const;

export const font = {
  display: undefined as undefined | string,
  sans: undefined as undefined | string,
} as const;

/** Idol performance stat accent colors — single source of truth. */
export const statColors = {
  vocal:    '#E879F9', // fuchsia-400  (= colors.violetBright)
  dance:    '#67E8F9', // cyan-300     (= colors.tealBright)
  rap:      '#F97316', // orange-500   — distinct from amber/warning
  visual:   '#F472B6', // pink-400     — distinct from hot/danger rose
  charisma: '#34D399', // emerald-400  (= colors.mint)
  stamina:  '#818CF8', // indigo-400
  variety:  '#F59E0B', // amber-500
  acting:   '#A3E635', // lime-400
} as const;

/** Status color used by StatusDot / status chips. */
export const statusColor: Record<string, string> = {
  Active: colors.mint,
  Trainee: colors.teal,
  Resting: colors.amber,
  Injured: colors.hot,
  Promoting: colors.violetBright,
};

/** Named gradients. */
export const gradients = {
  tealViolet: [colors.teal, colors.violet],
  cyanToFuchsia: ['#22D3EE', '#D946EF'],
  primaryButton: ['#22D3EE', '#D946EF'],
  barTealFuchsia: ['#22D3EE', '#D946EF'],
} as const;

export type GradientStops = readonly string[];
