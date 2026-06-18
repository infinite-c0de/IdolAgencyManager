import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, Sparkles } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card, SectionTitle } from '../components/AppShell';
import { RadarChart } from '../components/charts';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { buildGroupRadar, buildGroupReadiness, getGroupMembers } from '../features/groups';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt, fmtCount } from '../utils/format';

const MAX_GROUP_SIZE = 6;

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

function isAssignedToKnownGroup(groupRef: string | undefined, groups: ReturnType<typeof useGame>['groups']) {
  const normalizedRef = groupRef?.trim();
  if (!normalizedRef) {
    return false;
  }
  return groups.some(group => group.id === normalizedRef || group.name === normalizedRef);
}

export function GroupProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { groups, idols, addGroupMembers } = useGame();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
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
  const availableMembers = useMemo(
    () => idols.filter(idol => !isAssignedToKnownGroup(idol.group, groups)),
    [groups, idols],
  );
  const radar = buildGroupRadar(members);
  const readiness = buildGroupReadiness(members, group.status === 'Active');
  const stats = buildPerformanceStats(members);
  const synergyTier = getSynergyTier(group.synergy);

  const closeAddModal = () => {
    setSelectedMemberIds([]);
    setOpenAddModal(false);
  };

  const toggleAddMember = (idolId: string) => {
    setSelectedMemberIds(current =>
      current.includes(idolId)
        ? current.filter(id => id !== idolId)
        : [...current, idolId],
    );
  };

  const handleAddMembers = () => {
    const result = addGroupMembers({ groupId: group.id, memberIds: selectedMemberIds });
    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        GROUP_NOT_FOUND: 'Group not found.',
        NO_MEMBERS_SELECTED: 'Select at least one idol to add.',
        MEMBER_UNAVAILABLE: 'One or more selected idols are already assigned.',
        TOO_MANY_MEMBERS: `Groups are limited to ${MAX_GROUP_SIZE} members. Remove some selections.`,
      };
      Alert.alert('Cannot add members', messages[result.reason]);
      return;
    }

    Alert.alert('Members added', `${result.addedCount} member(s) added to ${result.groupName}.`);
    closeAddModal();
  };

  return (
    <AppShell
      title={group.name}
      subtitle="Group Profile"
      action={
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Groups')} activeOpacity={0.8}>
          <ChevronLeft size={14} color={colors.slate900} />
          <Text style={styles.backText}>Groups</Text>
        </TouchableOpacity>
      }>

      {/* ── HERO ── */}
      <View style={styles.heroCard}>
        <Gradient colors={group.gradient} direction="to-br" style={styles.heroBg} />

        {/* Identity row: logo + name + synergy badge */}
        <View style={styles.heroIdentityRow}>
          <View style={styles.heroLogoWrap}>
            {group.logo?.kind === 'custom' ? (
              <Image source={{ uri: group.logo.uri }} resizeMode="cover" style={styles.heroLogoImage} />
            ) : (
              <AgencyLogoMark preset={group.logo?.kind === 'preset' ? group.logo.preset : 1} size={64} />
            )}
          </View>

          <View style={styles.heroTextCol}>
            <Text style={styles.heroEyebrow}>GROUP PROFILE</Text>
            <Text style={styles.heroGroupName} numberOfLines={1}>{group.name}</Text>
            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}><Text style={styles.heroPillText}>{group.status}</Text></View>
              <View style={styles.heroPill}><Text style={styles.heroPillText}>{group.concept}</Text></View>
            </View>
            <Text style={styles.heroFandom}>
              ♡ <Text style={styles.heroFandomVal}>{group.fanName}</Text>
            </Text>
          </View>

          <View style={[styles.synergyBadge, { borderColor: synergyTier.borderColor, backgroundColor: synergyTier.backgroundColor }]}>
            <Text style={styles.synergySmallLabel}>SYNC</Text>
            <Text style={[styles.synergyBig, { color: synergyTier.textColor }]}>{group.synergy}</Text>
            <Text style={[styles.synergyTierBadge, { color: synergyTier.textColor }]}>{synergyTier.label}</Text>
          </View>
        </View>

        {/* Stat strip */}
        <View style={styles.heroStatStrip}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{fmt(group.monthlyRevenue)}</Text>
            <Text style={styles.heroStatLabel}>MONTHLY</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{group.memberIds.length}</Text>
            <Text style={styles.heroStatLabel}>MEMBERS</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{fmtCount(group.popularity * 3200)}</Text>
            <Text style={styles.heroStatLabel}>FANS</Text>
          </View>
        </View>
      </View>

      {/* ── MEMBER FILMSTRIP ── */}
      <View>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>LINEUP</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setOpenAddModal(true)} activeOpacity={0.8}>
            <Plus size={11} color={colors.slate900} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {members.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filmScroll}>
            {members.map(member => (
              <View key={member.id} style={styles.filmCell}>
                {member.image ? (
                  <Image source={member.image} resizeMode="cover" style={styles.filmPhoto} />
                ) : (
                  <View style={styles.filmFallback}>
                    <Text style={styles.filmFallbackText}>{member.stageName.slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.filmShade} />
                <Text style={styles.filmName} numberOfLines={1}>{member.stageName}</Text>
                <Text style={styles.filmRole} numberOfLines={1}>{member.role}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyLineup}>
            <Text style={styles.emptyText}>No members yet. Add idols to the group.</Text>
          </View>
        )}
      </View>

      {/* ── PERFORMANCE ── radar + bars asymmetric */}
      <Card>
        <SectionTitle>PERFORMANCE</SectionTitle>
        <View style={styles.perfRow}>
          <View style={styles.radarWrap}>
            <RadarChart data={radar} size={120} fillStops={[colors.teal, colors.violet]} />
          </View>
          <View style={styles.vBars}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.vBarCol}>
                <View style={styles.vBarTrack}>
                  <Gradient
                    colors={[colors.violet, colors.tealBright]}
                    direction="to-t"
                    style={[styles.vBarFill, { height: `${stat.v}%` }]}
                  />
                </View>
                <Text style={styles.vBarValue}>{stat.v}</Text>
                <Text style={styles.vBarLabel}>{stat.label.slice(0, 3).toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* ── DEBUT READINESS ── visual badges */}
      <Card>
        <SectionTitle>DEBUT READINESS</SectionTitle>
        <View style={styles.readinessGrid}>
          {readiness.checks.map(check => (
            <View key={check.t} style={[styles.readinessItem, check.ok ? styles.readinessOn : styles.readinessOff]}>
              <View style={[styles.readinessDot, check.ok ? styles.dotOn : styles.dotOff]} />
              <Text style={[styles.readinessText, check.ok ? styles.readinessTextOn : styles.readinessTextOff]} numberOfLines={2}>
                {check.t}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* ── ADD MEMBERS MODAL ── */}
      <Modal visible={openAddModal} transparent animationType="fade" onRequestClose={closeAddModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to {group.name}</Text>
            <Text style={styles.modalSub}>
              Select unassigned idols. Metrics update immediately.
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {availableMembers.length === 0 ? (
                <Text style={styles.emptyText}>No unassigned idols available right now.</Text>
              ) : (
                <View style={styles.memberPickWrap}>
                  {availableMembers.map(idol => {
                    const active = selectedMemberIds.includes(idol.id);
                    return (
                      <TouchableOpacity
                        key={idol.id}
                        style={[styles.memberPick, active && styles.memberPickActive]}
                        onPress={() => toggleAddMember(idol.id)}
                        activeOpacity={0.8}>
                        <Avatar name={idol.stageName} gradient={idol.gradient} image={idol.image} size={30} />
                        <View style={styles.flex1}>
                          <Text style={styles.memberName}>{idol.stageName}</Text>
                          <Text style={styles.subMuted}>{idol.role}</Text>
                        </View>
                        {active && <Sparkles size={13} color={colors.tealBright} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeAddModal} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, selectedMemberIds.length === 0 && styles.confirmBtnDim]}
                onPress={handleAddMembers}
                activeOpacity={0.8}>
                <Text style={styles.confirmText}>
                  Add {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  subMuted: { fontSize: 11, color: colors.mutedForeground },

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

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  addBtnText: { fontSize: 10, fontWeight: '700', color: colors.slate900 },

  // ── Hero ──
  heroCard: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.2)',
  },
  heroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.2,
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroLogoWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroLogoImage: { width: 64, height: 64 },
  heroTextCol: { flex: 1, gap: 4 },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.45)',
  },
  heroGroupName: { fontSize: 22, fontWeight: '900', color: colors.foreground, letterSpacing: -0.5 },
  heroPillRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  heroPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroPillText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  heroFandom: { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
  heroFandomVal: { fontWeight: '700', color: colors.violetBright },
  synergyBadge: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minWidth: 58,
    gap: 1,
  },
  synergySmallLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1.2, color: colors.mutedForeground },
  synergyBig: { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  synergyTierBadge: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },

  heroStatStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 14, fontWeight: '900', color: colors.foreground },
  heroStatLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.2, color: colors.mutedForeground },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 2 },

  // ── Filmstrip ──
  filmScroll: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 2 },
  filmCell: {
    width: 82,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: '#080B12',
    justifyContent: 'flex-end',
  },
  filmPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  filmFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,211,238,0.05)' },
  filmFallbackText: { fontSize: 20, fontWeight: '900', color: 'rgba(103,232,249,0.3)', letterSpacing: 2 },
  filmShade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 38,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  filmName: {
    paddingHorizontal: 4,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 2,
  },
  filmRole: {
    paddingHorizontal: 4,
    paddingBottom: 5,
    fontSize: 8,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },

  emptyLineup: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.mutedForeground, textAlign: 'center', fontSize: 12 },

  // ── Performance ──
  perfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radarWrap: { flex: 1, alignItems: 'center' },
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
  vBarValue: { fontSize: 10, fontWeight: '700', color: colors.foreground },
  vBarLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5, color: colors.mutedForeground, textTransform: 'uppercase' },

  // ── Readiness ──
  readinessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    flex: 1,
    minWidth: '46%',
    maxWidth: '50%',
  },
  readinessOn: { borderColor: 'rgba(52,211,153,0.45)', backgroundColor: 'rgba(52,211,153,0.07)' },
  readinessOff: { borderColor: 'rgba(255,255,255,0.07)', backgroundColor: colors.whiteA04 },
  readinessDot: { width: 7, height: 7, borderRadius: radius.full, flexShrink: 0 },
  dotOn: { backgroundColor: colors.mint },
  dotOff: { backgroundColor: 'rgba(255,255,255,0.2)' },
  readinessText: { fontSize: 10, fontWeight: '600', flexShrink: 1 },
  readinessTextOn: { color: colors.foreground },
  readinessTextOff: { color: colors.mutedForeground },

  // ── KPI (kept for Mini component) ──
  kpiItem: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.sm,
  },
  kpiLabel: { fontSize: 10, color: colors.mutedForeground },
  kpiValue: { marginTop: 2, fontSize: 12, fontWeight: '700', color: colors.foreground },

  // ── Modal ──
  memberPickWrap: { gap: spacing.sm, marginTop: spacing.sm },
  memberPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.sm,
  },
  memberPickActive: {
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  memberName: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(18,21,32,0.99)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.3)',
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.tealBright },
  modalSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  modalScroll: { marginTop: spacing.md },
  modalActions: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  cancelText: { fontSize: 13, color: colors.foreground },
  confirmBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  confirmBtnDim: { opacity: 0.45 },
  confirmText: { fontSize: 13, fontWeight: '700', color: colors.slate900 },
});
