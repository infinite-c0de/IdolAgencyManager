import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card } from '../components/AppShell';
import { GroupLineupTab } from '../components/groupProfile/GroupLineupTab';
import { GroupPerformanceTab } from '../components/groupProfile/GroupPerformanceTab';
import { GroupProfileHero } from '../components/groupProfile/GroupProfileHero';
import { GroupProfileTabBar } from '../components/groupProfile/GroupProfileTabBar';
import type { GroupProfileTab } from '../components/groupProfile/GroupProfileTabBar';
import { GroupReleasesTab } from '../components/groupProfile/GroupReleasesTab';
import { buildGroupRadar, buildGroupReadiness, getGroupMembers } from '../features/groups';
import { MAX_GROUP_MEMBERS } from '../data/gameData';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import type { GroupRole } from '../types';

const ROLE_OPTIONS: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer', 'Main Rapper', 'Visual', 'Center'];

type Nav = NativeStackNavigationProp<RootStackParamList>;

function avg(values: number[]) {
  return Math.round(values.reduce((s, v) => s + v, 0) / Math.max(values.length, 1));
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
    return { label: 'Elite',    borderColor: 'rgba(52,211,153,0.6)',  backgroundColor: 'rgba(52,211,153,0.14)', textColor: colors.mint };
  }
  if (score >= 65) {
    return { label: 'Strong',   borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg,    textColor: colors.tealBright };
  }
  if (score >= 50) {
    return { label: 'Stable',   borderColor: 'rgba(252,211,77,0.6)',  backgroundColor: 'rgba(252,211,77,0.12)', textColor: colors.amber };
  }
  return   { label: 'Critical', borderColor: 'rgba(251,113,133,0.65)',backgroundColor: 'rgba(251,113,133,0.14)', textColor: colors.hot };
}

function isAssignedToKnownGroup(groupRef: string | undefined, groups: ReturnType<typeof useGame>['groups']) {
  const ref = groupRef?.trim();
  if (!ref) return false;
  return groups.some(g => g.id === ref || g.name === ref);
}

export function GroupProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { groups, idols, addGroupMembers, updateGroupRoles } = useGame();

  const [tab, setTab] = useState<GroupProfileTab>('lineup');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [draftRoles, setDraftRoles] = useState<Partial<Record<GroupRole, string>>>({});

  const groupId = (route.params as RootStackParamList['GroupProfile'] | undefined)?.groupId;
  const group = groups.find(g => g.id === groupId) ?? groups[0];

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

  // Alerts
  const requiredRoleSet = ['Leader', 'Main Vocal', 'Main Dancer'] as const;
  const missingRequiredRoles = requiredRoleSet.filter(role => {
    const assignedId = group.roleAssignments?.[role];
    return !assignedId || !members.some(m => m.id === assignedId);
  });
  const highDominanceMembers = members.filter(m => (m.personalityProfile?.dominance ?? 55) >= 75).length;
  const avgMorale   = avg(members.map(m => m.morale));
  const avgStamina  = avg(members.map(m => m.stats.stamina));
  const alerts: string[] = [];
  if (missingRequiredRoles.length > 0) alerts.push(`Missing core roles: ${missingRequiredRoles.join(', ')}`);
  if (highDominanceMembers > 1)        alerts.push('Multiple high-dominance members may reduce chemistry.');
  if (avgMorale < 60)                  alerts.push('Low average morale may slow synergy growth.');
  if (avgStamina < 60)                 alerts.push('Stamina is low; schedule recovery to avoid regression.');

  // Modal handlers
  const closeAddModal = () => { setSelectedMemberIds([]); setOpenAddModal(false); };
  const openRoleEditor = () => { setDraftRoles(group.roleAssignments ?? {}); setOpenRoleModal(true); };
  const closeRoleModal = () => { setDraftRoles({}); setOpenRoleModal(false); };
  const toggleAddMember = (idolId: string) => {
    setSelectedMemberIds(cur =>
      cur.includes(idolId) ? cur.filter(id => id !== idolId) : [...cur, idolId],
    );
  };
  const handleAddMembers = () => {
    const result = addGroupMembers({ groupId: group.id, memberIds: selectedMemberIds });
    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        GROUP_NOT_FOUND:    'Group not found.',
        NO_MEMBERS_SELECTED:'Select at least one idol to add.',
        MEMBER_UNAVAILABLE: 'One or more selected idols are already assigned.',
        TOO_MANY_MEMBERS:   `Groups are limited to ${MAX_GROUP_MEMBERS} members. Remove some selections.`,
      };
      Alert.alert('Cannot add members', messages[result.reason]);
      return;
    }
    Alert.alert('Members added', `${result.addedCount} member(s) added to ${result.groupName}.`);
    closeAddModal();
  };
  const assignRole = (role: GroupRole, idolId: string) => {
    setDraftRoles(cur => ({ ...cur, [role]: cur[role] === idolId ? undefined : idolId }));
  };
  const saveRoles = () => {
    const result = updateGroupRoles({ groupId: group.id, roleAssignments: draftRoles });
    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        GROUP_NOT_FOUND:        'Group not found.',
        INVALID_ROLE_ASSIGNMENT:'One or more role assignments are invalid for this group.',
      };
      Alert.alert('Cannot update roles', messages[result.reason]);
      return;
    }
    Alert.alert('Roles updated', `Role assignments saved for ${result.groupName}.`);
    closeRoleModal();
  };

  const backBtn = (
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Groups')} activeOpacity={0.8}>
      <ChevronLeft size={14} color={colors.slate900} />
      <Text style={styles.backText}>Groups</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell title={group.name} subtitle="Group Profile" action={backBtn}>

      {/* Hero */}
      <GroupProfileHero group={group} members={members} synergyTier={synergyTier} />

      {/* Tab bar */}
      <GroupProfileTabBar tab={tab} onChange={setTab} />

      {/* Tab content */}
      <View style={styles.tabContent}>

        {tab === 'lineup' && (
          <GroupLineupTab
            members={members}
            alerts={alerts}
            readinessChecks={readiness.checks}
            readinessReady={readiness.ready}
            onMemberPress={id => navigation.navigate('IdolProfile', { id })}
            onAddMember={() => setOpenAddModal(true)}
            onManageRoles={openRoleEditor}
          />
        )}

        {tab === 'performance' && (
          <GroupPerformanceTab
            radar={radar}
            avgVocal={avg(members.map(m => m.stats.vocal))}
            avgDance={avg(members.map(m => m.stats.dance))}
            avgRap={avg(members.map(m => m.stats.rap))}
            avgVisual={avg(members.map(m => m.stats.visual))}
            avgCharisma={avg(members.map(m => m.stats.charisma))}
            avgMorale={avgMorale}
            avgStamina={avgStamina}
          />
        )}

        {tab === 'releases' && (
          <GroupReleasesTab releases={group.releases} />
        )}

      </View>

      {/* ── ADD MEMBERS MODAL ── */}
      <Modal visible={openAddModal} transparent animationType="fade" onRequestClose={closeAddModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to {group.name}</Text>
            <Text style={styles.modalSub}>Select unassigned idols. Metrics update immediately.</Text>
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
            <Text style={styles.modalSub}>Tap a cell to assign. Required (*) roles must be filled.</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {members.length === 0 ? (
                <Text style={styles.emptyText}>Add members to the group first.</Text>
              ) : (
                <View style={styles.roleTable}>
                  {/* Header row: ROLE label + member avatars */}
                  <View style={styles.roleTableHeader}>
                    <View style={styles.roleTableRoleCell}>
                      <Text style={styles.roleTableHeadText}>ROLE</Text>
                    </View>
                    {members.map(m => (
                      <View key={m.id} style={styles.roleTableMemberCell}>
                        <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={22} />
                        <Text style={styles.roleTableMemberName} numberOfLines={1}>{m.stageName}</Text>
                      </View>
                    ))}
                  </View>
                  {/* One row per role */}
                  {ROLE_OPTIONS.map(role => {
                    const isRequired = (['Leader', 'Main Vocal', 'Main Dancer'] as GroupRole[]).includes(role);
                    const assignedId = draftRoles[role];
                    return (
                      <View key={role} style={styles.roleTableRow}>
                        <View style={styles.roleTableRoleCell}>
                          <Text style={[styles.roleTableRoleText, isRequired && styles.roleTableRoleRequired]}>
                            {role}{isRequired ? ' *' : ''}
                          </Text>
                        </View>
                        {members.map(member => {
                          const active = assignedId === member.id;
                          const score = scoreRoleFit(member, role);
                          return (
                            <TouchableOpacity
                              key={`${role}-${member.id}`}
                              style={styles.roleTableMemberCell}
                              onPress={() => assignRole(role, member.id)}
                              activeOpacity={0.8}>
                              <View style={[styles.roleCheckBox, active && styles.roleCheckBoxActive]}>
                                {active && <Text style={styles.roleCheckMark}>✓</Text>}
                              </View>
                              <Text style={[styles.roleScoreText, active && styles.roleScoreActive]}>{score}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              )}
              <Text style={styles.roleHelper}>
                Required (*): Leader, Main Vocal, Main Dancer. Score = fit for that role (higher is better).
              </Text>
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

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  subMuted: { fontSize: 11, color: colors.mutedForeground },
  emptyText: { color: colors.mutedForeground, textAlign: 'center', fontSize: 12 },

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

  tabContent: { marginTop: spacing.sm },

  // Modal
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
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
  },
  memberName: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  roleTable: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  roleTableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  roleTableRoleCell: {
    width: 96,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  roleTableMemberCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 3,
  },
  roleTableHeadText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  roleTableMemberName: {
    fontSize: 7,
    fontWeight: '700',
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  roleTableRoleText: { fontSize: 10, fontWeight: '600', color: colors.foreground },
  roleTableRoleRequired: { color: colors.tealBright },
  roleCheckBox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckBoxActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  roleCheckMark: { fontSize: 11, fontWeight: '900', color: colors.tealBright },
  roleScoreText: { fontSize: 9, fontWeight: '600', color: colors.mutedForeground },
  roleScoreActive: { color: colors.tealBright },
  roleHelper: { marginTop: spacing.sm, fontSize: 11, lineHeight: 16, color: colors.mutedForeground },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
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
  modalSub:   { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
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
