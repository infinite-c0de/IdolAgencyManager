import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarDays, Lock, Megaphone, Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { formatCompactCount } from '../features/economy';
import { selectDynamicSchedule, selectPromotionOptions } from '../features/simulation';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const eventColor = {
  teal: colors.tealBright,
  violet: colors.violetBright,
  hot: '#FDA4AF',
  mint: colors.mint,
};

function toDurationLabel(hours: number) {
  if (hours >= 24 && hours % 24 === 0) {
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return `${hours}h`;
}

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, cities, idols, groups } = useGame();
  const schedule = selectDynamicSchedule(idols, groups);
  const promotions = selectPromotionOptions(cities, agency, idols, groups);

  const releaseAction = (
    <TouchableOpacity style={styles.releaseBtn} onPress={() => navigation.navigate('Release')} activeOpacity={0.8}>
      <Sparkles size={14} color={colors.slate900} />
      <Text style={styles.releaseText}>New Release</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell title="Schedule" subtitle="Coordinate performances and promotions" action={releaseAction}>
      <Card>
        <SectionTitle>THIS WEEK</SectionTitle>
        <View style={styles.weekRow}>
          {days.map((d, i) => {
            const events = schedule.filter(item => item.dayIndex === i);
            const first = events[0];
            const cellStyle =
              first?.accent === 'teal'
                ? styles.cellTeal
                : first?.accent === 'violet'
                  ? styles.cellViolet
                  : styles.cellIdle;
            return (
              <View key={d} style={styles.dayCol}>
                <Text style={styles.dayHead}>{d}</Text>
                <View style={[styles.dayCell, cellStyle]}>
                  {events.map(ev => (
                    <Text key={ev.id} style={[styles.eventText, { color: eventColor[ev.accent] }]} numberOfLines={2}>
                      {ev.title}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionTitle>UPCOMING ACTIVITIES</SectionTitle>
        <View style={styles.list}>
          {schedule.map(s => (
            <View key={s.id} style={styles.activity}>
              <CalendarDays size={20} color={colors.tealBright} />
              <View style={styles.flex1}>
                <View style={styles.rowBetween}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.tinyMuted}>{s.date}</Text>
                </View>
                <Text style={styles.tinyMuted}>{s.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card glow="violet">
        <SectionTitle>PROMOTION CATALOG</SectionTitle>
        <View style={styles.promoGrid}>
          {promotions.map(p => (
            <View key={p.id} style={styles.promo}>
              <View style={styles.rowBetween}>
                <Text style={styles.promoName}>{p.name}</Text>
                {p.lockedReason ? <Lock size={16} color={colors.mutedForeground} /> : <Megaphone size={16} color={colors.violetBright} />}
              </View>
              <Text style={styles.tinyMuted}>Target · {p.target}</Text>
              <View style={styles.statGrid}>
                <Stat k="Cost" v={fmt(p.cost)} />
                <Stat k="Fans" v={`+${formatCompactCount(p.fansGain)}`} c={colors.mint} />
                <Stat k="Reputation" v={`+${p.reputationGain}`} c={colors.tealBright} />
                <Stat k="Fatigue" v={`+${p.fatigueGain}`} c="#FDA4AF" />
                <Stat k="Duration" v={toDurationLabel(p.durationHours)} />
                <Stat k="Est. Revenue" v={fmt(p.expectedRevenue)} c={colors.violetBright} />
                <Stat k="Efficiency" v={`${p.efficiencyScore}`} />
              </View>
              {p.lockedReason ? <Text style={styles.lockText}>{p.lockedReason}</Text> : null}
              <TouchableOpacity
                style={[styles.scheduleBtn, p.lockedReason && styles.scheduleBtnDisabled]}
                activeOpacity={0.8}>
                <Text style={styles.scheduleBtnText}>{p.lockedReason ? 'Locked' : 'Schedule'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Card>
    </AppShell>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.tinyMuted}>{k}</Text>
      <Text style={[styles.statVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  releaseText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  weekRow: { flexDirection: 'row', gap: 4 },
  dayCol: { flex: 1, alignItems: 'center', gap: 4 },
  dayHead: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', color: colors.mutedForeground },
  dayCell: { height: 80, width: '100%', borderRadius: radius.md, borderWidth: 1, padding: 4 },
  cellIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  cellTeal: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.1)' },
  cellViolet: { borderColor: 'rgba(217,70,239,0.6)', backgroundColor: 'rgba(217,70,239,0.1)' },
  eventText: { fontSize: 9, fontWeight: '700' },

  list: { gap: spacing.sm },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  activityTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground, flexShrink: 1 },

  promoGrid: { gap: spacing.sm },
  promo: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md },
  promoName: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  lockText: { marginTop: spacing.sm, fontSize: 10, color: colors.mutedForeground },
  statGrid: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', flexDirection: 'row', justifyContent: 'space-between', paddingRight: spacing.md, marginBottom: 2 },
  statVal: { fontSize: 10, fontWeight: '600', color: colors.foreground },
  scheduleBtn: { marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.teal, paddingVertical: 6, alignItems: 'center' },
  scheduleBtnDisabled: { backgroundColor: colors.whiteA10 },
  scheduleBtnText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },
});
