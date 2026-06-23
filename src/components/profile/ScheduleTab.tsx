import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, SectionTitle } from '../AppShell';
import { colors, radius, spacing, statColors } from '../../theme';
import type { Idol } from '../../types';

const TRAINING_ACCENT: Record<string, string> = {
  vocal:    statColors.vocal,
  dance:    statColors.dance,
  rap:      statColors.rap,
  visual:   statColors.visual,
  acting:   statColors.acting,
  language: '#93C5FD',
  lang:     '#93C5FD',
  rest:     '#6B7280',
};

function getAccent(id: string, name: string): string {
  const lower = (id + name).toLowerCase();
  if (lower.includes('vocal'))   return TRAINING_ACCENT.vocal;
  if (lower.includes('dance'))   return TRAINING_ACCENT.dance;
  if (lower.includes('rap'))     return TRAINING_ACCENT.rap;
  if (lower.includes('visual'))  return TRAINING_ACCENT.visual;
  if (lower.includes('acting'))  return TRAINING_ACCENT.acting;
  if (lower.includes('lang'))    return TRAINING_ACCENT.lang;
  if (lower.includes('rest'))    return TRAINING_ACCENT.rest;
  return TRAINING_ACCENT.vocal;
}

const SESSION_ROWS = ['AM', 'PM', 'EVE'] as const;
const SESSION_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

type Props = {
  idol: Idol;
  idolGroup: { id: string } | undefined;
  trainingPlans: Record<string, Record<string, string>>;
  trainingTypes: { id: string; name: string }[];
};

export function ScheduleTab({ idolGroup, trainingPlans, trainingTypes }: Props) {
  const planKey = idolGroup?.id ?? 'SOLO_DEFAULT';
  const plan = trainingPlans[planKey] ?? {};
  const hasSessions = Object.keys(plan).length > 0;

  return (
    <Card glow="teal">
      <SectionTitle>THIS WEEK'S TRAINING PLAN</SectionTitle>
      {hasSessions ? (
        <View style={styles.grid}>
          {/* Header row */}
          <View style={styles.row}>
            <View style={styles.rowLabel} />
            {SESSION_DAYS.map(d => (
              <View key={d} style={styles.dayCell}>
                <Text style={styles.dayHead}>{d}</Text>
              </View>
            ))}
          </View>

          {SESSION_ROWS.map((rowLabel, row) => (
            <View key={row} style={styles.row}>
              <View style={styles.rowLabel}>
                <Text style={styles.rowLabelText}>{rowLabel}</Text>
              </View>
              {SESSION_DAYS.map(d => {
                const key = `${row}-${d}`;
                const typeId = plan[key];
                const matchType = typeId ? trainingTypes.find(t => t.id === typeId) : null;
                const accent = matchType ? getAccent(matchType.id, matchType.name) : undefined;
                const label = matchType ? matchType.name.split(' ')[0] : '';
                return (
                  <View
                    key={key}
                    style={[
                      styles.slot,
                      accent
                        ? { borderColor: accent + '88', backgroundColor: accent + '18' }
                        : styles.slotEmpty,
                    ]}>
                    {accent && <View style={[styles.dot, { backgroundColor: accent }]} />}
                    {label ? (
                      <Text style={[styles.slotText, { color: accent }]} numberOfLines={1}>
                        {label}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>
          No training plan set for this week. Go to the Training screen to plan sessions.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 4 },
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  rowLabel: { width: 28, alignItems: 'flex-end', paddingRight: 2 },
  rowLabelText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8, color: colors.mutedForeground },
  dayCell: { flex: 1, alignItems: 'center' },
  dayHead: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: colors.mutedForeground },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    padding: 1,
  },
  slotEmpty: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  dot: { width: 6, height: 6, borderRadius: radius.full },
  slotText: { fontSize: 7, fontWeight: '700', lineHeight: 9 },
  empty: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
