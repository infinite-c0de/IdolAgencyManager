import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export type ProfileTabKey = 'profile' | 'skills' | 'schedule';

const TABS: { key: ProfileTabKey; label: string }[] = [
  { key: 'profile', label: 'PROFILE' },
  { key: 'skills', label: 'SKILLS' },
  { key: 'schedule', label: 'SCHEDULE' },
];

type Props = {
  tab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

export function ProfileTabBar({ tab, onChange }: Props) {
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
