import { ChevronRight, Crown, Plus } from 'lucide-react-native';
import React from 'react';
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
  onMemberPress: (id: string) => void;
  onAddMember: () => void;
  onManageRoles: () => void;
};

function MemberRow({ member, onPress }: { member: Idol; onPress: () => void }) {
  const isLeader = member.role.includes('Leader');
  const roleColor = ROLE_COLOR[member.role] ?? colors.mutedForeground;
  const statColor = statusColor[member.status] ?? colors.mutedForeground;

  return (
    <TouchableOpacity style={styles.memberRow} onPress={onPress} activeOpacity={0.82}>
      {/* Portrait thumbnail */}
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

      {/* Name + role + welfare */}
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

      <ChevronRight size={14} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export function GroupLineupTab({
  members, alerts, readinessChecks, readinessReady,
  onMemberPress, onAddMember, onManageRoles,
}: Props) {
  return (
    <View style={styles.container}>

      {/* Members section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MEMBERS</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rolesBtn} onPress={onManageRoles} activeOpacity={0.8}>
              <Text style={styles.rolesBtnText}>Manage Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={onAddMember} activeOpacity={0.8}>
              <Plus size={11} color={colors.slate900} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {members.length > 0 ? (
          <View style={styles.memberList}>
            {members.map(m => (
              <MemberRow key={m.id} member={m} onPress={() => onMemberPress(m.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No members yet. Tap Add to assign idols.</Text>
          </View>
        )}
      </View>

      {/* Readiness section */}
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

      {/* Alerts section */}
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
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rolesBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  rolesBtnText: { fontSize: 10, fontWeight: '700', color: colors.foreground },
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

  // Member list
  memberList: { gap: 0 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
