import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

function welfareColor(value: number, baseColor: string): string {
  if (value < 30) return colors.hot;
  if (value < 55) return colors.amber;
  return baseColor;
}

type Props = {
  health: number;
  morale: number;
  energy: number;
};

export function CardWelfareStrip({ health, morale, energy }: Props) {
  const healthColor = welfareColor(health, colors.hotSoft);
  const moraleColor = welfareColor(morale, colors.teal);
  const energyColor = welfareColor(energy, colors.mint);

  return (
    <View style={styles.strip}>
      <StatCell label="HEALTH" value={health} color={healthColor} />
      <View style={styles.divider} />
      <StatCell label="MORALE" value={morale} color={moraleColor} />
      <View style={styles.divider} />
      <StatCell label="ENERGY" value={energy} color={energyColor} />
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
