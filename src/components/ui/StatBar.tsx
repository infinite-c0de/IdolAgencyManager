import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

type Props = {
  label: string;
  value: number;
  color: string;
  /** Fixed width for the label column. Defaults to 88. */
  labelWidth?: number;
};

export function StatBar({ label, value, color, labelWidth = 88 }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { width: labelWidth }]}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` as any, backgroundColor: color + 'CC' }]} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  value: {
    fontSize: 11,
    fontWeight: '900',
    width: 22,
    textAlign: 'right',
  },
});
