import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card, SectionTitle } from '../components/AppShell';
import { RadarChart } from '../components/charts';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { buildGroupRadar, buildGroupReadiness, getGroupMembers } from '../features/groups';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function buildPerformanceStats(members: ReturnType<typeof getGroupMembers>) {
  if (members.length === 0) {
    return [
      { label: 'Vocal', v: 0 },
      { label: 'Dance', v: 0 },
      { label: 'Rap', v: 0 },
      { label: 'Visual', v: 0 },
      { label: 'Charisma', v: 0 },
    ];
  }

  return [
    { label: 'Vocal', v: avg(members.map(member => member.stats.vocal)) },
    { label: 'Dance', v: avg(members.map(member => member.stats.dance)) },
    { label: 'Rap', v: avg(members.map(member => member.stats.rap)) },
    { label: 'Visual', v: avg(members.map(member => member.stats.visual)) },
    { label: 'Charisma', v: avg(members.map(member => member.stats.charisma)) },
  ];
}

function getSynergyTier(score: number) {
  if (score >= 80) {
    return {
      label: 'Elite',
      borderColor: 'rgba(52,211,153,0.6)',
      backgroundColor: 'rgba(52,211,153,0.14)',
      textColor: colors.mint,
    };
  }

  if (score >= 65) {
    return {
      label: 'Strong',
      borderColor: 'rgba(103,232,249,0.6)',
      backgroundColor: 'rgba(34,211,238,0.12)',
      textColor: colors.tealBright,
    };
  }

  if (score >= 50) {
    return {
      label: 'Stable',
      borderColor: 'rgba(252,211,77,0.6)',
      backgroundColor: 'rgba(252,211,77,0.12)',
      textColor: colors.amber,
    };
  }

  return {
    label: 'Critical',
    borderColor: 'rgba(251,113,133,0.65)',
    backgroundColor: 'rgba(251,113,133,0.14)',
    textColor: colors.hot,
  };
}

export function GroupProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { groups, idols } = useGame();
  const groupId = (route.params as RootStackParamList['GroupProfile'] | undefined)?.groupId;
  const group = groups.find(item => item.id === groupId) ?? groups[0];

  if (!group) {
    return (
      <AppShell title="Group Profile" subtitle="No group selected">
        <Card>
          <Text style={styles.emptyText}>No group available. Create a group first.</Text>
        </Card>
      </AppShell>
    );
  }

  const members = getGroupMembers(group, idols);
  const radar = buildGroupRadar(members);
  const readiness = buildGroupReadiness(members, group.status === 'Active');
  const stats = buildPerformanceStats(members);
  const synergyTier = getSynergyTier(group.synergy);

  return (
    <AppShell
      title={group.name}
      subtitle="Detailed profile and progression"
      action={
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Groups')} activeOpacity={0.8}>
          <ChevronLeft size={14} color={colors.slate900} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      }>
      <Card glow="teal">
        <View style={styles.headerRow}>
          <Gradient colors={group.gradient} style={styles.logoWrap}>
            {group.logo?.kind === 'custom' ? (
              <Image source={{ uri: group.logo.uri }} resizeMode="cover" style={styles.logoImage} />
            ) : (
              <AgencyLogoMark preset={group.logo?.kind === 'preset' ? group.logo.preset : 'NEON_STAR'} size={40} />
            )}
          </Gradient>
          <View style={styles.flex1}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.subMuted}>
              {group.status} · {group.concept} · Fandom {group.fanName}
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <Mini label="Members" value={`${group.memberIds.length}`} />
          <View
            style={[
              styles.synergyBadge,
              {
                borderColor: synergyTier.borderColor,
                backgroundColor: synergyTier.backgroundColor,
              },
            ]}>
            <Text style={styles.synergyLabel}>SYNERGY</Text>
            <Text style={[styles.synergyValue, { color: synergyTier.textColor }]}>{group.synergy}</Text>
            <Text style={[styles.synergyTierText, { color: synergyTier.textColor }]}>{synergyTier.label}</Text>
          </View>
          <Mini label="Monthly Revenue" value={fmt(group.monthlyRevenue)} />
        </View>
      </Card>

      <Card>
        <SectionTitle>SYNERGY ANALYSIS</SectionTitle>
        <View style={styles.perfRow}>
          <View style={styles.radarWrap}>
            <RadarChart data={radar} size={170} fillStops={[colors.teal, colors.violet]} />
          </View>
          <View style={styles.vBars}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.vBarCol}>
                <Text style={styles.vBarLabel}>{stat.label}</Text>
                <View style={styles.vBarTrack}>
                  <Gradient
                    colors={[colors.violet, colors.tealBright]}
                    direction="to-t"
                    style={[styles.vBarFill, { height: `${stat.v}%` }]}
                  />
                </View>
                <Text style={styles.vBarValue}>{stat.v}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>DEBUT READINESS</SectionTitle>
        <Text style={styles.subMuted}>
          Triggers: at least 3 members, leader assigned, vocal avg 70+, dance avg 70+, debut song, promotion plan.
        </Text>
        <View style={styles.checkGrid}>
          {readiness.checks.map(check => (
            <View key={check.t} style={styles.checkItem}>
              <View style={[styles.checkDot, check.ok ? styles.checkOn : styles.checkOff]} />
              <Text style={check.ok ? styles.checkTextOn : styles.checkTextOff}>{check.t}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>MEMBERS</SectionTitle>
        <View style={styles.memberList}>
          {members.map(member => (
            <View key={member.id} style={styles.memberItem}>
              <Avatar name={member.stageName} gradient={member.gradient} image={member.image} size={34} />
              <View style={styles.flex1}>
                <Text style={styles.memberName}>{member.stageName}</Text>
                <Text style={styles.subMuted}>{member.role}</Text>
              </View>
              <Sparkles size={14} color={colors.tealBright} />
            </View>
          ))}
        </View>
      </Card>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiItem}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  groupName: { color: colors.tealBright, fontSize: 24, fontWeight: '900' },
  subMuted: { fontSize: 11, color: colors.mutedForeground },
  kpiRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  kpiItem: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.sm,
  },
  synergyBadge: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  synergyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.mutedForeground },
  synergyValue: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  synergyTierText: { fontSize: 11, fontWeight: '700' },
  kpiLabel: { fontSize: 10, color: colors.mutedForeground },
  kpiValue: { marginTop: 2, fontSize: 12, fontWeight: '700', color: colors.foreground },
  perfRow: { alignItems: 'center', gap: spacing.md },
  radarWrap: { alignItems: 'center' },
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
  checkGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap' },
  checkItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  checkDot: { width: 8, height: 8, borderRadius: radius.full },
  checkOn: { backgroundColor: colors.mint },
  checkOff: { backgroundColor: 'rgba(255,255,255,0.2)' },
  checkTextOn: { fontSize: 11, color: colors.foreground },
  checkTextOff: { fontSize: 11, color: colors.mutedForeground },
  memberList: { gap: spacing.sm },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.sm,
  },
  memberName: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  emptyText: { color: colors.mutedForeground, textAlign: 'center', fontSize: 12 },
});
