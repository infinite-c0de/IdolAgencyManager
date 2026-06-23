import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatBar } from '../ui/StatBar';
import { colors, radius, spacing, statColors } from '../../theme';
import type { Idol } from '../../types';
import { fmtCount } from '../../utils/format';

type StatDef = {
  key: string;
  label: string;
  color: string;
  getValue: (idol: Idol) => number;
};

const STAGE_STATS: StatDef[] = [
  { key: 'vocal',    label: 'VOCAL',    color: statColors.vocal,    getValue: i => i.stats.vocal },
  { key: 'dance',    label: 'DANCE',    color: statColors.dance,    getValue: i => i.stats.dance },
  { key: 'rap',      label: 'RAP',      color: statColors.rap,      getValue: i => i.stats.rap },
  { key: 'visual',   label: 'VISUAL',   color: statColors.visual,   getValue: i => i.stats.visual },
  { key: 'charisma', label: 'CHARISMA', color: statColors.charisma, getValue: i => i.stats.charisma },
];

const VERSATILITY_STATS: StatDef[] = [
  { key: 'stamina', label: 'STAMINA', color: statColors.stamina, getValue: i => i.stats.stamina },
  { key: 'variety', label: 'VARIETY', color: statColors.variety, getValue: i => i.stats.variety },
  { key: 'acting',  label: 'ACTING',  color: statColors.acting,  getValue: i => i.stats.acting },
];

type Props = {
  idol: Idol;
};

export function SkillsTab({ idol }: Props) {
  return (
    <View style={styles.container}>

      {/* ── Highlights ── */}
      <View style={styles.highlights}>
        <HighlightCell label="POPULARITY" value={fmtCount(idol.popularity)} color={colors.violetBright} />
        <View style={styles.highlightDivider} />
        <HighlightCell label="RANK" value={`#${idol.rank}`} color={colors.amber} />
      </View>

      {/* ── Stage Performance ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STAGE PERFORMANCE</Text>
        <View style={styles.barList}>
          {STAGE_STATS.map(s => (
            <StatBar
              key={s.key}
              label={s.label}
              value={s.getValue(idol)}
              color={s.color}
              labelWidth={72}
            />
          ))}
        </View>
      </View>

      {/* ── Versatility ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VERSATILITY</Text>
        <View style={styles.barList}>
          {VERSATILITY_STATS.map(s => (
            <StatBar
              key={s.key}
              label={s.label}
              value={s.getValue(idol)}
              color={s.color}
              labelWidth={72}
            />
          ))}
        </View>
      </View>

    </View>
  );
}

function HighlightCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.highlightCell}>
      <Text style={[styles.highlightValue, { color }]}>{value}</Text>
      <Text style={styles.highlightLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  // Highlights
  highlights: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  highlightCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 4,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  highlightLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  highlightDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Section
  section: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  barList: {
    gap: 10,
  },
});
