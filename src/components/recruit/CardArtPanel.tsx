import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gradient } from '../ui/Gradient';
import { colors, radius, spacing } from '../../theme';
import { fmt } from '../../utils/format';
import { SKILL_COLOR } from './recruitConstants';

function resolveAspectRatio(source?: number): number {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

type Props = {
  image?: number;
  name: string;
  nationality: string;
  flag: string;
  age: number;
  skill: string;
  potential: number;
  cost: number;
  canAfford: boolean;
};

export function CardArtPanel({ image, name, nationality, flag, age, skill, potential, cost, canAfford }: Props) {
  const aspectRatio = resolveAspectRatio(image);
  const skillColor = SKILL_COLOR[skill] ?? colors.tealBright;

  return (
    <View style={[styles.artFrame, { aspectRatio }]}>
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.artPhoto} />
      ) : (
        <View style={styles.artFallback}>
          <Text style={styles.artFallbackText}>{name.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}

      {/* Bottom-half gradient fade — real gradient, not a flat overlay */}
      <View style={styles.gradientWrapper} pointerEvents="none">
        <Gradient
          colors={['transparent', 'rgba(0,0,0,0.88)']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Skill badge — top-left */}
      <View style={styles.artTopLeft}>
        <View style={[styles.skillBadge, { backgroundColor: skillColor + '22', borderColor: skillColor + '66' }]}>
          <View style={[styles.skillDot, { backgroundColor: skillColor }]} />
          <Text style={[styles.skillBadgeText, { color: skillColor }]}>{skill}</Text>
        </View>
      </View>

      {/* Potential badge — top-right */}
      <View style={styles.artTopRight}>
        <View style={styles.potentialBadge}>
          <Text style={styles.potentialNumber}>{potential}</Text>
          <View style={styles.potentialFooter}>
            <Text style={styles.potentialLabel}>POTENTIAL</Text>
          </View>
        </View>
      </View>

      {/* Name + cost overlay — bottom */}
      <View style={styles.artBottom}>
        <View style={styles.artNameRow}>
          <Text style={styles.artName} numberOfLines={1}>{name}</Text>
          <Text style={styles.artSub}>{flag} {nationality} · {age}yr</Text>
        </View>
        <Text style={[styles.artCost, !canAfford && styles.artCostInsufficient]}>
          {fmt(cost)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  artFrame: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#080B12',
  },
  artPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  artFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  artFallbackText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 4,
  },
  gradientWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  artTopLeft: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 4,
  },
  artTopRight: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 4,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  skillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  potentialBadge: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.35)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.sm,
    paddingTop: 5,
    paddingBottom: 4,
    gap: 1,
    minWidth: 44,
  },
  potentialNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.tealBright,
    letterSpacing: -0.5,
    lineHeight: 15,
  },
  potentialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  potentialLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.tealBright,
    opacity: 0.75,
  },
  artBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  artNameRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  artName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  artCost: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.tealBright,
  },
  artCostInsufficient: {
    color: colors.hot,
  },
  artSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
});
