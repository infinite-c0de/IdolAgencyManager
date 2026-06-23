import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { fmt } from '../../utils/format';

type Props = {
  money: number;
  reputation: number;
  idolCount: number;
  groupCount: number;
};

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

export function DashboardPulseStrip({ money, reputation, idolCount, groupCount }: Props) {
  return (
    <View style={styles.strip}>
      <Cell label="CASH"       value={fmt(money)}         color={colors.mint} />
      <View style={styles.divider} />
      <Cell label="REPUTATION" value={`${reputation}`}    color={colors.hotSoft} />
      <View style={styles.divider} />
      <Cell label="IDOLS"      value={`${idolCount}`}     color={colors.tealBright} />
      <View style={styles.divider} />
      <Cell label="GROUPS"     value={`${groupCount}`}    color={colors.violetBright} />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,21,32,0.9)',
    paddingVertical: spacing.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});
