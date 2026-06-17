import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Heart,
  MoreHorizontal,
  Pin,
  Sparkles,
  UserPlus,
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
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { getGroupMembers, getPrimaryGroup } from '../features/groups';
import { selectDynamicSchedule, type DynamicScheduleItem } from '../features/simulation';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function buildPerformanceStats(idols: ReturnType<typeof useGame>['idols']) {
  if (idols.length === 0) {
    return [
      { label: 'Vocal', v: 0 },
      { label: 'Dance', v: 0 },
      { label: 'Rap', v: 0 },
      { label: 'Visual', v: 0 },
      { label: 'Charisma', v: 0 },
    ];
  }

  return [
    { label: 'Vocal', v: avg(idols.map(idol => idol.stats.vocal)) },
    { label: 'Dance', v: avg(idols.map(idol => idol.stats.dance)) },
    { label: 'Rap', v: avg(idols.map(idol => idol.stats.rap)) },
    { label: 'Visual', v: avg(idols.map(idol => idol.stats.visual)) },
    { label: 'Charisma', v: avg(idols.map(idol => idol.stats.charisma)) },
  ];
}

export function AgencyDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, idols, trainees, groups, revenueHistory, currentWeek, advanceWeek } = useGame();
  const elevate = getPrimaryGroup(groups);
  const members = elevate ? getGroupMembers(elevate, idols) : [];
  const schedule = selectDynamicSchedule(idols, groups);
  const sourceIdols = members.length > 0 ? members : idols;
  const stats = buildPerformanceStats(sourceIdols);
  const radarData = stats.map(stat => ({ skill: stat.label.toUpperCase(), v: stat.v }));

  return (
    <AppShell title="Agency Dashboard" subtitle={`Manage your agency growth · Week ${currentWeek}`}>
      <Card glow="teal">
        <View style={styles.rowBetweenStart}>
          <View style={styles.groupHeading}>
            <View style={styles.agencyLogoBadge}>
              {agency.logo.kind === 'custom' ? (
                <Image source={{ uri: agency.logo.uri }} resizeMode="cover" style={styles.agencyLogoImage} />
              ) : (
                <AgencyLogoMark preset={agency.logo.kind === 'preset' ? agency.logo.preset : 'NEON_STAR'} size={34} />
              )}
            </View>
            <View>
              <Text style={styles.heroTitle}>{agency.name}</Text>
              <View style={styles.agencyMetaRow}>
                <Text style={styles.agencyMetaText}>CEO : {agency.ceoName || 'Unassigned'}</Text>
                <Text style={styles.agencyMetaText}>{agency.city}</Text>
              </View>
            </View>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Career</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.nextWeekBtn} onPress={advanceWeek} activeOpacity={0.85}>
          <FastForward size={14} color={colors.slate900} />
          <Text style={styles.nextWeekText}>Next Week</Text>
        </TouchableOpacity>
        <View style={styles.kpiRow}>
          <KPI icon={<Wallet size={12} color={colors.mint} />} label="Cash" value={fmt(agency.money)} />
          <KPI icon={<Heart size={12} color="#FDA4AF" />} label="Reputation" value={`${agency.reputation}`} sub="/100" />
          <KPI icon={<UserPlus size={12} color={colors.tealBright} />} label="Roster" value={`${idols.length}`} sub="idols" />
        </View>
      </Card>

      <Card>
        <SectionTitle>AGENCY STATUS</SectionTitle>
        <View style={styles.statusGrid}>
          <Mini label="Available Recruits" value={`${trainees.length}`} accent="teal" />
          <Mini label="Groups Formed" value={`${groups.length}`} accent="violet" />
          <Mini label="Monthly Income" value={fmt(agency.monthlyIncome)} accent="mint" />
          <Mini label="Global Rank" value={`#${agency.ranking}`} accent="teal" />
        </View>
        {idols.length === 0 ? (
          <View style={styles.nextStepBox}>
            <Sparkles size={18} color={colors.tealBright} />
            <View style={styles.flex1}>
              <Text style={styles.nextStepTitle}>Start by recruiting your first idol</Text>
              <Text style={styles.nextStepText}>
                Scout candidates, build your roster, then form a group when you have enough members.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.nextStepButton}
              onPress={() => navigation.navigate('Recruit')}
              activeOpacity={0.8}>
              <Text style={styles.nextStepButtonText}>Recruit</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Card>

      {groups.length > 0 ? (
        <Card glow="teal">
          <View style={styles.rowBetweenStart}>
            <Text style={styles.groupTitle}>GROUPS OVERVIEW</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')} activeOpacity={0.8}>
              <Text style={styles.linkText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.groupListWrap}>
            {groups.slice(0, 3).map(group => {
              const groupMembers = getGroupMembers(group, idols);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupListItem}
                  onPress={() => navigation.navigate('GroupProfile', { groupId: group.id })}
                  activeOpacity={0.84}>
                  <View>
                    <Text style={styles.groupListName}>{group.name}</Text>
                    <Text style={styles.tinyMuted}>
                      {groupMembers.length} members · {group.status} · synergy {group.synergy}
                    </Text>
                  </View>
                  <ChevronRight size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ) : null}

      <Card>
        <SectionTitle action={<MoreHorizontal size={16} color={colors.mutedForeground} />}>
          PERFORMANCE · {elevate ? elevate.name : 'AGENCY'}
        </SectionTitle>
        <View style={styles.perfRow}>
          <View style={styles.radarBox}>
            <RadarChart data={radarData} size={180} />
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
        {members.length > 0 ? (
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
        ) : (
          <Text style={styles.emptyHint}>Recruit idols to unlock detailed performance comparisons.</Text>
        )}
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

function ScheduleCard({ s }: { s: DynamicScheduleItem }) {
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
  groupHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  agencyLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
  },
  agencyLogoImage: { width: '100%', height: '100%' },
  alignEnd: { alignItems: 'flex-end' },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  heroTitle: { color: colors.tealBright, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  agencyMetaRow: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  agencyMetaText: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: 10,
    color: colors.mutedForeground,
  },
  groupTitle: { color: colors.tealBright, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  linkText: { color: colors.tealBright, fontSize: 11, fontWeight: '700' },
  activeBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: { color: colors.tealBright, fontSize: 10, fontWeight: '600' },
  nextWeekBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nextWeekText: { fontSize: 12, fontWeight: '800', color: colors.slate900 },

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
  groupListWrap: { marginTop: spacing.md, gap: spacing.sm },
  groupListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  groupListName: { color: colors.foreground, fontSize: 13, fontWeight: '700' },

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

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  nextStepBox: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.45)',
    backgroundColor: 'rgba(34,211,238,0.06)',
    padding: spacing.md,
  },
  nextStepTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  nextStepText: { marginTop: 2, fontSize: 11, color: colors.mutedForeground },
  nextStepButton: {
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nextStepButtonText: { fontSize: 11, fontWeight: '800', color: colors.slate900 },

  perfRow: { alignItems: 'center', gap: spacing.md },
  radarBox: { alignItems: 'center' },
  vBars: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xl },
  vBarCol: { alignItems: 'center', gap: 6 },
  vBarLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.mutedForeground },
  vBarTrack: {
    height: 74,
    width: 10,
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
  emptyHint: { marginTop: spacing.md, fontSize: 11, color: colors.mutedForeground, textAlign: 'center' },

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
