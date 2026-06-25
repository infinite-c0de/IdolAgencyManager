import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { Gradient } from '../ui/Gradient';
import { colors, radius, spacing } from '../../theme';
import type { AgencyLogo } from '../../types';

type Props = {
  name: string;
  fanName: string;
  concept: string;
  logo?: AgencyLogo;
  status: 'Active' | 'Pre-debut' | 'Disbanded';
  memberCount: number;
  gradient: string[];
  onViewPress: () => void;
};

const STATUS_COLOR: Record<string, string> = {
  Active:      colors.tealBright,
  'Pre-debut': colors.violetBright,
  Disbanded:   colors.mutedForeground,
};

export function GroupCardHeader({ name, fanName, concept, logo, status, memberCount, gradient, onViewPress }: Props) {
  const statusColor = STATUS_COLOR[status] ?? colors.mutedForeground;
  const logoPreset = logo?.kind === 'preset' ? logo.preset : 1;

  return (
    <View>
      {/* Gradient accent stripe */}
      <View style={styles.stripe}>
        <Gradient colors={gradient} direction="to-r" style={StyleSheet.absoluteFill} />
      </View>

      {/* Header body */}
      <View style={styles.body}>
        <View style={[styles.logoWrap, { borderColor: statusColor + '33' }]}>
          <AgencyLogoMark preset={logoPreset} size={48} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: statusColor }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.statusInline, { color: statusColor }]}>({status})</Text>
          </View>
          <View style={styles.subRow}>
            <Text style={[styles.fanName, { color: statusColor + 'BB' }]} numberOfLines={1}>{fanName}</Text>
            <Text style={styles.subDivider}>·</Text>
            <Text style={styles.sub} numberOfLines={1}>{concept}  ·  {memberCount} members</Text>
          </View>
        </View>

        {/* View Profile button replaces status badge */}
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: statusColor + '44', backgroundColor: statusColor + '12' }]}
          onPress={onViewPress}
          activeOpacity={0.75}>
          <Text style={[styles.viewBtnText, { color: statusColor }]}>View</Text>
          <ChevronRight size={11} color={statusColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoWrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'nowrap',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  statusInline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 0,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subDivider: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
  },
  fanName: {
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
  },
  sub: {
    fontSize: 10,
    color: colors.mutedForeground,
    flexShrink: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
