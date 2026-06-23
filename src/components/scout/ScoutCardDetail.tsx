import { UserPlus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARCHETYPE_COLOR, TRAIT_LABELS } from '../ui/idolConstants';
import { StatBar } from '../ui/StatBar';
import { colors, radius, spacing } from '../../theme';
import { Trainee } from '../../types';
import { fmt } from '../../utils/format';

type Props = {
  trainee: Trainee;
  canAfford: boolean;
  onRecruit: () => void;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{value}</Text>
    </View>
  );
}

export function ScoutCardDetail({ trainee, canAfford, onRecruit }: Props) {
  const archetype = trainee.personalityProfile?.archetype ?? 'All-Rounder';
  const archetypeColor = ARCHETYPE_COLOR[archetype] ?? colors.mutedForeground;
  const traits = trainee.personalityProfile?.traits;

  return (
    <View style={styles.detail}>

      {/* Bio */}
      <View style={styles.bioSection}>
        <InfoRow
          label="FULL NAME"
          value={trainee.fullName ?? trainee.name}
        />
        <InfoRow
          label="LANGUAGES"
          value={trainee.languages.join(' · ')}
        />
      </View>

      <View style={styles.sectionDivider} />

      {/* Trait bars */}
      {traits && (
        <View style={styles.traitSection}>
          {(Object.keys(TRAIT_LABELS) as Array<keyof typeof TRAIT_LABELS>).map(key => {
            const val = (traits as Record<string, number>)[key];
            if (val == null) return null;
            return (
              <StatBar
                key={key}
                label={TRAIT_LABELS[key].toUpperCase()}
                value={val}
                color={archetypeColor}
                labelWidth={112}
              />
            );
          })}
        </View>
      )}

      <View style={styles.sectionDivider} />

      {/* Sign button */}
      <TouchableOpacity
        style={[styles.signBtn, !canAfford && styles.signBtnDisabled]}
        onPress={onRecruit}
        activeOpacity={0.82}
        disabled={!canAfford}>
        <UserPlus size={14} color={canAfford ? colors.background : colors.mutedForeground} />
        <Text style={[styles.signText, !canAfford && styles.signTextDisabled]}>
          Sign Contract  {fmt(trainee.cost)}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  detail: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  // Bio rows
  bioSection: { gap: 6 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoKey: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'right',
    flexShrink: 1,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Traits
  traitSection: { gap: 8 },

  // Sign button
  signBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: 11,
  },
  signBtnDisabled: {
    backgroundColor: colors.whiteA10,
  },
  signText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 0.3,
  },
  signTextDisabled: {
    color: colors.mutedForeground,
  },
});
