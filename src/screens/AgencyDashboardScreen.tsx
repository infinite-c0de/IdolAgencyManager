import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Heart,
  MoreHorizontal,
  Pin,
  Wallet,
} from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card, SectionTitle } from '../components/AppShell';
import {
  LineChart,
  ResponsiveChart,
  lineColors,
} from '../components/charts';
import { RadarChart } from '../components/charts';
import { Gradient } from '../components/ui/Gradient';
import type { ScheduleItem } from '../data/gameData';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AgencyDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, idols, groups, revenueHistory, schedule, agencyRadar } = useGame();
  const elevate = groups[0];
  const members = elevate.memberIds
    .map(id => idols.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));
  const stats = [
    { label: 'Vocal', v: 92 },
    { label: 'Dance', v: 95 },
    { label: 'Rap', v: 78 },
    { label: 'Visual', v: 89 },
    { label: 'Charisma', v: 90 },
  ];

  return (
    <AppShell title="Control Center" subtitle="Real-time pulse of your agency">
      {/* Group hero */}
      <Card glow="teal">
        <View style={styles.rowBetweenStart}>
          <View>
            <Text style={styles.heroTitle}>{elevate.name}</Text>
            <Text style={styles.tinyMuted}>{members.length} members · Active</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        </View>
        <View style={styles.memberStrip}>
          {members.map(m => (
            <Gradient key={m.id} colors={m.gradient} style={styles.memberCell}>
              {m.image ? <Image source={m.image} resizeMode="cover" style={styles.memberCellImage} /> : null}
              <View style={styles.memberCellNameWrap}>
                <Text style={styles.memberCellName} numberOfLines={1}>
                  {m.stageName}
                </Text>
              </View>
            </Gradient>
          ))}
        </View>
        <View style={styles.kpiRow}>
          <KPI icon={<Heart size={12} color="#FDA4AF" />} label="Popularity" value="88%" sub="+5%" />
          <KPI icon={<Wallet size={12} color={colors.mint} />} label="Income" value={fmt(agency.monthlyIncome)} sub="/mo" />
          <KPI icon={<CalendarCheck size={12} color={colors.tealBright} />} label="Schedule" value="3" sub="active" />
        </View>
      </Card>

      {/* Performance */}
      <Card>
        <SectionTitle action={<MoreHorizontal size={16} color={colors.mutedForeground} />}>
          PERFORMANCE · ELEVATE
        </SectionTitle>
        <View style={styles.perfRow}>
          <View style={styles.radarBox}>
            <RadarChart data={agencyRadar} size={180} />
          </View>
          <View style={styles.vBars}>
            {stats.map(s => (
              <View key={s.label} style={styles.vBarCol}>
                <Text style={styles.vBarLabel}>{s.label}</Text>
                <View style={styles.vBarTrack}>
                  <Gradient
                    colors={[colors.violet, colors.tealBright]}
                    direction="to-t"
                    style={[styles.vBarFill, { height: `${s.v}%` }]}
                  />
                </View>
                <Text style={styles.vBarValue}>{s.v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.avatarRow}>
          {members.map(m => (
            <TouchableOpacity
              key={m.id}
              style={styles.avatarItem}
              onPress={() => navigation.navigate('IdolProfile', { id: m.id })}
              activeOpacity={0.7}>
              <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={42} />
              <Text style={styles.avatarName}>{m.stageName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Schedule */}
      <Card>
        <SectionTitle>CURRENT SCHEDULE</SectionTitle>
        <View style={styles.scheduleGrid}>
          {schedule.map(s => (
            <ScheduleCard key={s.id} s={s} />
          ))}
        </View>
      </Card>

      {/* Revenue */}
      <Card>
        <View style={styles.revenueHeader}>
          <SectionTitle>REVENUE HISTORY</SectionTitle>
          <View style={styles.alignEnd}>
            <Text style={styles.revenueTotal}>₩1.45B</Text>
            <Text style={styles.tinyMuted}>Jan – Sep total</Text>
          </View>
        </View>
        <ResponsiveChart height={180}>
          {width => (
            <LineChart
              width={width}
              data={revenueHistory}
              xKey="m"
              series={[
                { key: 'group', color: lineColors.group, label: 'group' },
                { key: 'solo', color: lineColors.solo, label: 'solo' },
                { key: 'merch', color: lineColors.merch, label: 'merch' },
              ]}
            />
          )}
        </ResponsiveChart>
        <View style={styles.legendRow}>
          <Legend color={lineColors.group} label="group" />
          <Legend color={lineColors.solo} label="solo" />
          <Legend color={lineColors.merch} label="merch" />
        </View>
        <View style={styles.miniGrid}>
          <Mini label="Monthly Profit" value={fmt(170_000_000)} accent="mint" />
          <Mini label="Fan Growth" value="+128K" accent="teal" />
          <Mini label="Promotion" value={fmt(82_000_000)} accent="violet" />
          <Mini label="Reputation" value="+4" accent="mint" />
        </View>
      </Card>
    </AppShell>
  );
}

function KPI({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
  return (
    <View style={styles.kpi}>
      <View style={styles.kpiHead}>
        {icon}
        <Text style={styles.kpiLabel}> {label}</Text>
      </View>
      <Text style={styles.kpiValue}>
        {value} <Text style={styles.kpiSub}>{sub}</Text>
      </Text>
    </View>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent: 'mint' | 'teal' | 'violet' }) {
  const dot = accent === 'mint' ? colors.mint : accent === 'teal' ? colors.teal : colors.violetBright;
  return (
    <View style={styles.mini}>
      <View style={styles.miniHead}>
        <View style={[styles.miniDot, { backgroundColor: dot }]} />
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.tinyMuted}>{label}</Text>
    </View>
  );
}

function ScheduleCard({ s }: { s: ScheduleItem }) {
  const accentStyle =
    s.accent === 'teal'
      ? styles.accentTeal
      : s.accent === 'violet'
        ? styles.accentViolet
        : styles.accentHot;
  const badge =
    s.badge === 'pinned' ? (
      <Pin size={14} color={colors.violetBright} />
    ) : s.badge === 'alert' ? (
      <AlertCircle size={14} color={colors.hot} />
    ) : (
      <CheckCircle2 size={14} color={colors.tealBright} />
    );
  return (
    <View style={[styles.scheduleCard, accentStyle]}>
      <View style={styles.scheduleBadge}>{badge}</View>
      <View style={styles.scheduleInner}>
        <Text style={styles.scheduleNum}>{s.num}.</Text>
        <View style={styles.flex1}>
          <Text style={styles.scheduleTitle} numberOfLines={1}>
            {s.title}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.tinyMuted}>{s.category}</Text>
            <Text style={styles.tinyMuted}>{s.date}</Text>
          </View>
          {s.progress > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <Gradient
                  colors={[colors.teal, colors.violet]}
                  direction="to-r"
                  style={[styles.progressFill, { width: `${s.progress}%` }]}
                />
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.tinyMuted}>in progress</Text>
                <Text style={styles.progressPct}>{s.progress}%</Text>
              </View>
            </View>
          )}
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsText}>Details</Text>
            <ChevronRight size={12} color={colors.mutedForeground} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBetweenStart: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  alignEnd: { alignItems: 'flex-end' },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  heroTitle: { color: colors.tealBright, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  activeBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: { color: colors.tealBright, fontSize: 10, fontWeight: '600' },

  memberStrip: {
    marginTop: spacing.md,
    flexDirection: 'row',
    height: 112,
    gap: 6,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  memberCell: { flex: 1, justifyContent: 'flex-end', overflow: 'hidden' },
  memberCellImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    elevation: 1,
    opacity: 1,
  },
  memberCellNameWrap: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingVertical: 6,
    paddingHorizontal: 4,
    zIndex: 2,
  },
  memberCellName: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },

  kpiRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  kpi: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 10,
  },
  kpiHead: { flexDirection: 'row', alignItems: 'center' },
  kpiLabel: { fontSize: 10, color: colors.mutedForeground },
  kpiValue: { marginTop: 4, fontSize: 16, fontWeight: '700', color: colors.foreground },
  kpiSub: { fontSize: 10, fontWeight: '400', color: colors.mint },

  perfRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  radarBox: { flex: 1, alignItems: 'center' },
  vBars: { flexDirection: 'row', gap: 6 },
  vBarCol: { alignItems: 'center', gap: 6 },
  vBarLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  vBarTrack: {
    height: 96,
    width: 12,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  vBarFill: { width: '100%', borderRadius: radius.full },
  vBarValue: { fontSize: 12, fontWeight: '700', color: colors.foreground },

  avatarRow: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  avatarItem: { alignItems: 'center', gap: 4 },
  avatarName: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: colors.foreground },

  scheduleGrid: { gap: spacing.sm },
  scheduleCard: {
    position: 'relative',
    borderRadius: radius.xl,
    backgroundColor: colors.whiteA04,
    padding: spacing.md,
    borderWidth: 1,
  },
  accentTeal: { borderColor: 'rgba(34,211,238,0.6)' },
  accentViolet: { borderColor: 'rgba(217,70,239,0.6)' },
  accentHot: { borderColor: 'rgba(251,113,133,0.5)' },
  scheduleBadge: { position: 'absolute', right: 8, top: 8, zIndex: 2 },
  scheduleInner: { flexDirection: 'row', gap: spacing.sm },
  scheduleNum: { fontSize: 22, fontWeight: '900', color: colors.tealBright },
  scheduleTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  progressWrap: { marginTop: spacing.sm, gap: 4 },
  progressTrack: { height: 4, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressPct: { fontSize: 10, fontWeight: '600', color: colors.tealBright },
  detailsBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  detailsText: { fontSize: 10, color: colors.foreground },

  revenueHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  revenueTotal: { color: colors.tealBright, fontSize: 20, fontWeight: '900' },
  legendRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: radius.full },

  miniGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mini: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 10,
  },
  miniHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniDot: { width: 6, height: 6, borderRadius: radius.full },
  miniValue: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginTop: 2 },
});
