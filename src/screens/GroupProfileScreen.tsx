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
import type { GroupRole } from '../types';
import { fmt, fmtCount } from '../utils/format';

const MAX_GROUP_SIZE = 6;
const ROLE_OPTIONS: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer', 'Main Rapper', 'Visual', 'Center'];

type Nav = NativeStackNavigationProp<RootStackParamList>;

function avg(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function scoreRoleFit(idol: ReturnType<typeof getGroupMembers>[number], role: GroupRole) {
  if (role === 'Leader') {
    return Math.round(
      idol.stats.charisma * 0.35 +
      idol.stats.stamina * 0.2 +
      (idol.personalityProfile?.traits.responsibility ?? 60) * 0.45,
    );
  }
  if (role === 'Main Vocal') return idol.stats.vocal;
  if (role === 'Main Dancer') return idol.stats.dance;
  if (role === 'Main Rapper') return idol.stats.rap;
  if (role === 'Visual') return idol.stats.visual;
  return Math.round(idol.stats.charisma * 0.6 + idol.stats.visual * 0.4);
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
  const { groups, idols, addGroupMembers, updateGroupRoles } = useGame();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [draftRoles, setDraftRoles] = useState<Partial<Record<GroupRole, string>>>({});
  const groupId = (route.params as RootStackParamList['GroupProfile'] | undefined)?.groupId;
  const group = groups.find(item => item.id === groupId) ?? groups[0];
  const availableMembers = useMemo(
    () => idols.filter(idol => !isAssignedToKnownGroup(idol.group, groups)),
    [groups, idols],
  );

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
  const readiness = buildGroupReadiness(members, group);
  const synergyTier = getSynergyTier(group.synergy);
  const requiredRoleSet = ['Leader', 'Main Vocal', 'Main Dancer'] as const;
  const missingRequiredRoles = requiredRoleSet.filter(role => {
    const assignedId = group.roleAssignments?.[role];
    return !assignedId || !members.some(member => member.id === assignedId);
  });
  const highDominanceMembers = members.filter(member => (member.personalityProfile?.dominance ?? 55) >= 75).length;
  const avgMorale = avg(members.map(member => member.morale));
  const avgStamina = avg(members.map(member => member.stats.stamina));
  const alerts: string[] = [];
  if (missingRequiredRoles.length > 0) {
    alerts.push(`Missing core roles: ${missingRequiredRoles.join(', ')}`);
  }
  if (highDominanceMembers > 1) {
    alerts.push('Multiple high-dominance members may reduce chemistry.');
  }
  if (avgMorale < 60) {
    alerts.push('Low average morale may slow synergy growth.');
  }
  if (avgStamina < 60) {
    alerts.push('Stamina is low; schedule recovery to avoid regression.');
  }

  const closeAddModal = () => {
    setSelectedMemberIds([]);
    setOpenAddModal(false);
  };
  const openRoleEditor = () => {
    setDraftRoles(group.roleAssignments ?? {});
    setOpenRoleModal(true);
  };
  const closeRoleModal = () => {
    setDraftRoles({});
    setOpenRoleModal(false);
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
  const assignRole = (role: GroupRole, idolId: string) => {
    setDraftRoles(current => ({
      ...current,
      [role]: current[role] === idolId ? undefined : idolId,
    }));
  };
  const saveRoles = () => {
    const result = updateGroupRoles({ groupId: group.id, roleAssignments: draftRoles });
    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        GROUP_NOT_FOUND: 'Group not found.',
        INVALID_ROLE_ASSIGNMENT: 'One or more role assignments are invalid for this group.',
      };
      Alert.alert('Cannot update roles', messages[result.reason]);
      return;
    }
    Alert.alert('Roles updated', `Role assignments saved for ${result.groupName}.`);
    closeRoleModal();
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
            <Text style={styles.synergySmallLabel}>SYNERGY</Text>
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
          <View style={styles.lineupActions}>
            <TouchableOpacity style={styles.roleBtn} onPress={openRoleEditor} activeOpacity={0.8}>
              <Text style={styles.roleBtnText}>Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setOpenAddModal(true)} activeOpacity={0.8}>
              <Plus size={11} color={colors.slate900} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        {members.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filmScroll}>
            {members.map(member => (
              <TouchableOpacity
                key={member.id}
                style={styles.filmCell}
                onPress={() => navigation.navigate('IdolProfile', { id: member.id })}
                activeOpacity={0.85}>
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
              </TouchableOpacity>
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
          <RadarChart data={radar} size={170} showValueInLabels />
        </View>
      </Card>

      {/* ── TEAM INSIGHTS ── */}
      <Card>
        <SectionTitle>TEAM INSIGHTS</SectionTitle>
        <View style={styles.insightRow}>
          <Mini label="AVG MORALE" value={`${avgMorale}`} />
          <Mini label="AVG STAMINA" value={`${avgStamina}`} />
          <Mini label="HIGH DOM" value={`${highDominanceMembers}`} />
        </View>
        {alerts.length > 0 ? (
          <View style={styles.alertList}>
            {alerts.map(alert => (
              <View key={alert} style={styles.alertItem}>
                <Text style={styles.alertText}>• {alert}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.insightHealthy}>No critical team-fit warnings this week.</Text>
        )}
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

      {/* ── RELEASES HISTORY ── */}
      {(group.releases?.length ?? 0) > 0 && (
        <Card>
          <SectionTitle>DISCOGRAPHY</SectionTitle>
          <View style={styles.releaseList}>
            {[...(group.releases ?? [])].reverse().map((rel, idx) => (
              <View key={rel.id} style={[styles.releaseRow, idx > 0 && styles.releaseRowBorder]}>
                <View style={styles.releaseLeft}>
                  <Text style={styles.releaseTitle} numberOfLines={1}>"{rel.title}"</Text>
                  <Text style={styles.releaseMeta}>{rel.concept} · {rel.language} · Week {rel.weekReleased}</Text>
                </View>
                <View style={styles.releaseStats}>
                  <View style={styles.releaseStat}>
                    <Text style={styles.releaseStatVal}>#{rel.chartPosition}</Text>
                    <Text style={styles.releaseStatLabel}>CHART</Text>
                  </View>
                  <View style={styles.releaseStat}>
                    <Text style={[styles.releaseStatVal, { color: colors.mint }]}>+{fmtCount(rel.fansGained)}</Text>
                    <Text style={styles.releaseStatLabel}>FANS</Text>
                  </View>
                  <View style={styles.releaseStat}>
                    <Text style={[styles.releaseStatVal, { color: colors.tealBright }]}>{fmt(rel.revenueGained)}</Text>
                    <Text style={styles.releaseStatLabel}>REVENUE</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

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

      {/* ── EDIT ROLES MODAL ── */}
      <Modal visible={openRoleModal} transparent animationType="fade" onRequestClose={closeRoleModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit roles · {group.name}</Text>
            <Text style={styles.modalSub}>Assign core roles to current members. Tap again to unassign.</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.roleEditWrap}>
                {ROLE_OPTIONS.map(role => {
                  const assignedId = draftRoles[role];
                  const sortedMembers = [...members].sort(
                    (a, b) => scoreRoleFit(b, role) - scoreRoleFit(a, role),
                  );
                  return (
                    <View key={role} style={styles.roleEditRow}>
                      <Text style={styles.roleEditTitle}>{role}</Text>
                      <View style={styles.roleChipWrap}>
                        {sortedMembers.map(member => {
                          const active = assignedId === member.id;
                          const fitScore = scoreRoleFit(member, role);
                          return (
                            <TouchableOpacity
                              key={`${role}-${member.id}`}
                              style={[styles.roleChip, active && styles.roleChipActive]}
                              onPress={() => assignRole(role, member.id)}
                              activeOpacity={0.8}>
                              <Avatar
                                name={member.stageName}
                                gradient={member.gradient}
                                image={member.image}
                                size={22}
                              />
                              <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                                {member.stageName} ({fitScore})
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeRoleModal} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={saveRoles} activeOpacity={0.8}>
                <Text style={styles.confirmText}>Save Roles</Text>
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
  lineupActions: { flexDirection: 'row', gap: spacing.xs },
  roleBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  roleBtnText: { fontSize: 10, fontWeight: '700', color: colors.foreground },

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
  perfRow: { alignItems: 'center' },

  // ── Insights ──
  insightRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  alertList: { marginTop: spacing.sm, gap: 6 },
  alertItem: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.35)',
    backgroundColor: 'rgba(251,113,133,0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  alertText: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  insightHealthy: { marginTop: spacing.sm, fontSize: 11, color: colors.mint },
  
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

  // ── Discography ──
  releaseList: { gap: 0 },
  releaseRow: { paddingVertical: spacing.md, gap: spacing.sm },
  releaseRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  releaseLeft: { gap: 3 },
  releaseTitle: { fontSize: 15, fontWeight: '800', color: colors.foreground },
  releaseMeta: { fontSize: 10, color: colors.mutedForeground },
  releaseStats: { flexDirection: 'row', gap: spacing.md },
  releaseStat: { alignItems: 'center', gap: 2, minWidth: 52 },
  releaseStatVal: { fontSize: 13, fontWeight: '900', color: colors.foreground },
  releaseStatLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.2, color: colors.mutedForeground },

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
  roleEditWrap: { gap: spacing.md, marginTop: spacing.sm },
  roleEditRow: { gap: 6 },
  roleEditTitle: { fontSize: 11, fontWeight: '800', color: colors.foreground, letterSpacing: 0.4 },
  roleChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  roleChipActive: {
    borderColor: 'rgba(103,232,249,0.7)',
    backgroundColor: 'rgba(34,211,238,0.16)',
  },
  roleChipText: { fontSize: 10, color: colors.foreground },
  roleChipTextActive: { color: colors.tealBright, fontWeight: '700' },
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
