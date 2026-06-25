import { Crown, Pencil, Shield, Trash2, UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GroupReadinessBar } from '../groups/GroupReadinessBar';
import { ROLE_COLOR } from '../roster/rosterConstants';
import { colors, radius, spacing, statusColor } from '../../theme';
import type { Idol } from '../../types';

type Check = { ok: boolean; t: string };

type Props = {
  members: Idol[];
  alerts: string[];
  readinessChecks: Check[];
  readinessReady: boolean;
  canDisband: boolean;
  onMemberPress: (id: string) => void;
  onAddMember: () => void;
  onManageRoles: () => void;
  onRemoveMember: (id: string) => void;
  onDisband: () => void;
  onRename: () => void;
};

function MemberRow({
  member,
  editMode,
  onPress,
  onRemove,
}: {
  member: Idol;
  editMode: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  const isLeader = member.role.includes('Leader');
  const roleColor = ROLE_COLOR[member.role] ?? colors.mutedForeground;
  const statColor = statusColor[member.status] ?? colors.mutedForeground;

  return (
    <View style={styles.memberRow}>
      {editMode && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.75}>
          <X size={13} color={colors.hot} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.memberRowMain} onPress={onPress} activeOpacity={0.82}>
        <View style={styles.photo}>
          {member.image ? (
            <Image source={member.image} resizeMode="cover" style={styles.photoImg} />
          ) : (
            <View style={styles.photoFallback}>
              <Text style={styles.photoInitials}>{member.stageName.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
          {isLeader && (
            <View style={styles.crownBadge}>
              <Crown size={8} color={colors.amber} />
            </View>
          )}
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName} numberOfLines={1}>{member.stageName}</Text>
            <View style={[styles.statusDot, { backgroundColor: statColor }]} />
            <Text style={[styles.memberStatus, { color: statColor }]}>{member.status}</Text>
          </View>
          <View style={styles.memberSubRow}>
            <Text style={[styles.memberRole, { color: roleColor }]} numberOfLines={1}>{member.role}</Text>
            <View style={styles.welfareRow}>
              <Text style={[styles.welfareVal, { color: member.health < 40 ? colors.hot : colors.hotSoft }]}>
                ♥{member.health}
              </Text>
              <Text style={[styles.welfareVal, { color: member.morale < 40 ? colors.hot : colors.tealBright }]}>
                ◈{member.morale}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ActionCard({
  icon,
  label,
  sub,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, danger && styles.actionCardDanger]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.actionIconWrap, danger && styles.actionIconWrapDanger]}>
        {icon}
      </View>
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
      {sub && <Text style={styles.actionSub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

export function GroupLineupTab({
  members, alerts, readinessChecks, readinessReady,
  canDisband, onMemberPress, onAddMember, onManageRoles,
  onRemoveMember, onDisband, onRename,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  return (
    <View style={styles.container}>

      {/* ── MEMBERS ─────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MEMBERS</Text>
          {members.length > 0 && canDisband && (
            <TouchableOpacity
              style={[styles.editToggle, editMode && styles.editToggleActive]}
              onPress={() => setEditMode(e => !e)}
              activeOpacity={0.8}>
              <Text style={[styles.editToggleText, editMode && styles.editToggleTextActive]}>
                {editMode ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {members.length > 0 ? (
          <View style={styles.memberList}>
            {members.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                editMode={editMode}
                onPress={() => { if (!editMode) onMemberPress(m.id); }}
                onRemove={() => onRemoveMember(m.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No members yet. Use Add Member below.</Text>
          </View>
        )}
      </View>

      {/* ── ACTIONS ─────────────────────────────── */}
      {canDisband && (
        <View style={styles.section}>
          <View style={styles.sectionHeader2}>
            <Text style={styles.sectionTitle}>ACTIONS</Text>
          </View>
          <View style={styles.actionGrid}>
            <ActionCard
              icon={<UserPlus size={18} color={colors.tealBright} />}
              label="Add Member"
              sub="Assign an idol"
              onPress={onAddMember}
            />
            <ActionCard
              icon={<Shield size={18} color={colors.violetBright} />}
              label="Manage Roles"
              sub="Set assignments"
              onPress={onManageRoles}
            />
          </View>
        </View>
      )}

      {/* ── GROUP SETTINGS ───────────────────────── */}
      {canDisband && (
        <View style={styles.section}>
          <View style={styles.sectionHeader2}>
            <Text style={styles.sectionTitle}>GROUP SETTINGS</Text>
          </View>
          <View style={styles.actionGrid}>
            <ActionCard
              icon={<Pencil size={18} color={colors.foreground} />}
              label="Rename"
              sub="Change group name"
              onPress={onRename}
            />
            <ActionCard
              icon={<Trash2 size={18} color={colors.hot} />}
              label="Disband"
              sub="Dissolve group"
              onPress={onDisband}
              danger
            />
          </View>
        </View>
      )}

      {/* ── DEBUT READINESS ──────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader2}>
          <Text style={styles.sectionTitle}>DEBUT READINESS</Text>
        </View>
        <GroupReadinessBar checks={readinessChecks} ready={readinessReady} />
        <View style={styles.checkGrid}>
          {readinessChecks.map((c, i) => (
            <View key={i} style={[styles.checkItem, c.ok ? styles.checkOn : styles.checkOff]}>
              <View style={[styles.checkDot, c.ok ? styles.dotOn : styles.dotOff]} />
              <Text style={[styles.checkText, c.ok ? styles.checkTextOn : styles.checkTextOff]} numberOfLines={1}>
                {c.t}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── ALERTS ───────────────────────────────── */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader2}>
            <Text style={styles.sectionTitle}>ALERTS</Text>
          </View>
          <View style={styles.alertList}>
            {alerts.map(a => (
              <View key={a} style={styles.alertItem}>
                <Text style={styles.alertDot}>⚠</Text>
                <Text style={styles.alertText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

    </View>
  );
}

const PHOTO_SIZE = 52;

const styles = StyleSheet.create({
  container: { gap: spacing.md },

  section: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionHeader2: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },

  // Edit toggle
  editToggle: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  editToggleActive: {
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
  },
  editToggleText: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground },
  editToggleTextActive: { color: colors.tealBright },

  // Member list
  memberList: { gap: 0 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  memberRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  removeBtn: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    flexShrink: 0,
    position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  photoInitials: { fontSize: 14, fontWeight: '900', color: 'rgba(103,232,249,0.35)' },
  crownBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: { flex: 1, gap: 4, minWidth: 0 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 13, fontWeight: '800', color: colors.foreground, flexShrink: 1 },
  statusDot: { width: 5, height: 5, borderRadius: radius.full, flexShrink: 0 },
  memberStatus: { fontSize: 9, fontWeight: '700', flexShrink: 0 },
  memberSubRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberRole: { fontSize: 10, fontWeight: '700', flexShrink: 1 },
  welfareRow: { flexDirection: 'row', gap: spacing.sm, flexShrink: 0 },
  welfareVal: { fontSize: 10, fontWeight: '800' },
  empty: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  emptyText: { fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic' },

  // Action grid
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA04,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionCardDanger: {
    borderColor: 'rgba(251,113,133,0.3)',
    backgroundColor: 'rgba(251,113,133,0.06)',
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapDanger: {
    borderColor: 'rgba(251,113,133,0.3)',
    backgroundColor: 'rgba(251,113,133,0.1)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.foreground,
    textAlign: 'center',
  },
  actionLabelDanger: { color: colors.hot },
  actionSub: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.mutedForeground,
    textAlign: 'center',
  },

  // Readiness
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flex: 1,
    minWidth: '44%',
  },
  checkOn: { borderColor: 'rgba(52,211,153,0.4)', backgroundColor: 'rgba(52,211,153,0.07)' },
  checkOff: { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: colors.whiteA04 },
  checkDot: { width: 7, height: 7, borderRadius: radius.full, flexShrink: 0 },
  dotOn: { backgroundColor: colors.mint },
  dotOff: { backgroundColor: 'rgba(255,255,255,0.18)' },
  checkText: { fontSize: 10, fontWeight: '600', flexShrink: 1 },
  checkTextOn: { color: colors.foreground },
  checkTextOff: { color: colors.mutedForeground },

  // Alerts
  alertList: { gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.3)',
    backgroundColor: 'rgba(251,113,133,0.07)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  alertDot: { fontSize: 11, color: colors.hot },
  alertText: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 16 },
});
