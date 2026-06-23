import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { Trainee } from '../../types';
import { ARCHETYPE_COLOR } from './recruitConstants';

type Props = {
  trainee: Trainee;
  expanded: boolean;
};

export function CardStatStrip({ trainee, expanded }: Props) {
  return (
    <View>
      {/* Tap hint — only when collapsed */}
      {!expanded && (
        <Text style={styles.tapHint}>TAP FOR DETAILS</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archetypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    width: 72,
  },
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  domValue: {
    fontSize: 11,
    fontWeight: '900',
    width: 20,
    textAlign: 'right',
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.mutedForeground,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
