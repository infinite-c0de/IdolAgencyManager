import { Crown, Plus, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell, Avatar, Card } from '../components/AppShell';
import { RadarChart } from '../components/charts';
import { Gradient } from '../components/ui/Gradient';
import type { CreateGroupResult } from '../features/groups';
import { buildGroupRadar, buildGroupReadiness, getGroupMembers } from '../features/groups';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import type { GroupRole } from '../types';
import { fmt } from '../utils/format';

const GROUP_ROLES: GroupRole[] = [
  'Leader',
  'Main Vocal',
  'Main Dancer',
  'Main Rapper',
  'Visual',
  'Center',
];
const REQUIRED_ROLES: GroupRole[] = ['Leader', 'Main Vocal', 'Main Dancer'];

export function GroupsScreen() {
  const { groups, idols, conceptOptions, createGroup } = useGame();
  const [open, setOpen] = useState(false);
  const active = groups.filter(g => g.status === 'Active').length;
  const predebut = groups.filter(g => g.status === 'Pre-debut').length;

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

      {groups.map(g => {
        const members = getGroupMembers(g, idols);
        const radar = buildGroupRadar(members);
        const readiness = buildGroupReadiness(members, g.status === 'Active');

        return (
          <Card key={g.id} glow={g.status === 'Active' ? 'teal' : 'violet'}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Gradient colors={g.gradient} style={styles.groupIcon}>
                  <Sparkles size={20} color="rgba(255,255,255,0.9)" />
                </Gradient>
                <View style={styles.flex1}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={styles.tinyMuted}>
                    Fandom · <Text style={styles.fanName}>{g.fanName}</Text> · {g.concept}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  g.status === 'Active' ? styles.statusTeal : styles.statusViolet,
                ]}>
                <Text style={[styles.statusBadgeText, g.status === 'Active' ? styles.tealText : styles.violetText]}>
                  {g.status}
                </Text>
              </View>
            </View>

            <View style={styles.miniRow}>
              <Mini label="Popularity" v={`${g.popularity}%`} />
              <Mini label="Synergy" v={`${g.synergy}`} />
              <Mini label="Income" v={g.monthlyRevenue ? fmt(g.monthlyRevenue) : '—'} />
            </View>

            <View style={styles.bodyRow}>
              <View style={styles.flex1}>
                <Text style={styles.subLabel}>MEMBERS & ROLES</Text>
                <View style={styles.memberList}>
                  {members.map(m => {
                    const hasLeaderRole = m.role.includes('Leader');
                    return (
                      <View key={m.id} style={styles.memberItem}>
                        <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={32} />
                        <View style={styles.flex1}>
                          <View style={styles.memberNameRow}>
                            {hasLeaderRole && <Crown size={12} color={colors.amber} />}
                            <Text style={styles.memberName}> {m.stageName}</Text>
                          </View>
                          <Text style={styles.tinyMuted}>{m.role}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              <View style={styles.synergyCol}>
                <Text style={styles.subLabel}>SYNERGY</Text>
                <View style={styles.radarBox}>
                  <RadarChart data={radar} size={150} fillStops={[colors.teal, colors.violet]} />
                </View>
              </View>
            </View>

            <View style={styles.readiness}>
              <Text style={styles.subLabel}>DEBUT READINESS</Text>
              <View style={styles.checkGrid}>
                {readiness.checks.map(c => (
                  <View key={c.t} style={styles.checkItem}>
                    <View style={[styles.checkDot, c.ok ? styles.checkOn : styles.checkOff]} />
                    <Text style={c.ok ? styles.checkTextOn : styles.checkTextOff}>{c.t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.readyText}>
                {readiness.ready ? (
                  <Text style={styles.mintText}>Ready to debut</Text>
                ) : (
                  <Text style={styles.amberText}>Almost there</Text>
                )}
              </Text>
            </View>
          </Card>
        );
      })}

      <NewGroupModal
        visible={open}
        onClose={() => setOpen(false)}
        idols={idols}
        concepts={conceptOptions}
        createGroup={createGroup}
      />
    </AppShell>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.tinyMuted}>{label}</Text>
      <Text style={styles.miniValue}>{v}</Text>
    </View>
  );
}

function NewGroupModal({
  visible,
  onClose,
  idols,
  concepts,
  createGroup,
}: {
  visible: boolean;
  onClose: () => void;
  idols: ReturnType<typeof useGame>['idols'];
  concepts: ReturnType<typeof useGame>['conceptOptions'];
  createGroup: ReturnType<typeof useGame>['createGroup'];
}) {
  const [name, setName] = useState('');
  const [fan, setFan] = useState('');
  const [concept, setConcept] = useState(concepts[0] ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<Partial<Record<GroupRole, string>>>({});
  const available = idols.filter(i => !i.group);
  const hasRequiredRoles = REQUIRED_ROLES.every(role => Boolean(roleAssignments[role]));
  const canCreate =
    name.trim().length > 0 &&
    fan.trim().length > 0 &&
    concept.trim().length > 0 &&
    selectedIds.length >= 2 &&
    hasRequiredRoles;

  const closeAndReset = () => {
    setName('');
    setFan('');
    setConcept(concepts[0] ?? '');
    setSelectedIds([]);
    setRoleAssignments({});
    onClose();
  };

  const toggleMember = (idolId: string) => {
    setSelectedIds(current => {
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
      memberIds: selectedIds,
      roleAssignments,
    });

    if (!result.ok) {
      showCreateError(result);
      return;
    }

    Alert.alert('Group created', `${result.groupName} is now preparing for debut.`);
    closeAndReset();
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
                <Text style={styles.fieldLabel}>AVAILABLE MEMBERS ({selectedIds.length} SELECTED)</Text>
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
                        <Avatar name={i.stageName} gradient={i.gradient} image={i.image} size={18} />
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
                  <View style={styles.roleSection}>
                    {GROUP_ROLES.map(role => {
                      const assignedId = roleAssignments[role];
                      const isRequired = REQUIRED_ROLES.includes(role);
                      return (
                        <View key={role} style={styles.roleRow}>
                          <Text style={styles.roleTitle}>
                            {role}
                            {isRequired ? ' *' : ''}
                          </Text>
                          <View style={styles.chipWrap}>
                            {available
                              .filter(member => selectedIds.includes(member.id))
                              .map(member => {
                                const active = assignedId === member.id;
                                return (
                                  <TouchableOpacity
                                    key={`${role}-${member.id}`}
                                    style={[styles.roleChip, active && styles.selectedChip]}
                                    onPress={() => assignRole(role, member.id)}
                                    activeOpacity={0.8}>
                                    <Text style={[styles.roleChipText, active && styles.selectedChipText]}>
                                      {member.stageName}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
                <Text style={styles.helperText}>
                  Required roles: Leader, Main Vocal, Main Dancer. Better role fit increases group synergy.
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

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  groupName: { color: colors.tealBright, fontSize: 22, fontWeight: '900' },
  fanName: { color: colors.violetBright, fontWeight: '600' },
  statusBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusTeal: { borderColor: 'rgba(103,232,249,0.5)' },
  statusViolet: { borderColor: 'rgba(232,121,249,0.5)' },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },

  miniRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  mini: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  miniValue: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  bodyRow: { marginTop: spacing.md, gap: spacing.md },
  subLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground, marginBottom: spacing.sm },
  memberList: { gap: 6 },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 6,
  },
  memberNameRow: { flexDirection: 'row', alignItems: 'center' },
  memberName: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  synergyCol: {},
  radarBox: { alignItems: 'center' },

  readiness: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  checkItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  checkDot: { width: 8, height: 8, borderRadius: radius.full },
  checkOn: { backgroundColor: colors.mint },
  checkOff: { backgroundColor: 'rgba(255,255,255,0.2)' },
  checkTextOn: { fontSize: 11, color: colors.foreground },
  checkTextOff: { fontSize: 11, color: colors.mutedForeground },
  readyText: { textAlign: 'right', fontSize: 11 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
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
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  memberChipText: { fontSize: 11, color: colors.foreground },
  selectedChip: { borderColor: 'rgba(103,232,249,0.7)', backgroundColor: 'rgba(34,211,238,0.16)' },
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
});
