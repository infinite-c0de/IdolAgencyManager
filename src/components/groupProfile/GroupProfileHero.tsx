import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
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

        {/* Full black overlay — uniform brightness */}
        <View style={styles.fullOverlay} pointerEvents="none" />

        {/* Synergy badge — top right */}
        <View style={styles.synergyCorner} pointerEvents="none">
          <View style={[styles.synergyBadge, { borderColor: synergyTier.borderColor, backgroundColor: synergyTier.backgroundColor }]}>
            <Text style={styles.synergyLabel}>SYNERGY</Text>
            <Text style={[styles.synergyNum, { color: synergyTier.textColor }]}>{group.synergy}</Text>
            <Text style={[styles.synergyTier, { color: synergyTier.textColor }]}>{synergyTier.label}</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>{group.status}</Text>
        </View>
      </View>

      {/* Stat strip */}
      <View style={styles.statStrip}>
        <StatCell label="FANS" value={fans} color={colors.violetBright} />
        <View style={styles.stripDivider} />
        <StatCell label="INCOME" value={group.monthlyRevenue ? fmt(group.monthlyRevenue) : '—'} color={colors.mint} />
        <View style={styles.stripDivider} />
        <StatCell label="MEMBERS" value={`${group.memberIds.length}`} color={colors.tealBright} />
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
  fullOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  synergyCorner: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  statusCard: {
    position: 'absolute',
    left: spacing.md, 
    top: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.foreground,
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
