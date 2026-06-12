import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { spacing } from '../../theme';

type MetricGridProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function MetricGrid({ children, style }: MetricGridProps) {
  return <View style={[styles.grid, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
