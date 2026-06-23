import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type Check = { ok: boolean; t: string };

type Props = {
  checks: Check[];
  ready: boolean;
};

export function GroupReadinessBar({ checks, ready }: Props) {
  const passed = checks.filter(c => c.ok).length;
  const total = checks.length;

  return (
    <View style={styles.bar}>
      <Text style={styles.label}>DEBUT READINESS</Text>

      <View style={styles.dotsRow}>
        {checks.map((c, i) => (
          <View
            key={i}
            style={[styles.dot, c.ok ? styles.dotOn : styles.dotOff]}
          />
        ))}
      </View>

      <Text style={[styles.count, ready ? styles.countReady : styles.countPending]}>
        {passed} / {total}
        {'  '}
        <Text style={styles.countSub}>{ready ? 'READY' : 'CHECKS'}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
  },
  dotOn: {
    backgroundColor: colors.mint,
  },
  dotOff: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  count: {
    fontSize: 13,
    fontWeight: '900',
    flexShrink: 0,
  },
  countReady: {
    color: colors.mint,
  },
  countPending: {
    color: colors.amber,
  },
  countSub: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
