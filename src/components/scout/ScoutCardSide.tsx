import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gradient } from '../ui/Gradient';
import { colors, radius } from '../../theme';

type Props = {
  image?: number;
  name: string;
  potential: number;
};

export function ScoutCardSide({ image, name, potential }: Props) {
  return (
    <View style={styles.side}>
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.initials}>{name.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}

      {/* Bottom gradient for badge legibility */}
      <View style={styles.gradientLayer} pointerEvents="none">
        <Gradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Potential badge */}
      <View style={styles.potBadge}>
        <Text style={styles.potValue}>{potential}</Text>
        <View style={styles.potFooter}>
          <Sparkles size={7} color={colors.tealBright} />
          <Text style={styles.potLabel}>POTENTIAL</Text>
        </View>
      </View>
    </View>
  );
}

const SIDE_WIDTH = 88;

const styles = StyleSheet.create({
  side: {
    width: SIDE_WIDTH,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(8,11,18,0.9)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  initials: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.35)',
    letterSpacing: 3,
  },
  gradientLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  potBadge: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  potValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.tealBright,
    lineHeight: 19,
  },
  potFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  potLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.tealBright,
    opacity: 0.8,
  },
});
