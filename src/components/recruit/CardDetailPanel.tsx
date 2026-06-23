import { Heart, UserPlus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { Trainee } from '../../types';
import { fmt, fmtCount } from '../../utils/format';
import { ARCHETYPE_COLOR, TRAIT_LABELS } from './recruitConstants';

type Props = {
  trainee: Trainee;
  canAfford: boolean;
  onRecruit: () => void;
};

export function CardDetailPanel({ trainee, canAfford, onRecruit }: Props) {
  const archetype = trainee.personalityProfile?.archetype ?? 'All-Rounder';
  const archetypeColor = ARCHETYPE_COLOR[archetype] ?? colors.mutedForeground;
  const dominance = trainee.personalityProfile?.dominance ?? 55;
  const initialFans = Math.round(40 + trainee.potential * 0.35) * 3200;

  const traitEntries = trainee.personalityProfile
    ? (Object.entries(trainee.personalityProfile.traits) as [string, number][])
    : [];

  return (
    <View style={styles.panel}>

      {/* Personality pills */}
      <View style={styles.pillRow}>
        <TraitPill label={`${archetype}  ${dominance}`} color={archetypeColor} />
        <TraitPill label={trainee.personality} color={colors.mutedForeground} />
      </View>

      {/* Trait bars — single column */}
      {traitEntries.length > 0 && (
        <View style={styles.traitList}>
          {traitEntries.map(([key, val]) => (
            <TraitBar key={key} label={(TRAIT_LABELS[key] ?? key).toUpperCase()} value={val} color={archetypeColor} />
          ))}
        </View>
      )}

      {/* Bio — nationality, full name, languages */}
      <View style={styles.bioSection}>
        <InfoRow label="FULL NAME" value={trainee.fullName ?? trainee.name} />
        <InfoRow label="LANGUAGES" value={trainee.languages.join(' · ')} />
      </View>

      {/* Fans row */}
      <View style={styles.fansRow}>
        <Heart size={12} color="#F9A8D4" />
        <Text style={styles.fansKey}>INITIAL FANBASE</Text>
        <Text style={styles.fansVal}>{fmtCount(initialFans)} fans</Text>
      </View>

      {/* Recruit footer */}
      <View style={styles.recruitRow}>
        <TouchableOpacity
          style={[styles.recruitBtn, !canAfford && styles.recruitBtnDim]}
          onPress={onRecruit}
          activeOpacity={0.8}>
          <UserPlus size={13} color={canAfford ? colors.slate900 : colors.mutedForeground} />
          <Text style={[styles.recruitBtnText, !canAfford && styles.recruitBtnTextDim]}>
            {canAfford ? 'Sign Contract' : 'Insufficient Funds'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{value}</Text>
    </View>
  );
}

function TraitPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + '55' }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.traitBarRow}>
      <Text style={styles.traitBarLabel}>{label}</Text>
      <View style={styles.traitBarTrack}>
        <View style={[styles.traitBarFill, { width: `${value}%`, backgroundColor: color + 'CC' }]} />
      </View>
      <Text style={[styles.traitBarVal, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Dominance bar

  // Trait 2-column grid
  traitList: {
    gap: 7,
  },
  traitBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitBarLabel: {
    width: 82,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  traitBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  traitBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  traitBarVal: {
    fontSize: 10,
    fontWeight: '900',
    width: 20,
    textAlign: 'right',
  },

  // Bio section
  bioSection: {
    gap: 7,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoKey: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    width: 82,
  },
  infoVal: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Fans row
  fansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(249,168,212,0.12)',
  },
  fansKey: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(249,168,212,0.6)',
    flex: 1,
  },
  fansVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F9A8D4',
  },

  // Recruit footer
  recruitRow: {
    marginTop: spacing.xs,
  },
  recruitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recruitBtnDim: {
    backgroundColor: colors.whiteA10,
  },
  recruitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  recruitBtnTextDim: {
    color: colors.mutedForeground,
  },
});
