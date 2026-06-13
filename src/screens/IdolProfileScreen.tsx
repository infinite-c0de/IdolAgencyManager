import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity,
  Award,
  BedDouble,
  ChevronLeft,
  Drama,
  Heart,
  Languages,
  Mic,
  MoreHorizontal,
  Music,
  Star,
  Zap,
} from 'lucide-react-native';
import React, { ComponentType, ReactNode } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle, SkillBar, StatusDot } from '../components/AppShell';
import { RadarChart } from '../components/charts';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type IconType = ComponentType<{ size?: number; color?: string }>;

export function IdolProfileScreen({ route }: RootStackScreenProps<'IdolProfile'>) {
  const navigation = useNavigation<Nav>();
  const { idols } = useGame();
  const i = idols.find(x => x.id === route.params.id);

  if (!i) {
    return (
      <AppShell title="Not found">
        <Card>
          <Text style={styles.body}>This idol isn't on the roster.</Text>
        </Card>
      </AppShell>
    );
  }

  const radar = [
    { skill: 'VOCAL', v: i.stats.vocal },
    { skill: 'DANCE', v: i.stats.dance },
    { skill: 'RAP', v: i.stats.rap },
    { skill: 'VISUAL', v: i.stats.visual },
    { skill: 'CHARISMA', v: i.stats.charisma },
  ];
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
    <AppShell title={i.stageName} subtitle={`${i.role} · ${i.group ?? 'Solo'}`} action={backAction}>
      {/* Hero portrait */}
      <Card glow="teal" style={styles.heroCard}>
        <HeroArt image={i.image} gradient={i.gradient}>
          <View style={styles.heroFooter}>
            <View style={styles.rowBetweenEnd}>
              <View>
                <Text style={styles.heroName}>{i.stageName}</Text>
                <Text style={styles.heroRole}>
                  {i.role} · {i.group ?? 'Solo'}
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

      {/* Basic info */}
      <Card>
        <SectionTitle>BASIC INFO</SectionTitle>
        <View style={styles.infoList}>
          <Row k="Stage Name" v={i.stageName} />
          <Row k="Full Name" v={i.fullName} />
          <Row k="Age" v={`${i.age} (International)`} />
          <Row k="Date of Birth" v={i.dob} />
          <Row k="Nationality" v={`${i.nationality} ${i.flag}`} />
          <Row k="Languages" v={i.languages.join(', ')} />
          <Row k="Personality" v={i.personality} />
          <Row k="Archetype" v={i.personalityProfile?.archetype ?? 'All-Rounder'} />
          <Row k="Dominance" v={`${i.personalityProfile?.dominance ?? 55}`} />
          <Row k="Training" v={`${i.trainingYears} years`} />
        </View>
        <View style={styles.vitalRow}>
          <Vital Icon={Heart} label="Health" v={i.health} color="#FDA4AF" />
          <Vital Icon={Activity} label="Morale" v={i.morale} color={colors.violetBright} />
          <Vital Icon={Zap} label="Energy" v={i.energy} color={colors.mint} />
        </View>
      </Card>

      {/* Performance skills */}
      <Card>
        <SectionTitle>PERFORMANCE SKILLS</SectionTitle>
        <View style={styles.radarBox}>
          <RadarChart data={radar} size={190} fillStops={[colors.teal, colors.teal]} />
        </View>
        <View style={styles.skillList}>
          <SkillBar label="Vocal" value={i.stats.vocal} />
          <SkillBar label="Dance" value={i.stats.dance} color="violet" />
          <SkillBar label="Rap" value={i.stats.rap} color="mint" />
          <SkillBar label="Visual" value={i.stats.visual} />
          <SkillBar label="Charisma" value={i.stats.charisma} color="violet" />
          <SkillBar label="Stamina" value={i.stats.stamina} color="mint" />
          <SkillBar label="Variety" value={i.stats.variety} />
          <SkillBar label="Acting" value={i.stats.acting} color="violet" />
        </View>
      </Card>

      {/* Training & development */}
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

      {/* Achievements */}
      <Card>
        <SectionTitle>RECENT ACHIEVEMENTS</SectionTitle>
        <View style={styles.achList}>
          {achievements.map(({ Icon, t, d }) => (
            <View key={t} style={styles.achItem}>
              <Gradient colors={['rgba(34,211,238,0.2)', 'rgba(217,70,239,0.2)']} style={styles.achIcon}>
                <Icon size={16} color={colors.tealBright} />
              </Gradient>
              <View style={styles.flex1}>
                <Text style={styles.achTitle} numberOfLines={1}>
                  {t}
                </Text>
                <Text style={styles.tinyMuted}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </AppShell>
  );
}

function HeroArt({
  image,
  gradient,
  children,
}: {
  image?: number;
  gradient: string[];
  children: ReactNode;
}) {
  if (image) {
    return (
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        {children}
      </ImageBackground>
    );
  }

  return (
    <Gradient colors={gradient} style={styles.hero}>
      {children}
    </Gradient>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{k}</Text>
      <Text style={styles.infoVal}>{v}</Text>
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

  heroCard: { padding: 0, overflow: 'hidden' },
  hero: { height: 200, justifyContent: 'flex-end' },
  heroImage: { borderRadius: radius['2xl'] },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  heroFooter: { padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroName: { fontSize: 28, fontWeight: '900', color: colors.tealBright },
  heroRole: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.8)' },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.black40,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroStatusText: { fontSize: 10, color: colors.foreground },

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

  radarBox: { alignItems: 'center', marginBottom: spacing.md },
  skillList: { gap: 10 },

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
