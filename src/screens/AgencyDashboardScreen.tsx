import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Heart,
  Pin,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react-native';
import React, { ReactNode, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card, SectionTitle } from '../components/AppShell';
import { LineChart, ResponsiveChart, lineColors } from '../components/charts';
import { RadarChart } from '../components/charts';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { getGroupMembers } from '../features/groups';
import { selectDynamicSchedule, type DynamicScheduleItem } from '../features/simulation';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function avg(values: number[]) {
  return Math.round(values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1));
}

function buildPerformanceStats(idols: ReturnType<typeof useGame>['idols']) {
  if (idols.length === 0) {
    return [
      { label: 'Vocal', short: 'VOC', v: 0 },
      { label: 'Dance', short: 'DNC', v: 0 },
      { label: 'Rap', short: 'RAP', v: 0 },
      { label: 'Visual', short: 'VIS', v: 0 },
      { label: 'Charisma', short: 'CHA', v: 0 },
    ];
  }
  return [
    { label: 'Vocal', short: 'VOC', v: avg(idols.map(i => i.stats.vocal)) },
    { label: 'Dance', short: 'DNC', v: avg(idols.map(i => i.stats.dance)) },
    { label: 'Rap', short: 'RAP', v: avg(idols.map(i => i.stats.rap)) },
    { label: 'Visual', short: 'VIS', v: avg(idols.map(i => i.stats.visual)) },
    { label: 'Charisma', short: 'CHA', v: avg(idols.map(i => i.stats.charisma)) },
  ];
}

export function AgencyDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, idols, trainees, groups, revenueHistory, currentWeek, advanceWeek } = useGame();
  const [perfGroupId, setPerfGroupId] = useState<string | null>(null);

  const schedule = selectDynamicSchedule(idols, groups);
  const allMembers = idols.slice(0, 8);

  // Performance group picker: null = agency avg, else a specific group
  const selectedGroup = perfGroupId ? (groups.find(g => g.id === perfGroupId) ?? null) : null;
  const perfMembers = selectedGroup ? getGroupMembers(selectedGroup, idols) : [];
  const sourceIdols = perfMembers.length > 0 ? perfMembers : (perfGroupId ? [] : idols);
  const stats = buildPerformanceStats(sourceIdols);
  const radarData = stats.map(s => ({ skill: s.label.toUpperCase(), v: s.v }));

  return (
    <AppShell title="Agency" subtitle={agency.name}>

      {/* ── HERO SECTION ── asymmetric, week ticker on right */}
      <View style={styles.hero}>
        {/* Left column – agency identity */}
        <View style={styles.heroLeft}>
          <View style={styles.heroIdentityRow}>
            {/* Logo */}
            <View style={styles.heroLogoWrap}>
              {agency.logo.kind === 'custom' ? (
                <Image source={{ uri: agency.logo.uri }} resizeMode="cover" style={styles.heroLogoImage} />
              ) : (
                <AgencyLogoMark preset={agency.logo.kind === 'preset' ? agency.logo.preset : 1} size={65} />
              )}
            </View>
            {/* Text stack */}
            <View style={styles.heroTextStack}>
              <Text style={styles.heroEyebrow}>CAREER</Text>
              <Text style={styles.heroAgencyName} numberOfLines={1}>{agency.name}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaText}>{agency.ceoName}</Text>
                {agency.ceoName ? <Text style={styles.heroMetaDot}>·</Text> : null}
                <Text style={styles.heroMetaText}>{agency.city}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right column – week ticker */}
        <View style={styles.weekBlock}>
          <Text style={styles.weekLabel}>WEEK</Text>
          <Text style={styles.weekNum}>{currentWeek}</Text>
          <TouchableOpacity style={styles.nextWeekBtn} onPress={advanceWeek} activeOpacity={0.85}>
            <FastForward size={13} color={colors.slate900} />
            <Text style={styles.nextWeekText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── KPI STRIP ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiStrip}>
        <KpiTile
          icon={<Wallet size={14} color={colors.mint} />}
          label="Cash"
          value={fmt(agency.money)}
          accent={colors.mint}
        />
        <KpiTile
          icon={<Heart size={14} color="#FDA4AF" />}
          label="Reputation"
          value={`${agency.reputation}`}
          sub="/100"
          accent="#FDA4AF"
        />
        <KpiTile
          icon={<UserPlus size={14} color={colors.tealBright} />}
          label="Roster"
          value={`${idols.length}`}
          sub="idols"
          accent={colors.tealBright}
        />
        <KpiTile
          icon={<Users size={14} color={colors.violetBright} />}
          label="Groups"
          value={`${groups.length}`}
          accent={colors.violetBright}
        />
        <KpiTile
          icon={<TrendingUp size={14} color={colors.amber} />}
          label="Rank"
          value={`#${agency.ranking}`}
          accent={colors.amber}
        />
      </ScrollView>

      {/* ── IDOL FILMSTRIP ── full-art horizontal scroll */}
      {allMembers.length > 0 && (
        <View>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>ROSTER</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Idols')} activeOpacity={0.7}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filmstripScroll}>
            {allMembers.map(m => (
              <TouchableOpacity
                key={m.id}
                style={styles.filmCell}
                onPress={() => navigation.navigate('IdolProfile', { id: m.id })}
                activeOpacity={0.85}>
                {m.image ? (
                  <Image source={m.image} resizeMode="cover" style={styles.filmPhoto} />
                ) : (
                  <View style={styles.filmFallback}>
                    <Text style={styles.filmFallbackText}>{m.stageName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.filmOverlay} />
                <Text style={styles.filmName} numberOfLines={1}>{m.stageName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── NEXT STEP CTA if no idols ── */}
      {idols.length === 0 && (
        <Card>
          <View style={styles.ctaBox}>
            <Sparkles size={20} color={colors.tealBright} />
            <View style={styles.flex1}>
              <Text style={styles.ctaTitle}>Start by recruiting your first idol</Text>
              <Text style={styles.ctaBody}>
                Scout candidates, build your roster, then form groups to grow your agency.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Recruit')}
              activeOpacity={0.8}>
              <Text style={styles.ctaBtnText}>Scout</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* ── GROUPS ── */}
      {groups.length > 0 && (
        <Card glow="teal">
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>GROUPS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')} activeOpacity={0.7}>
              <Text style={styles.linkText}>Manage →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.groupList}>
            {groups.slice(0, 3).map(group => {
              const gm = getGroupMembers(group, idols);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupRow}
                  onPress={() => navigation.navigate('GroupProfile', { groupId: group.id })}
                  activeOpacity={0.84}>
                  <View style={styles.groupRowLeft}>
                    <AgencyLogoMark
                      preset={group.logo?.kind === 'preset' ? group.logo.preset : 1}
                      size={28}
                    />
                    <View>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupSub}>
                        {gm.length} members · synergy {group.synergy}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.groupStatusPill}>
                    <Text style={styles.groupStatusText}>{group.status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      )}

      {/* ── PERFORMANCE ── radar + vertical bars side by side */}
      <Card>
        {/* Group switcher tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.perfTabRow}>
          <TouchableOpacity
            style={[styles.perfTab, perfGroupId === null && styles.perfTabActive]}
            onPress={() => setPerfGroupId(null)}
            activeOpacity={0.8}>
            <Text style={[styles.perfTabText, perfGroupId === null && styles.perfTabTextActive]}>
              Agency Avg
            </Text>
          </TouchableOpacity>
          {groups.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.perfTab, perfGroupId === g.id && styles.perfTabActive]}
              onPress={() => setPerfGroupId(g.id)}
              activeOpacity={0.8}>
              <Text style={[styles.perfTabText, perfGroupId === g.id && styles.perfTabTextActive]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.perfRow}>
          <View style={styles.radarBox}>
            <RadarChart data={radarData} size={110} />
          </View>
          <View style={styles.vBars}>
            {stats.map(s => (
              <View key={s.short} style={styles.vBarCol}>
                <View style={styles.vBarTrack}>
                  <Gradient
                    colors={[colors.violet, colors.tealBright]}
                    direction="to-t"
                    style={[styles.vBarFill, { height: `${s.v}%` }]}
                  />
                </View>
                <Text style={styles.vBarNum}>{s.v}</Text>
                <Text style={styles.vBarLabel}>{s.short}</Text>
              </View>
            ))}
          </View>
        </View>
        {perfMembers.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberAvatars}>
            {perfMembers.map(m => (
              <TouchableOpacity
                key={m.id}
                style={styles.avatarItem}
                onPress={() => navigation.navigate('IdolProfile', { id: m.id })}
                activeOpacity={0.7}>
                <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={38} />
                <Text style={styles.avatarName}>{m.stageName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {idols.length === 0 && (
          <Text style={styles.emptyHint}>Recruit idols to see performance data.</Text>
        )}
      </Card>

      {/* ── SCHEDULE ── */}
      <Card>
        <SectionTitle>THIS WEEK</SectionTitle>
        <View style={styles.scheduleGrid}>
          {schedule.map(s => (
            <ScheduleCard key={s.id} s={s} />
          ))}
        </View>
      </Card>

      {/* ── REVENUE CHART ── */}
      <Card>
        <View style={styles.revenueHeader}>
          <SectionTitle>REVENUE</SectionTitle>
          <View style={styles.alignEnd}>
            <Text style={styles.revenueTotal}>₩1.45B</Text>
            <Text style={styles.tinyMuted}>Jan – Sep total</Text>
          </View>
        </View>
        <ResponsiveChart height={160}>
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
          <Legend color={lineColors.group} label="Group" />
          <Legend color={lineColors.solo} label="Solo" />
          <Legend color={lineColors.merch} label="Merch" />
        </View>
      </Card>
    </AppShell>
  );
}

function KpiTile({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <View style={[styles.kpiTile, { borderColor: accent + '33' }]}>
      <View style={styles.kpiHead}>
        {icon}
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={[styles.kpiValue, { color: accent }]}>
        {value}
        {sub ? <Text style={styles.kpiSub}> {sub}</Text> : null}
      </Text>
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
      <Pin size={13} color={colors.violetBright} />
    ) : s.badge === 'alert' ? (
      <AlertCircle size={13} color={colors.hot} />
    ) : (
      <CheckCircle2 size={13} color={colors.tealBright} />
    );
  return (
    <View style={[styles.scheduleCard, accentStyle]}>
      <View style={styles.scheduleBadge}>{badge}</View>
      <View style={styles.scheduleInner}>
        <Text style={styles.scheduleNum}>{s.num}.</Text>
        <View style={styles.flex1}>
          <Text style={styles.scheduleTitle} numberOfLines={1}>{s.title}</Text>
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
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground },
  linkText: { fontSize: 11, fontWeight: '700', color: colors.tealBright },
  alignEnd: { alignItems: 'flex-end' },

  // ── Hero ──
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  heroLeft: { flex: 1 },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroLogoWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.25)',
  },
  heroLogoImage: { width: 52, height: 52 },
  heroTextStack: { flex: 1, gap: 3 },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.teal,
  },
  heroAgencyName: { fontSize: 22, fontWeight: '900', color: colors.foreground, letterSpacing: -0.5 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontSize: 11, color: colors.mutedForeground },
  heroMetaDot: { fontSize: 11, color: colors.border },

  // Week block (right side)
  weekBlock: {
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    backgroundColor: 'rgba(34,211,238,0.05)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 80,
  },
  weekLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: colors.mutedForeground },
  weekNum: { fontSize: 36, fontWeight: '900', color: colors.tealBright, lineHeight: 40 },
  nextWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  nextWeekText: { fontSize: 10, fontWeight: '900', color: colors.slate900 },

  // KPI strip
  kpiStrip: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 2 },
  kpiTile: {
    borderRadius: radius.xl,
    borderWidth: 1,
    backgroundColor: 'rgba(20,23,34,0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 3,
    minWidth: 90,
  },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  kpiLabel: { fontSize: 10, color: colors.mutedForeground },
  kpiValue: { fontSize: 18, fontWeight: '900' },
  kpiSub: { fontSize: 10, fontWeight: '400', color: colors.mutedForeground },

  // Filmstrip
  filmstripScroll: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 2 },
  filmCell: {
    width: 80,
    height: 110,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: '#080B12',
  },
  filmPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  filmFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,211,238,0.05)' },
  filmFallbackText: { fontSize: 18, fontWeight: '900', color: 'rgba(103,232,249,0.3)', letterSpacing: 2 },
  filmOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  filmName: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.foreground,
    textAlign: 'center',
  },

  // CTA box
  ctaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  ctaBody: { marginTop: 2, fontSize: 11, color: colors.mutedForeground },
  ctaBtn: {
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaBtnText: { fontSize: 11, fontWeight: '800', color: colors.slate900 },

  // Groups
  groupList: { gap: spacing.sm },
  groupRow: {
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
  groupRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupName: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  groupSub: { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
  groupStatusPill: {
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  groupStatusText: { fontSize: 9, fontWeight: '700', color: colors.tealBright, letterSpacing: 0.5 },

  // Performance
  perfTabRow: { flexDirection: 'row', gap: 8 },
  perfTab: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  perfTabActive: {
    borderColor: 'rgba(34,211,238,0.55)',
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  perfTabText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  perfTabTextActive: { color: colors.tealBright },

  perfRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  radarBox: { flex: 1, alignItems: 'center' },
  vBars: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  vBarCol: { alignItems: 'center', gap: 3 },
  vBarTrack: {
    height: 60,
    width: 12,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  vBarFill: { width: '100%', borderRadius: radius.full },
  vBarNum: { fontSize: 10, fontWeight: '700', color: colors.foreground },
  vBarLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5, color: colors.mutedForeground, textTransform: 'uppercase' },

  memberAvatars: { flexDirection: 'row', gap: spacing.md },
  avatarItem: { alignItems: 'center', gap: 4 },
  avatarName: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8, color: colors.foreground, textTransform: 'uppercase', maxWidth: 44, textAlign: 'center' },
  emptyHint: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing.md },

  // Schedule
  scheduleGrid: { gap: spacing.sm },
  scheduleCard: {
    position: 'relative',
    borderRadius: radius.xl,
    backgroundColor: colors.whiteA04,
    padding: spacing.md,
    borderWidth: 1,
  },
  accentTeal: { borderColor: 'rgba(34,211,238,0.5)' },
  accentViolet: { borderColor: 'rgba(217,70,239,0.5)' },
  accentHot: { borderColor: 'rgba(251,113,133,0.45)' },
  scheduleBadge: { position: 'absolute', right: spacing.sm, top: spacing.sm, zIndex: 2 },
  scheduleInner: { flexDirection: 'row', gap: spacing.sm },
  scheduleNum: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
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

  // Revenue
  revenueHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.sm },
  revenueTotal: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  legendRow: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'center', marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: radius.full },
});
