import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
};

const STATUS_COLOR: Record<string, string> = {
  Active:    colors.tealBright,
  'Pre-debut': colors.violetBright,
  Disbanded: colors.mutedForeground,
};

export function GroupCardHeader({ name, fanName, concept, logo, status, memberCount, gradient }: Props) {
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
          <AgencyLogoMark preset={logoPreset} size={44} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: statusColor }]} numberOfLines={1}>{name}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            <Text style={[styles.fanName, { color: statusColor + 'BB' }]}>{fanName}</Text>
            {'  ·  '}{concept}{'  ·  '}{memberCount} members
          </Text>
        </View>

        <View style={[styles.statusBadge, { borderColor: statusColor + '44', backgroundColor: statusColor + '12' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
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
    gap: 3,
    minWidth: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 10,
    color: colors.mutedForeground,
  },
  fanName: {
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
