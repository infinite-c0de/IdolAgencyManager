import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { Gradient } from '../ui/Gradient';
import { getGroupMembers } from '../../features/groups';
import { colors, radius, spacing } from '../../theme';
import type { Group, Idol } from '../../types';
import { fmt } from '../../utils/format';

const STATUS_COLOR: Record<string, string> = {
  Active:      colors.tealBright,
  'Pre-debut': colors.violetBright,
  Disbanded:   colors.mutedForeground,
};

function GroupRow({ group, idols, onPress }: { group: Group; idols: Idol[]; onPress: () => void }) {
  const members = getGroupMembers(group, idols);
  const logoPreset = group.logo?.kind === 'preset' ? group.logo.preset : 1;
  const statusColor = STATUS_COLOR[group.status] ?? colors.mutedForeground;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>
      {/* Gradient left stripe */}
      <View style={styles.stripe}>
        <Gradient
          colors={group.gradient}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Logo */}
      <View style={styles.logoWrap}>
        <AgencyLogoMark preset={logoPreset} size={30} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
          <View style={[styles.statusPill, { borderColor: statusColor + '44', backgroundColor: statusColor + '12' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{group.status}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <StatChip label="syn"  value={`${group.synergy}`}                           color={colors.amber} />
          <StatChip label="mbr"  value={`${members.length}`}                          color={colors.tealBright} />
          {group.monthlyRevenue > 0 && (
            <StatChip label="mo" value={fmt(group.monthlyRevenue)}                    color={colors.mint} />
          )}
        </View>
      </View>

      <ChevronRight size={14} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipVal, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

type Props = {
  groups: Group[];
  idols: Idol[];
  onGroupPress: (groupId: string) => void;
  onManage: () => void;
};

export function DashboardGroupsStrip({ groups, idols, onGroupPress, onManage }: Props) {
  if (groups.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>GROUPS</Text>
        <TouchableOpacity onPress={onManage} activeOpacity={0.7}>
          <Text style={styles.headerLink}>Manage →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {groups.map(g => (
          <GroupRow
            key={g.id}
            group={g}
            idols={idols}
            onPress={() => onGroupPress(g.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  headerLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealBright,
  },
  list: { gap: spacing.sm },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,21,32,0.9)',
    overflow: 'hidden',
    paddingRight: spacing.sm,
  },

  stripe: {
    width: 4,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },

  logoWrap: {
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },

  info: {
    flex: 1,
    paddingVertical: spacing.sm,
    gap: 5,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.foreground,
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  chipVal: {
    fontSize: 11,
    fontWeight: '900',
  },
  chipLabel: {
    fontSize: 9,
    color: colors.mutedForeground,
  },
});
