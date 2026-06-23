import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, statColors } from '../../theme';
import { IdolStats } from '../../types';
import { STAT_FULL } from './rosterConstants';

function welfareColor(value: number, baseColor: string): string {
  if (value < 30) return colors.hot;
  if (value < 55) return colors.amber;
  return baseColor;
}

function getTopStat(stats: IdolStats): { label: string; value: number; color: string } {
  const entries = Object.entries(stats) as [keyof typeof statColors, number][];
  const [key, value] = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  return {
    label: STAT_FULL[key] ?? key,
    value,
    color: statColors[key] ?? colors.tealBright,
  };
}

type Props = {
  morale: number;
  energy: number;
  stats: IdolStats;
};

export function CardWelfareStrip({ morale, energy, stats }: Props) {
  const moraleColor = welfareColor(morale, colors.teal);
  const energyColor = welfareColor(energy, colors.mint);
  const topStat = getTopStat(stats);

  return (
    <View style={styles.strip}>
      <StatCell label="MORALE" value={morale} color={moraleColor} />
      {/* <View style={styles.divider} /> */}
      <StatCell label="ENERGY" value={energy} color={energyColor} />
      {/* <View style={styles.divider} /> */}
      <StatCell label={topStat.label.toUpperCase()} value={topStat.value} color={topStat.color} />
    </View>
  );
}

function StatCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.cellValue, { color }]}>{value}</Text>
      <Text style={[styles.cellLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(8,11,18,0.90)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    gap: spacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  cellLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
