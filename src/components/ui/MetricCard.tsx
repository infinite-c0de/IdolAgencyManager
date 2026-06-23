import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type MetricCardProps = {
  label: string;
  value: string;
  valueColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function MetricCard({
  label,
  value,
  valueColor,
  containerStyle,
  labelStyle,
  valueStyle,
}: MetricCardProps) {
  return (
    <View style={[styles.card, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.sm,
  },
  label: { fontSize: 10, color: colors.mutedForeground },
  value: { fontSize: 14, fontWeight: '700', color: colors.foreground },
});
