import { AlertCircle, CheckCircle2, Pin } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { DynamicScheduleItem } from '../../features/simulation';

const ACCENT: Record<string, string> = {
  teal:   colors.tealBright,
  violet: colors.violetBright,
  hot:    colors.hot,
  mint:   colors.mint,
};

const ACCENT_BG: Record<string, string> = {
  teal:   'rgba(103,232,249,0.10)',
  violet: 'rgba(232,121,249,0.10)',
  hot:    'rgba(251,113,133,0.10)',
  mint:   'rgba(52,211,153,0.10)',
};

const ACCENT_BORDER: Record<string, string> = {
  teal:   'rgba(103,232,249,0.35)',
  violet: 'rgba(232,121,249,0.35)',
  hot:    'rgba(251,113,133,0.35)',
  mint:   'rgba(52,211,153,0.35)',
};

function BadgeIcon({ badge, color }: { badge: DynamicScheduleItem['badge']; color: string }) {
  if (badge === 'pinned')  return <Pin size={11} color={color} />;
  if (badge === 'alert')   return <AlertCircle size={11} color={color} />;
  return <CheckCircle2 size={11} color={color} />;
}

function AgendaPill({ item, onPress }: { item: DynamicScheduleItem; onPress: () => void }) {
  const accent = ACCENT[item.accent] ?? colors.tealBright;
  const bg     = ACCENT_BG[item.accent] ?? 'rgba(103,232,249,0.08)';
  const border = ACCENT_BORDER[item.accent] ?? 'rgba(103,232,249,0.3)';

  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.8}>
      <BadgeIcon badge={item.badge} color={accent} />
      <Text style={[styles.pillText, { color: accent }]} numberOfLines={1}>{item.title}</Text>
      {item.progress > 0 && (
        <View style={[styles.progressBubble, { borderColor: accent + '55' }]}>
          <Text style={[styles.progressText, { color: accent }]}>{item.progress}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

type Props = {
  schedule: DynamicScheduleItem[];
  onPress: () => void;
};

export function DashboardAgendaStrip({ schedule, onPress }: Props) {
  if (schedule.length === 0) {
    return (
      <View style={styles.emptyRow}>
        <CheckCircle2 size={13} color={colors.mutedForeground} />
        <Text style={styles.emptyText}>Nothing on the schedule this week.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>THIS WEEK</Text>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.headerLink}>Schedule →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {schedule.map(item => (
          <AgendaPill key={item.id} item={item} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  headerLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealBright,
  },
  scroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 140,
  },
  progressBubble: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  progressText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xs,
  },
  emptyText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
});
