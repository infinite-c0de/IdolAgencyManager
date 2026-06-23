import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Sparkles, Users } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell, Avatar, Card } from '../components/AppShell';
import { GroupCard } from '../components/groups/GroupCard';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { agencyLogoPresets } from '../features/agency';
import type { CreateGroupResult } from '../features/groups';
import { buildGroupReadiness, getGroupMembers } from '../features/groups';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import type { AgencyLogo, GroupRole, Idol } from '../types';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GROUP_ROLES: GroupRole[] = [
  'Leader',
  'Main Vocal',
  'Main Dancer',
  'Main Rapper',
  'Visual',
  'Center',
];
const REQUIRED_ROLES: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer'];

function scoreRoleFit(idol: Idol, role: GroupRole) {
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

export function GroupsScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, groups, idols, conceptOptions, createGroup } = useGame();
  const [open, setOpen] = useState(false);
  const [ceremony, setCeremony] = useState<{ groupName: string; memberIds: string[] } | null>(null);
  const active = groups.filter(g => g.status === 'Active').length;
  const predebut = groups.filter(g => g.status === 'Pre-debut').length;

  const handleCreated = (groupName: string, memberIds: string[]) => {
    setCeremony({ groupName, memberIds });
  };

  const newAction = (
    <TouchableOpacity style={styles.newBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
      <Plus size={14} color={colors.slate900} />
      <Text style={styles.newText}>New</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell
      title="Groups"
      subtitle={`${active} active · ${predebut} pre-debut`}
      action={newAction}>
      {groups.length === 0 && (
        <Card>
          <View style={styles.emptyState}>
            <Gradient colors={[colors.teal, colors.violet]} style={styles.emptyIcon}>
              <Sparkles size={22} color={colors.slate900} />
            </Gradient>
            <Text style={styles.emptyTitle}>No groups formed yet</Text>
            <Text style={styles.emptyText}>
              Recruit idols first, then create a pre-debut group from available roster members.
            </Text>
          </View>
        </Card>
      )}

      {groups.map(g => (
        <GroupCard
          key={g.id}
          group={g}
          members={getGroupMembers(g, idols)}
          onPress={() => navigation.navigate('GroupProfile', { groupId: g.id })}
        />
      ))}

      <NewGroupModal
        visible={open}
        onClose={() => setOpen(false)}
        idols={idols}
        groups={groups}
        agencyLogo={agency.logo}
        concepts={conceptOptions}
        createGroup={createGroup}
        onCreated={handleCreated}
      />

      {/* Group creation ceremony */}
      {ceremony !== null && (
        <GroupCreatedCeremony
          groupName={ceremony.groupName}
          memberIds={ceremony.memberIds}
          idols={idols}
          onClose={() => setCeremony(null)}
          onView={() => {
            setCeremony(null);
            const found = groups.find(g => g.name === ceremony.groupName);
            if (found) {
              navigation.navigate('GroupProfile', { groupId: found.id });
            }
          }}
        />
      )}
    </AppShell>
  );
}


function GroupCreatedCeremony({
  groupName,
  memberIds,
  idols,
  onClose,
  onView,
}: {
  groupName: string;
  memberIds: string[];
  idols: Idol[];
  onClose: () => void;
  onView: () => void;
}) {
  const members = idols.filter(i => memberIds.includes(i.id));
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.ceremonyBackdrop}>
        <View style={styles.ceremonyCard}>
          {/* Subtle gradient shimmer bg */}
          <Gradient
            colors={[colors.teal + '22', colors.violet + '22']}
            direction="to-br"
            style={styles.ceremonyBg}
          />

          {/* Badge */}
          <View style={styles.ceremonyBadge}>
            <Sparkles size={13} color={colors.slate900} />
            <Text style={styles.ceremonyBadgeText}>PRE-DEBUT FORMED</Text>
          </View>

          {/* Group name */}
          <Text style={styles.ceremonyGroupName}>{groupName}</Text>
          <Text style={styles.ceremonyTagline}>A new unit is born. The journey begins now.</Text>

          {/* Member lineup */}
          {members.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ceremonyLineup}>
              {members.map(m => (
                <View key={m.id} style={styles.ceremonyMember}>
                  {m.image ? (
                    <Image source={m.image} resizeMode="cover" style={styles.ceremonyMemberPhoto} />
                  ) : (
                    <View style={styles.ceremonyMemberFallback}>
                      <Text style={styles.ceremonyMemberInitials}>{m.stageName.slice(0, 2).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.ceremonyMemberShade} />
                  <Text style={styles.ceremonyMemberName} numberOfLines={1}>{m.stageName}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Member count */}
          <View style={styles.ceremonyMeta}>
            <Users size={13} color={colors.mutedForeground} />
            <Text style={styles.ceremonyMetaText}>{members.length} members · Pre-debut unit</Text>
          </View>

          {/* Actions */}
          <View style={styles.ceremonyActions}>
            <TouchableOpacity style={styles.ceremonySecondary} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.ceremonySecondaryText}>Back to Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ceremonyPrimary} onPress={onView} activeOpacity={0.8}>
              <Text style={styles.ceremonyPrimaryText}>View Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NewGroupModal({
  visible,
  onClose,
  idols,
  groups,
  agencyLogo,
  concepts,
  createGroup,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  idols: ReturnType<typeof useGame>['idols'];
  groups: ReturnType<typeof useGame>['groups'];
  agencyLogo: ReturnType<typeof useGame>['agency']['logo'];
  concepts: ReturnType<typeof useGame>['conceptOptions'];
  createGroup: ReturnType<typeof useGame>['createGroup'];
  onCreated: (groupName: string, memberIds: string[]) => void;
}) {
  const usedLogoPresetIds = useMemo(() => {
    const ids = new Set<number>();
    if (agencyLogo.kind === 'preset') {
      ids.add(agencyLogo.preset);
    }
    groups.forEach(group => {
      if (group.logo?.kind === 'preset') {
        ids.add(group.logo.preset);
      }
    });
    return ids;
  }, [agencyLogo, groups]);
  const availableLogoPresets = useMemo(
    () => agencyLogoPresets.filter(preset => !usedLogoPresetIds.has(preset.id)),
    [usedLogoPresetIds],
  );
  const initialPresetId = availableLogoPresets[0]?.id ?? agencyLogoPresets[0].id;
  const [name, setName] = useState('');
  const [fan, setFan] = useState('');
  const [concept, setConcept] = useState(concepts[0] ?? '');
  const [logo, setLogo] = useState<AgencyLogo>({ kind: 'preset', preset: initialPresetId });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<Partial<Record<GroupRole, string>>>({});
  const available = idols.filter(i => !i.group);
  const hasRequiredRoles = REQUIRED_ROLES.every(role => Boolean(roleAssignments[role]));
  const canCreate =
    name.trim().length > 0 &&
    fan.trim().length > 0 &&
    concept.trim().length > 0 &&
    availableLogoPresets.length > 0 &&
    selectedIds.length >= 2 &&
    hasRequiredRoles;

  useEffect(() => {
    const currentPreset = logo.kind === 'preset' ? logo.preset : null;
    const stillAvailable =
      currentPreset !== null &&
      availableLogoPresets.some(preset => preset.id === currentPreset);
    if (!stillAvailable && availableLogoPresets.length > 0) {
      setLogo({ kind: 'preset', preset: availableLogoPresets[0].id });
    }
  }, [logo, availableLogoPresets]);

  const closeAndReset = () => {
    setName('');
    setFan('');
    setConcept(concepts[0] ?? '');
    setLogo({ kind: 'preset', preset: availableLogoPresets[0]?.id ?? agencyLogoPresets[0].id });
    setSelectedIds([]);
    setRoleAssignments({});
    onClose();
  };

  const toggleMember = (idolId: string) => {
    setSelectedIds(current => {
      if (!current.includes(idolId) && current.length >= 6) {
        return current;
      }
      const next = current.includes(idolId) ? current.filter(id => id !== idolId) : [...current, idolId];
      if (!next.includes(idolId)) {
        setRoleAssignments(prev => {
          const entries = Object.entries(prev).filter(([, assignedId]) => assignedId !== idolId);
          return Object.fromEntries(entries) as Partial<Record<GroupRole, string>>;
        });
      }
      return next;
    });
  };

  const assignRole = (role: GroupRole, idolId: string) => {
    setRoleAssignments(current => ({
      ...current,
      [role]: current[role] === idolId ? undefined : idolId,
    }));
  };

  const showCreateError = (result: Extract<CreateGroupResult, { ok: false }>) => {
    const messages: Record<typeof result.reason, string> = {
      MISSING_NAME: 'Please enter a group name.',
      MISSING_FAN_NAME: 'Please enter a fandom name.',
      MISSING_CONCEPT: 'Please select a group concept.',
      NOT_ENOUGH_MEMBERS: 'Select at least 2 recruited idols for this group.',
      TOO_MANY_MEMBERS: 'Groups are limited to 6 members. Please deselect some idols.',
      MEMBER_UNAVAILABLE: 'One or more selected idols are no longer available.',
      MISSING_REQUIRED_ROLE: 'Assign Leader, Main Vocal, and Main Dancer before creating.',
      INVALID_ROLE_ASSIGNMENT: 'Role assignments must use selected members only.',
    };
    Alert.alert('Cannot create group', messages[result.reason]);
  };

  const handleCreate = () => {
    const result = createGroup({
      name,
      fanName: fan,
      concept,
      logo,
      memberIds: selectedIds,
      roleAssignments,
    });

    if (!result.ok) {
      showCreateError(result);
      return;
    }

    closeAndReset();
    onCreated(result.groupName, selectedIds);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeAndReset}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Create new group</Text>
            <Text style={styles.tinyMuted}>Define identity, fandom and roles.</Text>
            <View style={styles.modalBody}>
              <Field label="Group name" placeholder="e.g. AURORA" value={name} onChangeText={setName} />
              <Field label="Fan name" placeholder="e.g. STELLA" value={fan} onChangeText={setFan} />
              <View>
                <Text style={styles.fieldLabel}>CONCEPT</Text>
                <View style={styles.chipWrap}>
                  {concepts.map(option => {
                    const active = concept === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.roleChip, active && styles.selectedChip]}
                        onPress={() => setConcept(option)}
                        activeOpacity={0.8}>
                        <Text style={[styles.roleChipText, active && styles.selectedChipText]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text style={styles.fieldLabel}>GROUP LOGO</Text>
                <View style={styles.logoWrap}>
                  {availableLogoPresets.map(preset => {
                    const active = logo.kind === 'preset' && logo.preset === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[styles.logoOption, active && styles.selectedChip]}
                        onPress={() => setLogo({ kind: 'preset', preset: preset.id })}
                        activeOpacity={0.8}>
                        <AgencyLogoMark preset={preset.id} size={38} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {availableLogoPresets.length === 0 && (
                  <Text style={styles.helperText}>
                    All preset logos are already used by this agency or existing groups.
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.fieldLabel}>AVAILABLE MEMBERS ({selectedIds.length}/6 SELECTED)</Text>
                {available.length === 0 && (
                  <Text style={styles.helperText}>No available idols. Recruit idols or use idols who are not already assigned to a group.</Text>
                )}
                <View style={styles.chipWrap}>
                  {available.map(i => {
                    const active = selectedIds.includes(i.id);
                    return (
                      <TouchableOpacity
                        key={i.id}
                        style={[styles.memberChip, active && styles.selectedChip]}
                        onPress={() => toggleMember(i.id)}
                        activeOpacity={0.8}>
                        <Avatar name={i.stageName} gradient={i.gradient} image={i.image} size={24} />
                        <Text style={[styles.memberChipText, active && styles.selectedChipText]}> {i.stageName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.helperText}>
                  Groups can start as pre-debut units with 2+ members. Debut readiness still improves at 3+ members.
                </Text>
              </View>
              <View>
                <Text style={styles.fieldLabel}>ROLE ASSIGNMENT</Text>
                {selectedIds.length === 0 ? (
                  <Text style={styles.helperText}>Select members first to assign core roles.</Text>
                ) : (
                  <View style={styles.roleTable}>
                    {/* Header */}
                    <View style={styles.roleTableHeader}>
                      <View style={styles.roleTableRoleCell}>
                        <Text style={styles.roleTableHeadText}>ROLE</Text>
                      </View>
                      {available
                        .filter(m => selectedIds.includes(m.id))
                        .map(m => (
                          <View key={m.id} style={styles.roleTableMemberCell}>
                            <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={22} />
                            <Text style={styles.roleTableMemberName} numberOfLines={1}>{m.stageName}</Text>
                          </View>
                        ))}
                    </View>
                    {/* Rows */}
                    {GROUP_ROLES.map(role => {
                      const isRequired = REQUIRED_ROLES.includes(role);
                      const assignedId = roleAssignments[role];
                      return (
                        <View key={role} style={styles.roleTableRow}>
                          <View style={styles.roleTableRoleCell}>
                            <Text style={[styles.roleTableRoleText, isRequired && styles.roleTableRoleRequired]}>
                              {role}{isRequired ? ' *' : ''}
                            </Text>
                          </View>
                          {available
                            .filter(m => selectedIds.includes(m.id))
                            .map(m => {
                              const active = assignedId === m.id;
                              const score = scoreRoleFit(m, role);
                              return (
                                <TouchableOpacity
                                  key={`${role}-${m.id}`}
                                  style={styles.roleTableMemberCell}
                                  onPress={() => assignRole(role, m.id)}
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
                <Text style={styles.helperText}>
                  Required (*): Leader, Main Vocal, Main Dancer. Score = fit for that role (higher is better).
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeAndReset} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
                onPress={handleCreate}
                activeOpacity={0.8}>
                <Text style={styles.createText}>Create group</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  tinyMuted: { fontSize: 11, color: colors.mutedForeground },
  tealText: { color: colors.tealBright },
  violetText: { color: colors.violetBright },
  mintText: { color: colors.mint, fontWeight: '600' },
  amberText: { color: colors.amber, fontWeight: '600' },

  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  newText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  emptyState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyIcon: { width: 48, height: 48, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.foreground, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.mutedForeground, fontSize: 12, textAlign: 'center', lineHeight: 18 },


  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }, modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(20,23,34,0.98)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  modalBody: { marginTop: spacing.lg, gap: spacing.md },
  fieldLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  helperText: { marginTop: spacing.sm, fontSize: 11, lineHeight: 16, color: colors.mutedForeground },
  roleSection: { marginTop: spacing.sm, gap: spacing.sm },
  roleRow: { gap: 6 },
  roleTitle: { fontSize: 11, fontWeight: '700', color: colors.foreground },

  roleTable: { marginTop: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  roleTableHeader: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: colors.border },
  roleTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  roleTableRoleCell: { width: 90, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, justifyContent: 'center' },
  roleTableMemberCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, gap: 3 },
  roleTableHeadText: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: colors.mutedForeground },
  roleTableMemberName: { fontSize: 7, fontWeight: '700', color: colors.mutedForeground, textAlign: 'center' },
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
  fieldInput: {
    marginTop: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.foreground,
  },
  uploadBox: {
    marginTop: 4,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.whiteA15,
    backgroundColor: colors.whiteA05,
  },
  chipWrap: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  logoWrap: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logoOption: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  memberChipText: { fontSize: 11, color: colors.foreground },
  selectedChip: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  selectedChipText: { color: colors.tealBright, fontWeight: '700' },
  roleChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  roleChipText: { fontSize: 10, color: colors.foreground },
  modalActions: { marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  cancelText: { fontSize: 14, color: colors.foreground },
  createBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  createBtnDisabled: { opacity: 0.5 },
  createText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },

  // ── Group creation ceremony ──
  ceremonyBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  ceremonyCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.4)',
    backgroundColor: 'rgba(10,13,22,0.98)',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  ceremonyBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  ceremonyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  ceremonyBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: colors.slate900 },
  ceremonyGroupName: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ceremonyTagline: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  ceremonyLineup: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  ceremonyMember: {
    width: 64,
    height: 90,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.25)',
    backgroundColor: '#080B12',
    justifyContent: 'flex-end',
  },
  ceremonyMemberPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  ceremonyMemberFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tealActiveBg },
  ceremonyMemberInitials: { fontSize: 14, fontWeight: '900', color: 'rgba(103,232,249,0.4)', letterSpacing: 2 },
  ceremonyMemberShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'rgba(0,0,0,0.6)' },
  ceremonyMemberName: {
    paddingHorizontal: 3,
    paddingBottom: 5,
    fontSize: 8,
    fontWeight: '800',
    color: colors.foreground,
    textAlign: 'center',
  },
  ceremonyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ceremonyMetaText: { fontSize: 11, color: colors.mutedForeground },
  ceremonyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  ceremonySecondary: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  ceremonySecondaryText: { fontSize: 13, color: colors.foreground },
  ceremonyPrimary: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
  },
  ceremonyPrimaryText: { fontSize: 13, fontWeight: '700', color: colors.slate900 },
});
