import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { Gradient } from '../ui/Gradient';
import { colors, radius, spacing } from '../../theme';
import type { Group, Idol } from '../../types';
import { fmt, fmtCount } from '../../utils/format';

type SynergyTier = {
  label: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
};

type Props = {
  group: Group;
  members: Idol[];
  synergyTier: SynergyTier;
};

function PortraitCell({ member }: { member: Idol }) {
  return (
    <View style={styles.portraitCell}>
      {member.image ? (
        <Image source={member.image} resizeMode="cover" style={styles.portraitImg} />
      ) : (
        <View style={styles.portraitFallback}>
          <Text style={styles.portraitInitials}>{member.stageName.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}

function buildRows(members: Idol[], numRows: number): Idol[][] {
  const rows: Idol[][] = [];
  let remaining = [...members];
  for (let r = 0; r < numRows; r++) {
    const rowsLeft = numRows - r;
    const rowSize = Math.ceil(remaining.length / rowsLeft);
    rows.push(remaining.splice(0, rowSize));
  }
  return rows;
}

export function GroupProfileHero({ group, members, synergyTier }: Props) {
  const logoPreset = group.logo?.kind === 'preset' ? group.logo.preset : 1;
  const fans = fmtCount(group.popularity * 3200);

  const numRows = members.length > 8 ? 3 : members.length > 4 ? 2 : 1;
  const rows = buildRows(members, numRows);
  const collageHeight = numRows === 3 ? 260 : numRows === 2 ? 228 : 190;

  return (
    <View style={styles.hero}>

      {/* Portrait collage */}
      <View style={[styles.collage, { height: collageHeight }]}>
        {members.length > 0 ? (
          <View style={styles.collageRows}>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.collageRow}>
                {row.map(m => <PortraitCell key={m.id} member={m} />)}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.collageEmpty} />
        )}

        {/* Group gradient tint wash */}
        <View style={styles.gradientWash} pointerEvents="none">
          <Gradient
            colors={[group.gradient[0] + '55', group.gradient[group.gradient.length - 1] + '55']}
            direction="to-r"
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Dark bottom fade for overlay legibility */}
        <View style={styles.bottomFade} pointerEvents="none">
          <Gradient
            colors={['transparent', 'rgba(0,0,0,0.88)']}
            direction="to-b"
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Bottom overlay: logo + name + pills */}
        <View style={styles.overlay}>
          <View style={[styles.logoWrap, { borderColor: colors.borderStrong }]}>
            {group.logo?.kind === 'custom' ? (
              <Image source={{ uri: group.logo.uri }} style={styles.logoImg} resizeMode="cover" />
            ) : (
              <AgencyLogoMark preset={logoPreset} size={40} />
            )}
          </View>

          <View style={styles.overlayText}>
            <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
            <View style={styles.pillRow}>
              <View style={[styles.pill, { borderColor: synergyTier.borderColor, backgroundColor: synergyTier.backgroundColor }]}>
                <Text style={[styles.pillText, { color: synergyTier.textColor }]}>{group.status}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillTextMuted}>{group.concept}</Text>
              </View>
            </View>
            <Text style={styles.fandom}>
              ♡{'  '}<Text style={styles.fandomVal}>{group.fanName}</Text>
            </Text>
          </View>

          {/* Synergy badge */}
          <View style={[styles.synergyBadge, { borderColor: synergyTier.borderColor, backgroundColor: synergyTier.backgroundColor }]}>
            <Text style={styles.synergyLabel}>SYNERGY</Text>
            <Text style={[styles.synergyNum, { color: synergyTier.textColor }]}>{group.synergy}</Text>
            <Text style={[styles.synergyTier, { color: synergyTier.textColor }]}>{synergyTier.label}</Text>
          </View>
        </View>
      </View>

      {/* Stat strip */}
      <View style={styles.statStrip}>
        <StatCell label="FANS"    value={fans}                           color={colors.violetBright} />
        <View style={styles.stripDivider} />
        <StatCell label="INCOME"  value={group.monthlyRevenue ? fmt(group.monthlyRevenue) : '—'} color={colors.mint} />
        <View style={styles.stripDivider} />
        <StatCell label="MEMBERS" value={`${group.memberIds.length}`}    color={colors.tealBright} />
      </View>
    </View>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },

  // Portrait collage
  collage: {
    height: 190,
    backgroundColor: '#080B12',
    position: 'relative',
    overflow: 'hidden',
  },
  collageRows: {
    flex: 1,
    flexDirection: 'column',
  },
  collageRow: {
    flex: 1,
    flexDirection: 'row',
  },
  collageEmpty: {
    flex: 1,
    backgroundColor: colors.tealActiveBg,
  },
  portraitCell: {
    flex: 1,
  },
  portraitImg: {
    width: '100%',
    height: '100%',
  },
  portraitFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  portraitInitials: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 2,
  },
  gradientWash: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomFade: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '65%',
  },

  // Bottom overlay
  overlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
  },
  logoWrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: { width: 40, height: 40 },
  overlayText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  pillTextMuted: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.6)',
  },
  fandom: {
    fontSize: 10,
    color: colors.mutedForeground,
  },
  fandomVal: {
    fontWeight: '700',
    color: colors.violetBright,
  },
  synergyBadge: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minWidth: 56,
    gap: 1,
    flexShrink: 0,
  },
  synergyLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  synergyNum: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 29,
  },
  synergyTier: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Stat strip
  statStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8,11,18,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingVertical: spacing.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    opacity: 0.75,
  },
  stripDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 2,
  },
});
