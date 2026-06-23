import { Activity, Heart, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gradient } from '../ui/Gradient';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { colors, radius, spacing, statusColor } from '../../theme';
import { ROLE_COLOR } from '../roster/rosterConstants';

function resolveAspectRatio(source?: number): number {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

function welfareColor(value: number, base: string): string {
  if (value < 30) return colors.hot;
  if (value < 55) return colors.amber;
  return base;
}

type Props = {
  image?: number;
  stageName: string;
  role: string;
  status: string;
  flag: string;
  health: number;
  morale: number;
  energy: number;
  groupName?: string;
  groupLogoPreset?: number;
};

export function ProfileHero({
  image, stageName, role, status, flag,
  health, morale, energy, groupName, groupLogoPreset,
}: Props) {
  const aspectRatio = resolveAspectRatio(image);
  const roleColor = ROLE_COLOR[role] ?? colors.mutedForeground;
  const statColor = statusColor[status] ?? colors.mutedForeground;
  const healthColor = welfareColor(health, colors.hotSoft);
  const moraleColor = welfareColor(morale, colors.teal);
  const energyColor = welfareColor(energy, colors.mint);

  return (
    <View style={[styles.frame, { aspectRatio }]}>
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{stageName.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}

      {/* Gradient fade — bottom 60% */}
      <View style={styles.gradientWrapper} pointerEvents="none">
        <Gradient
          colors={['transparent', 'rgba(0,0,0,0.90)']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Top row: status left, flag + group right */}
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { borderColor: statColor + '66' }]}>
          <View style={[styles.statusDot, { backgroundColor: statColor }]} />
          <Text style={[styles.statusText, { color: statColor }]}>{status}</Text>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.flag}>{flag}</Text>
          {groupName && (
            <View style={styles.groupBadge}>
              {groupLogoPreset != null && (
                <AgencyLogoMark preset={groupLogoPreset} size={18} />
              )}
              <Text style={styles.groupText} numberOfLines={1}>{groupName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom overlay: name+role left, welfare right */}
      <View style={styles.bottom}>
        <View style={styles.bottomLeft}>
          <Text style={styles.name} numberOfLines={1}>{stageName}</Text>
          <Text style={[styles.role, { color: roleColor }]} numberOfLines={1}>{role}</Text>
        </View>

        <View style={styles.welfareCol}>
          <WelfareStat icon={<Heart size={9} color={healthColor} />} value={health} color={healthColor} label="HEALTH" />
          <WelfareStat icon={<Activity size={9} color={moraleColor} />} value={morale} color={moraleColor} label="MORALE" />
          <WelfareStat icon={<Zap size={9} color={energyColor} />} value={energy} color={energyColor} label="ENERGY" />
        </View>
      </View>
    </View>
  );
}

function WelfareStat({ icon, value, color, label }: {
  icon: React.ReactNode;
  value: number;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.welfareItem}>
      {icon}
      <Text style={[styles.welfareValue, { color }]}>{value}</Text>
      <Text style={styles.welfareLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#080B12',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  fallbackText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 6,
  },
  gradientWrapper: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '62%',
  },

  // Top row
  topRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.50)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.foreground,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 22,
  },

  // Bottom overlay
  bottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  bottomLeft: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Welfare column
  welfareCol: {
    gap: 5,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  welfareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  welfareValue: {
    fontSize: 12,
    fontWeight: '900',
    minWidth: 22,
    textAlign: 'right',
  },
  welfareLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
    width: 40,
  },
});
