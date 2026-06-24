import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W, height: H } = Dimensions.get('window');
const CELL_W = W / 3;
const CELL_H = H / 4;

// 12 fixed idol portraits for the mosaic — 3 cols × 4 rows
const MOSAIC: number[] = [
  require('../assets/idols/idol_sooyeon.webp'),
  require('../assets/idols/idol_mina.webp'),
  require('../assets/idols/idol_akari.webp'),
  require('../assets/idols/idol_daichi.webp'),
  require('../assets/idols/idol_meilin.webp'),
  require('../assets/idols/idol_chaewon.webp'),
  require('../assets/idols/idol_kaito.webp'),
  require('../assets/idols/idol_aria.webp'),
  require('../assets/idols/idol_xinyi.webp'),
  require('../assets/idols/idol_haruto.webp'),
  require('../assets/idols/idol_hana.webp'),
  require('../assets/idols/idol_kiyomi.webp'),
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  // Pulse animation for the "tap to continue" text
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const handlePress = () => {
    navigation.navigate('MainMenu');
  };

  return (
    <TouchableOpacity style={styles.root} onPress={handlePress} activeOpacity={1}>

      {/* ── Portrait mosaic ── */}
      <View style={styles.mosaic}>
        {MOSAIC.map((src, i) => (
          <Image
            key={i}
            source={src}
            style={styles.mosaicCell}
            resizeMode="cover"
          />
        ))}
      </View>

      {/* ── Dark overlays ── */}
      {/* Top fade */}
      <View style={styles.overlayTop} pointerEvents="none">
        <Gradient
          colors={['rgba(5,7,17,0.92)', 'transparent']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Bottom fade */}
      <View style={styles.overlayBottom} pointerEvents="none">
        <Gradient
          colors={['transparent', 'rgba(5,7,17,0.97)']}
          direction="to-b"
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Center dark wash */}
      <View style={styles.overlayCenterWash} pointerEvents="none" />

      {/* ── Content ── */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>

        {/* Title block — top */}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>GLOBAL IDOL MANAGEMENT EXPERIENCE</Text>
          <Text style={styles.title}>Idol Agency{'\n'}Manager</Text>
        </View>

        {/* Tap prompt — bottom */}
        <Animated.Text style={[styles.tapPrompt, { opacity: pulse }]}>
          · · ·  PRESS ANYWHERE TO CONTINUE  · · ·
        </Animated.Text>

      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgTop },

  // Mosaic
  mosaic: {
    position: 'absolute',
    top: 0, left: 0,
    width: W, height: H,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mosaicCell: {
    width: CELL_W,
    height: CELL_H,
  },

  // Overlays
  overlayTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: H * 0.35,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: H * 0.45,
  },
  overlayCenterWash: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(5,7,17,0.38)',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  titleBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  title: {
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -2,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 50,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },

  tapPrompt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
});
