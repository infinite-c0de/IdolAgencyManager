import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gradient } from '../ui/Gradient';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { colors, radius, spacing, statusColor } from '../../theme';
import { ROLE_COLOR } from './rosterConstants';

function resolveAspectRatio(source?: number): number {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

type Props = {
  image?: number;
  stageName: string;
  role: string;
  status: string;
  flag: string;
  group?: string;
  groupLogoPreset?: number;
};

export function CardPortrait({ image, stageName, role, status, flag, group, groupLogoPreset }: Props) {
  const aspectRatio = resolveAspectRatio(image);
  const roleColor = ROLE_COLOR[role] ?? colors.mutedForeground;
  const statColor = statusColor[status] ?? colors.mutedForeground;

  return (
    <View style={[styles.frame, { aspectRatio }]}>
      {/* Photo */}
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{stageName.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}

      {/* Bottom gradient */}
      <View style={styles.gradientWrapper} pointerEvents="none">
        <Gradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Status badge — top-left */}
      <View style={styles.topLeft}>
        <View style={[styles.statusBadge, { borderColor: statColor + '66', backgroundColor: 'rgba(0,0,0,0.50)' }]}>
          <View style={[styles.statusDot, { backgroundColor: statColor }]} />
          <Text style={[styles.statusText, { color: statColor }]}>{status}</Text>
        </View>
      </View>

      {/* Flag — top-right */}
      <Text style={styles.flag}>{flag}</Text>

      {/* Bottom overlay: name+role left, group right */}
      <View style={styles.bottom}>
        <View style={styles.bottomLeft}>
          <Text style={styles.name} numberOfLines={1}>{stageName}</Text>
          <Text style={[styles.role, { color: roleColor }]} numberOfLines={1}>{role}</Text>
        </View>

        {group && (
          <View style={styles.groupBlock}>
            {groupLogoPreset != null && (
              <AgencyLogoMark preset={groupLogoPreset} size={20} />
            )}
            <Text style={styles.groupName} numberOfLines={1}>{group}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#080B12',
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
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 3,
  },
  gradientWrapper: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '60%',
  },

  // Top-left: status badge
  topLeft: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Top-right: flag
  flag: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    fontSize: 14,
    zIndex: 4,
  },

  // Bottom overlay
  bottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  bottomLeft: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  role: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Bottom-right: group
  groupBlock: {
    alignItems: 'center',
    gap: 0,
    flexShrink: 0,
    maxWidth: 52,
  },
  groupName: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
  },
});
