import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ARCHETYPE_COLOR, SKILL_COLOR } from '../recruit/recruitConstants';
import { colors, radius, spacing } from '../../theme';
import { Trainee } from '../../types';
import { fmt } from '../../utils/format';

type Props = {
  trainee: Trainee;
  canAfford: boolean;
  expanded: boolean;
};

export function ScoutCardMain({ trainee, canAfford, expanded }: Props) {
  const archetype = trainee.personalityProfile?.archetype ?? 'All-Rounder';
  const dominance = trainee.personalityProfile?.dominance ?? 55;
  const archetypeColor = ARCHETYPE_COLOR[archetype] ?? colors.mutedForeground;
  const skillColor = SKILL_COLOR[trainee.skill] ?? colors.mutedForeground;

  return (
    <View style={styles.main}>

      {/* Name + cost */}
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>{trainee.name}</Text>
        <Text style={[styles.cost, !canAfford && styles.costInsufficient]}>
          {fmt(trainee.cost)}
        </Text>
      </View>

      {/* Flag · nationality · age */}
      <Text style={styles.sub}>
        {trainee.flag}  {trainee.nationality}  ·  {trainee.age}yr
      </Text>

      <View style={styles.divider} />

      {/* Skill tag */}
      <View style={styles.skillRow}>
        <View style={[styles.skillDot, { backgroundColor: skillColor }]} />
        <Text style={[styles.skillLabel, { color: skillColor }]}>
          {trainee.skill.toUpperCase()}
        </Text>
      </View>

      {/* Archetype + dominance bar */}
      <View style={styles.archetypeRow}>
        <Text style={[styles.archetypeLabel, { color: archetypeColor }]}>
          {archetype.toUpperCase()}
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${dominance}%` as any, backgroundColor: archetypeColor + 'CC' },
            ]}
          />
        </View>
        <Text style={[styles.domValue, { color: archetypeColor }]}>{dominance}</Text>
      </View>

      {/* Tap hint — only when collapsed */}
      {!expanded && (
        <Text style={styles.tapHint}>TAP FOR DETAILS</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
    justifyContent: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.foreground,
    flex: 1,
  },
  cost: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.tealBright,
    flexShrink: 0,
  },
  costInsufficient: {
    color: colors.hot,
  },

  sub: {
    fontSize: 10,
    color: colors.mutedForeground,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 1,
  },

  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  skillLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  archetypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    width: 72,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  domValue: {
    fontSize: 10,
    fontWeight: '900',
    width: 18,
    textAlign: 'right',
  },

  tapHint: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.mutedForeground,
    opacity: 0.6,
    marginTop: 2,
  },
});
