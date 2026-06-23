import { FastForward } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { fmt } from '../../utils/format';

type Props = {
  currentWeek: number;
  weeklyCost: number;
  sessionCount: number;
  canAfford: boolean;
  onAdvance: () => void;
};

export function DashboardWeekBlock({ currentWeek, weeklyCost, sessionCount, canAfford, onAdvance }: Props) {
  const warn = weeklyCost > 0 && !canAfford;

  return (
    <View style={[styles.block, warn && styles.blockWarn]}>
      {/* Left: week number */}
      <View style={styles.weekSection}>
        <Text style={styles.weekEyebrow}>WEEK</Text>
        <Text style={[styles.weekNum, warn && styles.weekNumWarn]}>{currentWeek}</Text>
      </View>

      {/* Right: plan summary + advance button */}
      <View style={styles.rightSection}>
        <View style={styles.summaryRow}>
          {sessionCount > 0 ? (
            <Text style={styles.sessionText}>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''} planned
            </Text>
          ) : (
            <Text style={styles.sessionTextEmpty}>No sessions planned</Text>
          )}
          {weeklyCost > 0 && (
            <Text style={[styles.costText, warn && styles.costTextWarn]}>
              {fmt(weeklyCost)}
            </Text>
          )}
        </View>

        {warn && (
          <Text style={styles.warnText}>Insufficient funds for training this week</Text>
        )}

        <TouchableOpacity
          style={[styles.advanceBtn, warn && styles.advanceBtnWarn]}
          onPress={onAdvance}
          activeOpacity={0.82}>
          <FastForward size={12} color={warn ? colors.hot : colors.slate900} />
          <Text style={[styles.advanceText, warn && styles.advanceTextWarn]}>
            Advance to Next Week
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
    padding: spacing.md,
  },
  blockWarn: {
    borderColor: 'rgba(251,113,133,0.45)',
    backgroundColor: 'rgba(251,113,133,0.07)',
  },

  weekSection: {
    alignItems: 'center',
    minWidth: 62,
    gap: 2,
  },
  weekEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.mutedForeground,
  },
  weekNum: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.tealBright,
    lineHeight: 44,
  },
  weekNumWarn: {
    color: colors.hot,
  },

  rightSection: {
    flex: 1,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  sessionTextEmpty: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
  costText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tealBright,
  },
  costTextWarn: {
    color: colors.hot,
  },
  warnText: {
    fontSize: 10,
    color: colors.hot,
    fontWeight: '600',
  },

  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  advanceBtnWarn: {
    backgroundColor: 'rgba(251,113,133,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
  },
  advanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate900,
  },
  advanceTextWarn: {
    color: colors.hot,
  },
});
