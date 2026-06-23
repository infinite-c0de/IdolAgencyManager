import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export type GroupProfileTab = 'lineup' | 'performance' | 'releases';

const TABS: { key: GroupProfileTab; label: string }[] = [
  { key: 'lineup',      label: 'LINEUP' },
  { key: 'performance', label: 'PERFORMANCE' },
  { key: 'releases',    label: 'RELEASES' },
];

type Props = {
  tab: GroupProfileTab;
  onChange: (tab: GroupProfileTab) => void;
};

export function GroupProfileTabBar({ tab, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(t => {
        const active = t.key === tab;
        return (
          <TouchableOpacity key={t.key} style={styles.tab} onPress={() => onChange(t.key)}>
            <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
            {active && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.mutedForeground,
  },
  labelActive: {
    color: colors.tealBright,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.tealBright,
  },
});
