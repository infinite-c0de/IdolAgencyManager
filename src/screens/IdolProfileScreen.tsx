import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity,
  Award,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Drama,
  Heart,
  Languages,
  Mic,
  MoreHorizontal,
  Music,
  Star,
  Users,
  Zap,
} from 'lucide-react-native';
import React, { ComponentType, ReactNode, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle, StatusDot } from '../components/AppShell';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type IconType = ComponentType<{ size?: number; color?: string }>;
type IdolModel = import('../types').Idol;

const PROFILE_STAT_BARS: Array<{ key: string; label: string; color: string; getValue: (idol: IdolModel) => number }> = [
  { key: 'vocal', label: 'Vocal', color: '#E879F9', getValue: idol => idol.stats.vocal },
  { key: 'dance', label: 'Dance', color: '#67E8F9', getValue: idol => idol.stats.dance },
  { key: 'rap', label: 'Rap', color: '#FCD34D', getValue: idol => idol.stats.rap },
  { key: 'visual', label: 'Visual', color: '#FB7185', getValue: idol => idol.stats.visual },
  { key: 'charisma', label: 'Charisma', color: '#34D399', getValue: idol => idol.stats.charisma },
  { key: 'stamina', label: 'Stamina', color: '#818CF8', getValue: idol => idol.stats.stamina },
  { key: 'variety', label: 'Variety', color: '#F59E0B', getValue: idol => idol.stats.variety },
  { key: 'acting', label: 'Acting', color: '#A3E635', getValue: idol => idol.stats.acting },
  { key: 'popularity', label: 'Popularity', color: '#F472B6', getValue: idol => idol.popularity },
  { key: 'dominance', label: 'Dominance', color: '#A78BFA', getValue: idol => idol.personalityProfile?.dominance ?? 55 },
];
const INFO_METRIC_KEYS = new Set(['popularity', 'dominance']);

function resolveImageAspectRatio(source?: number) {
  if (!source) {
    return 0.72;
  }

  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) {
    return 0.72;
  }

  return asset.width / asset.height;
}

function formatTrainingMonths(months: number) {
  const safeMonths = Math.max(0, Math.round(months));
  if (safeMonths < 12) {
    return `${safeMonths}months`;
  }
  const years = Math.floor(safeMonths / 12);
  const remain = safeMonths % 12;
  return remain === 0 ? `${years}years` : `${years}years\n${remain}months`;
}

export function IdolProfileScreen({ route }: RootStackScreenProps<'IdolProfile'>) {
  const navigation = useNavigation<Nav>();
  const { idols, groups } = useGame();
  const i = idols.find(x => x.id === route.params.id);
  const idolGroup = i?.group ? groups.find(g => g.name === i.group) : undefined;
  const [tab, setTab] = useState<'info' | 'stats' | 'schedule'>('info');

  if (!i) {
    return (
      <AppShell title="Not found">
        <Card>
          <Text style={styles.body}>This idol isn't on the roster.</Text>
        </Card>
      </AppShell>
    );
  }

  const trainings: { Icon: IconType; label: string }[] = [
    { Icon: Mic, label: 'Vocal Coaching' },
    { Icon: Music, label: 'Dance Practice' },
    { Icon: Mic, label: 'Rap Training' },
    { Icon: Star, label: 'Visual Training' },
    { Icon: Drama, label: 'Acting Class' },
    { Icon: Languages, label: 'Language Lab' },
    { Icon: BedDouble, label: 'Rest' },
    { Icon: MoreHorizontal, label: 'Other' },
  ];
  const achievements: { Icon: IconType; t: string; d: string }[] = [
    { Icon: Award, t: 'Best New Vocalist nomination', d: 'Korea Music Awards · 2 days ago' },
    { Icon: Star, t: 'Stage performance milestone', d: 'Music Bank · 5 days ago' },
    { Icon: Heart, t: 'Crossed 1M fan milestone', d: 'LUMINA fandom · 1 week ago' },
    { Icon: Activity, t: 'Training breakthrough — Vocal +4', d: 'Studio · 2 weeks ago' },
  ];

  const backAction = (
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Idols')} activeOpacity={0.8}>
      <ChevronLeft size={14} color={colors.foreground} />
      <Text style={styles.backText}>Roster</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell
      title={i.stageName}
      subtitle={`${i.status} · ${i.role}${i.group ? ` · ${i.group}` : ' · Solo Artist'}`}
      action={backAction}>
      {/* Hero portrait */}
      <Card glow="teal" style={styles.heroCard}>
        <HeroArt image={i.image} stageName={i.stageName}>
          <View style={styles.heroFooter}>
            <View style={styles.rowBetweenEnd}>
              <View style={styles.flex1}>
                <Text style={styles.heroName} numberOfLines={1}>{i.stageName}</Text>
                <Text style={styles.heroRole} numberOfLines={2}>
                  {i.role}
                </Text>
              </View>
              <View style={styles.heroStatus}>
                <StatusDot status={i.status} />
                <Text style={styles.heroStatusText}> {i.status}</Text>
              </View>
            </View>
          </View>
        </HeroArt>
      </Card>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['info', 'stats', 'schedule'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'info' ? 'INFO' : t === 'stats' ? 'SKILLS' : 'SCHEDULE'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── INFO TAB ── */}
      {tab === 'info' && (
        <Card>
          <View style={styles.identityRow}>
            <View style={styles.flex1}>
              <Text style={styles.fullName}>{i.fullName}</Text>
              <View style={styles.identityMetaRow}>
                <Text style={styles.nationalityLine}>{i.flag} {i.nationality}</Text>
                <View style={[
                  styles.genderBadge,
                  i.gender === 'male' ? styles.genderMale : i.gender === 'female' ? styles.genderFemale : styles.genderNeutral,
                ]}>
                  <Text style={[
                    styles.genderSymbol,
                    i.gender === 'male' ? { color: '#93C5FD' } : i.gender === 'female' ? { color: '#F9A8D4' } : { color: colors.mutedForeground },
                  ]}>
                    {i.gender === 'male' ? '♂' : i.gender === 'female' ? '♀' : '—'}
                  </Text>
                </View>
              </View>
              <Text style={styles.dobLine}>{i.dob}  ·  {i.age} yrs</Text>
            </View>
            <View style={styles.trainingBadge}>
              <Text style={styles.trainingNum}>{formatTrainingMonths(i.trainingMonths)}</Text>
              <Text style={styles.trainingLabel}>TRAINING</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <Tag label={i.personalityProfile?.archetype ?? 'All-Rounder'} color={colors.violetBright} />
            <Tag label={i.personality} color={colors.mutedForeground} />
            {i.languages.map(lang => <Tag key={lang} label={lang} color={colors.tealBright} />)}
          </View>

          <View style={styles.skillList}>
            {PROFILE_STAT_BARS.filter(stat => INFO_METRIC_KEYS.has(stat.key)).map(stat => (
              <ColoredSkillBar key={stat.key} label={stat.label} value={stat.getValue(i)} color={stat.color} />
            ))}
          </View>

          {/* Group info — tappable → Group Profile */}
          {idolGroup ? (
            <TouchableOpacity
              style={styles.groupInfoRow}
              onPress={() => navigation.navigate('GroupProfile', { groupId: idolGroup.id })}
              activeOpacity={0.75}>
              <AgencyLogoMark
                preset={idolGroup.logo?.kind === 'preset' ? idolGroup.logo.preset : 1}
                size={38}
              />
              <View style={styles.groupInfoText}>
                <Text style={styles.groupInfoName}>{idolGroup.name}</Text>
                <View style={styles.groupInfoMeta}>
                  <View style={[styles.groupStatusDot, { backgroundColor: idolGroup.status === 'Active' ? colors.mint : colors.mutedForeground }]} />
                  <Text style={styles.groupInfoSub}>{idolGroup.status}</Text>
                  <Text style={styles.groupInfoDivider}>·</Text>
                  <Users size={10} color={colors.mutedForeground} />
                  <Text style={styles.groupInfoSub}>{idolGroup.memberIds.length} members</Text>
                </View>
              </View>
              <View style={[styles.groupStatusPill, idolGroup.status === 'Active' ? styles.groupStatusActive : styles.groupStatusPre]}>
                <Text style={[styles.groupStatusText, idolGroup.status === 'Active' ? styles.groupStatusTextActive : styles.groupStatusTextPre]}>
                  {idolGroup.status === 'Active' ? 'ACTIVE' : 'PRE-DEBUT'}
                </Text>
              </View>
              <ChevronRight size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.groupInfoRow}>
              <View style={styles.groupInfoSoloIcon}>
                <Text style={styles.groupInfoSoloEmoji}>🎤</Text>
              </View>
              <Text style={styles.groupInfoSoloLabel}>Solo Artist</Text>
            </View>
          )}

          {/* Vitals */}
          <View style={styles.vitalRow}>
            <Vital Icon={Heart} label="Health" v={i.health} color="#FDA4AF" />
            <Vital Icon={Activity} label="Morale" v={i.morale} color={colors.violetBright} />
            <Vital Icon={Zap} label="Energy" v={i.energy} color={colors.mint} />
          </View>
        </Card>
      )}

      {/* ── STATS TAB ── */}
      {tab === 'stats' && (
        <Card>
          <SectionTitle>PERFORMANCE SKILLS</SectionTitle>
          <View style={styles.skillList}>
            {PROFILE_STAT_BARS.filter(stat => !INFO_METRIC_KEYS.has(stat.key)).map(stat => (
              <ColoredSkillBar key={stat.key} label={stat.label} value={stat.getValue(i)} color={stat.color} />
            ))}
          </View>
        </Card>
      )}

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <>
          <Card glow="teal">
            <SectionTitle>TRAINING & DEVELOPMENT</SectionTitle>
            <View style={styles.trainGrid}>
              {trainings.map(({ Icon, label }) => (
                <View key={label} style={styles.trainBtn}>
                  <Icon size={16} color={colors.tealBright} />
                  <Text style={styles.trainLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>
          <Card>
            <SectionTitle>RECENT ACHIEVEMENTS</SectionTitle>
            <View style={styles.achList}>
              {achievements.map(({ Icon, t, d }) => (
                <View key={t} style={styles.achItem}>
                  <Gradient colors={['rgba(34,211,238,0.2)', 'rgba(217,70,239,0.2)']} style={styles.achIcon}>
                    <Icon size={16} color={colors.tealBright} />
                  </Gradient>
                  <View style={styles.flex1}>
                    <Text style={styles.achTitle} numberOfLines={1}>{t}</Text>
                    <Text style={styles.tinyMuted}>{d}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}
    </AppShell>
  );
}

function HeroArt({
  image,
  stageName,
  children,
}: {
  image?: number;
  stageName: string;
  children: ReactNode;
}) {
  const imageAspectRatio = resolveImageAspectRatio(image);
  return (
    <View style={[styles.hero, { aspectRatio: imageAspectRatio }]}>
      {image ? (
        <Image source={image} resizeMode="contain" style={styles.heroImage} />
      ) : (
        <Text style={styles.heroEmptyText}>{stageName}</Text>
      )}
      <View style={styles.heroShade} />
      {children}
    </View>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { borderColor: color + '44' }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function Vital({ Icon, label, v, color }: { Icon: IconType; label: string; v: number; color: string }) {
  return (
    <View style={styles.vital}>
      <View style={styles.vitalHead}>
        <Icon size={12} color={color} />
        <Text style={styles.tinyMuted}> {label}</Text>
      </View>
      <Text style={styles.vitalValue}>
        {v}
        <Text style={styles.tinyMuted}>/100</Text>
      </Text>
    </View>
  );
}

function ColoredSkillBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.coloredSkillRow}>
      <View style={styles.coloredSkillHead}>
        <Text style={styles.coloredSkillLabel}>{label}</Text>
        <Text style={[styles.coloredSkillValue, { color }]}>
          {value}
          <Text style={styles.tinyMuted}>/100</Text>
        </Text>
      </View>
      <View style={styles.coloredSkillTrack}>
        <Gradient
          colors={[color + '88', color + 'EE']}
          direction="to-r"
          style={[styles.coloredSkillFill, { width: `${value}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  body: { fontSize: 14, color: colors.foreground },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
  rowBetweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backText: { fontSize: 11, color: colors.foreground },

  // ── Tabs ──
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderBottomWidth: 2,
    borderBottomColor: colors.tealBright,
  },
  tabText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.mutedForeground },
  tabTextActive: { color: colors.tealBright },

  heroCard: { padding: 0, overflow: 'hidden' },
  hero: {
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: 'rgba(8,10,18,0.85)',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    elevation: 1,
  },
  heroEmptyText: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    fontSize: 18,
    fontWeight: '700',
    color: colors.mutedForeground,
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  heroFooter: { zIndex: 3, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroName: { fontSize: 22, fontWeight: '900', color: colors.tealBright },
  heroRole: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.8)' },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: radius.full,
    backgroundColor: colors.black40,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroStatusText: { fontSize: 10, color: colors.foreground },

  // Identity block
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  identityMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 3 },
  fullName: { fontSize: 20, fontWeight: '900', color: colors.foreground, lineHeight: 24 },
  nationalityLine: { fontSize: 14, color: colors.mutedForeground },
  genderBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  genderMale: { borderColor: 'rgba(147,197,253,0.45)', backgroundColor: 'rgba(147,197,253,0.1)' },
  genderFemale: { borderColor: 'rgba(249,168,212,0.45)', backgroundColor: 'rgba(249,168,212,0.1)' },
  genderNeutral: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  genderSymbol: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
  dobLine: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  trainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 52,
  },
  trainingNum: { fontSize: 12, fontWeight: '900', color: colors.tealBright },
  trainingLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1, color: colors.mutedForeground, textAlign: 'center' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  tag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  infoList: { gap: spacing.sm },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: spacing.sm,
  },
  infoKey: { fontSize: 12, color: colors.mutedForeground },
  infoVal: { fontSize: 12, fontWeight: '600', color: colors.foreground, textAlign: 'right', flexShrink: 1 },

  // ── Group info ──
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  groupInfoText: { flex: 1, gap: 3 },
  groupInfoName: { fontSize: 14, fontWeight: '800', color: colors.foreground },
  groupInfoMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  groupStatusDot: { width: 6, height: 6, borderRadius: radius.full },
  groupInfoSub: { fontSize: 10, color: colors.mutedForeground },
  groupInfoDivider: { fontSize: 10, color: colors.mutedForeground },
  groupStatusPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupStatusActive: { borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.08)' },
  groupStatusPre: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  groupStatusText: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  groupStatusTextActive: { color: colors.mint },
  groupStatusTextPre: { color: colors.mutedForeground },
  groupInfoSoloIcon: { width: 38, height: 38, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.whiteA05 },
  groupInfoSoloEmoji: { fontSize: 18 },
  groupInfoSoloLabel: { fontSize: 13, fontWeight: '700', color: colors.mutedForeground },

  vitalRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  vital: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 10,
  },
  vitalHead: { flexDirection: 'row', alignItems: 'center' },
  vitalValue: { marginTop: 4, fontSize: 18, fontWeight: '700', color: colors.foreground },

  skillList: { marginTop: spacing.md, gap: 8 },
  coloredSkillRow: { gap: 5 },
  coloredSkillHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coloredSkillLabel: { fontSize: 12, color: colors.foreground },
  coloredSkillValue: { fontSize: 13, fontWeight: '800' },
  coloredSkillTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  coloredSkillFill: { height: '100%', borderRadius: radius.full },

  trainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  trainBtn: {
    flexGrow: 1,
    flexBasis: '46%',
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  trainLabel: { fontSize: 11, fontWeight: '600', color: colors.foreground },

  achList: { gap: spacing.sm },
  achItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 10,
  },
  achIcon: { width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  achTitle: { fontSize: 12, fontWeight: '600', color: colors.foreground },
});
