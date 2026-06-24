import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, LogOut, Sparkles, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList } from '../navigation/types';
import { type SaveSlot, useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import firstScreenLogo from '../assets/app_icon.png';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Per-slot accent palette
const SLOT_ACCENT: Record<number, { color: string; bright: string; gradient: string[] }> = {
  1: { color: colors.teal, bright: colors.tealBright, gradient: [colors.teal, colors.tealBright] },
  2: { color: colors.teal, bright: colors.tealBright, gradient: [colors.teal, colors.tealBright] },
  3: { color: colors.teal, bright: colors.tealBright, gradient: [colors.teal, colors.tealBright] },
};

// ─── Decorative divider ───────────────────────────────────────────────────────
function GlowDivider() {
  return (
    <View style={divStyles.row}>
      <View style={divStyles.line} />
      <Sparkles size={11} color={colors.tealBright} />
      <View style={divStyles.line} />
    </View>
  );
}

const divStyles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '65%' },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(103,232,249,0.25)' },
});

// ─── Slot card ────────────────────────────────────────────────────────────────
function SlotCard({
  slot,
  onPress,
  onDelete,
}: {
  slot: SaveSlot;
  onPress: () => void;
  onDelete: () => void;
}) {
  const accent = SLOT_ACCENT[slot.id] ?? SLOT_ACCENT[1];
  const filled = slot.hasSave;
  const timeLabel = slot.updatedAt ? formatDate(slot.updatedAt) : null;

  if (filled) {
    return (
      <TouchableOpacity
        style={[styles.filledCard, { borderColor: accent.color + '55' }]}
        onPress={onPress}
        activeOpacity={0.82}>

        {/* Gradient accent stripe */}
        <View style={styles.stripe}>
          <Gradient colors={accent.gradient} direction="to-b" style={StyleSheet.absoluteFill} />
        </View>

        {/* Card body */}
        <View style={styles.filledBody}>
          {/* Top row: slot label + delete */}
          <View style={styles.filledTopRow}>
            <Text style={[styles.slotLabel, { color: accent.bright }]}>SLOT {slot.id}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onDelete}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={13} color={colors.hotSoft} />
            </TouchableOpacity>
          </View>

          {/* Agency name */}
          <Text style={styles.agencyName} numberOfLines={1}>
            {slot.agencyName ?? 'Unknown Agency'}
          </Text>

          {/* Bottom row: meta + continue CTA */}
          <View style={styles.filledBottomRow}>
            <Text style={styles.slotMeta} numberOfLines={1}>
              {slot.city ?? '—'}{timeLabel ? `  ·  ${timeLabel}` : ''}
            </Text>
            <View style={[styles.continuePill, { borderColor: accent.color + '55', backgroundColor: accent.color + '18' }]}>
              <Text style={[styles.continueText, { color: accent.bright }]}>CONTINUE</Text>
              <ChevronRight size={11} color={accent.bright} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Empty slot
  return (
    <TouchableOpacity
      style={[styles.emptyCard, { borderColor: accent.color + '44' }]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.emptyInner}>
        <View style={styles.emptyLeft}>
          <Text style={[styles.slotLabel, { color: accent.color }]}>SLOT {slot.id}</Text>
          <View style={styles.newGameRow}>
            <Sparkles size={12} color={accent.bright} />
            <Text style={[styles.newGameText, { color: accent.bright }]}>NEW GAME</Text>
          </View>
          <Text style={styles.newGameSub}>Begin a new idol agency</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function MainMenuScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { saveSlots, startNewGameInSlot, loadGameFromSlot, deleteSaveSlot } = useGame();

  const handleSlotPress = async (slot: SaveSlot) => {
    if (!slot.hasSave) {
      await startNewGameInSlot(slot.id);
      navigation.navigate('Onboarding');
      return;
    }
    const route = await loadGameFromSlot(slot.id);
    if (!route) {
      Alert.alert('Load failed', 'Could not load this save slot.');
      return;
    }
    navigation.navigate(route);
  };

  const confirmDelete = (slot: SaveSlot) => {
    if (!slot.hasSave) return;
    Alert.alert(
      'Delete save data?',
      `Slot ${slot.id} — "${slot.agencyName ?? 'Unknown'}" will be permanently erased.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSaveSlot(slot.id) },
      ],
    );
  };

  return (
    <Gradient colors={['#050711', '#0D1220', '#1A0D2E']} direction="to-b" style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 32), paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Logo + title ── */}
        <View style={styles.hero}>
          {/* Outer glow ring (violet) */}
          <View style={styles.logoOuterRing}>
            {/* Inner glow ring (teal border) */}
            <View style={styles.logoWrap}>
              <Image source={firstScreenLogo} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>

          <Text style={styles.eyebrow}>GLOBAL IDOL MANAGEMENT EXPERIENCE</Text>
          <Text style={styles.title}>Idol Agency{'\n'}Manager</Text>
          <GlowDivider />
        </View>

        {/* ── Save slots ── */}
        <View style={styles.slotsSection}>
          {saveSlots.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onPress={() => handleSlotPress(slot)}
              onDelete={() => confirmDelete(slot)}
            />
          ))}
        </View>

        {/* ── Exit ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => BackHandler.exitApp()}
            activeOpacity={0.8}>
            <LogOut size={14} color={colors.hotSoft} />
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
          <Text style={styles.copyright}>©2026 Idol Agency Manager</Text>
        </View>

      </ScrollView>
    </Gradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },

  // Hero
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm },

  logoOuterRing: {
    padding: 5,
    borderRadius: 34,
    backgroundColor: 'rgba(217,70,239,0.10)',
    shadowColor: colors.violet,
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  logoWrap: {
    width: 98,
    height: 98,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(103,232,249,0.55)',
    shadowColor: colors.teal,
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logoImage: { width: '100%', height: '100%' },

  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 44,
  },

  // Slots
  slotsSection: { gap: spacing.sm },

  // Filled card
  filledCard: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,24,38,0.88)',
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  filledBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 5,
  },
  filledTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  agencyName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  filledBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotMeta: { fontSize: 11, color: colors.mutedForeground, flex: 1 },
  continuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  continueText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  deleteBtn: {
    padding: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.3)',
    backgroundColor: 'rgba(251,113,133,0.07)',
  },

  // Empty card
  emptyCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyInner: { gap: 5 },
  emptyLeft: { gap: 4 },
  newGameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newGameText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  newGameSub: { fontSize: 11, color: colors.mutedForeground },

  // Footer
  footer: { alignItems: 'center', gap: spacing.sm },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.25)',
    backgroundColor: 'rgba(251,113,133,0.06)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  exitText: { fontSize: 13, fontWeight: '700', color: colors.hotSoft },
  copyright: { fontSize: 10, color: 'rgba(255,255,255,0.18)' },
});
