import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { fmt } from '../../utils/format';

type Props = {
  popularity: number;
  monthlyRevenue: number;
  synergy: number;
};

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

export function GroupStatStrip({ popularity, monthlyRevenue, synergy }: Props) {
  return (
    <View style={styles.strip}>
      <StatCell label="POPULAR"  value={`${popularity}%`}                       color={colors.violetBright} />
      <View style={styles.divider} />
      <StatCell label="INCOME"   value={monthlyRevenue ? fmt(monthlyRevenue) : '—'} color={colors.mint} />
      <View style={styles.divider} />
      <StatCell label="SYNERGY"  value={`${synergy}`}                           color={colors.amber} />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  label: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    opacity: 0.75,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
