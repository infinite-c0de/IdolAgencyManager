import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { Gradient } from '../ui/Gradient';
import { colors, radius, spacing } from '../../theme';
import type { Agency } from '../../types';

type Props = {
  agency: Agency;
};

export function DashboardBanner({ agency }: Props) {
  const logoPreset = agency.logo.kind === 'preset' ? agency.logo.preset : 1;

  return (
    <View style={styles.banner}>
      <Gradient
        colors={['rgba(34,211,238,0.07)', 'rgba(217,70,239,0.07)']}
        direction="to-br"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          {agency.logo.kind === 'custom' ? (
            <Image source={{ uri: agency.logo.uri }} resizeMode="cover" style={styles.logoImg} />
          ) : (
            <AgencyLogoMark preset={logoPreset} size={56} />
          )}
        </View>

        {/* Text */}
        <View style={styles.textStack}>
          <Text style={styles.eyebrow}>AGENCY</Text>
          <Text style={styles.agencyName} numberOfLines={1}>{agency.name}</Text>
          <View style={styles.metaRow}>
            {agency.ceoName ? (
              <Text style={styles.metaText} numberOfLines={1}>{agency.ceoName}</Text>
            ) : null}
            {agency.ceoName && agency.city ? (
              <Text style={styles.metaDot}>·</Text>
            ) : null}
            {agency.city ? (
              <Text style={styles.metaText} numberOfLines={1}>{agency.city}</Text>
            ) : null}
          </View>
        </View>

        {/* Rank badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankHash}>#</Text>
          <Text style={styles.rankNum}>{agency.ranking}</Text>
          <Text style={styles.rankLabel}>RANK</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  logoWrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.2)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: { width: 56, height: 56 },
  textStack: { flex: 1, gap: 3, minWidth: 0 },
  eyebrow: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: colors.teal,
  },
  agencyName: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: colors.mutedForeground },
  metaDot: { fontSize: 11, color: colors.border },

  rankBadge: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.3)',
    backgroundColor: 'rgba(252,211,77,0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minWidth: 52,
    flexShrink: 0,
  },
  rankHash: { fontSize: 9, fontWeight: '900', color: colors.amber },
  rankNum: { fontSize: 26, fontWeight: '900', color: colors.amber, lineHeight: 30 },
  rankLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 1, color: colors.amber, opacity: 0.7 },
});
