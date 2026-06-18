import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogOut, Play, Settings, Trash2, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, BackHandler, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList } from '../navigation/types';
import { SaveSlot, useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import firstScreenLogo from '../assets/app_icon.png';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SlotMode = 'new' | 'load';

export function MainMenuScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { saveSlots, startNewGameInSlot, loadGameFromSlot, deleteSaveSlot } = useGame();
  const [slotMode, setSlotMode] = useState<SlotMode | null>(null);

  const openSlots = (mode: SlotMode) => setSlotMode(mode);

  const handleSlotPress = async (slot: SaveSlot) => {
    if (slotMode === 'new') {
      if (slot.hasSave) {
        Alert.alert('Saved game found', 'There is already game data here. Please remove it first and try again.');
        return;
      }
      await startNewGameInSlot(slot.id);
      setSlotMode(null);
      navigation.navigate('Onboarding');
      return;
    }

    const route = await loadGameFromSlot(slot.id);
    if (!route) {
      Alert.alert('Empty slot', 'There is no saved game in this slot.');
      return;
    }

    setSlotMode(null);
    navigation.navigate(route);
  };

  const confirmDeleteSave = (slot: SaveSlot) => {
    if (!slot.hasSave) return;
    Alert.alert(
      'Delete saved data',
      `Remove saved data for ${slot.label}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSaveSlot(slot.id); } },
      ],
    );
  };

  return (
    <Gradient colors={['#050711', '#0D1220', '#1A0D2E']} direction="to-b" style={styles.root}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 32), paddingBottom: Math.max(insets.bottom, 24) }]}>

        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={firstScreenLogo} style={styles.logoImage} resizeMode="cover" />
          </View>
          <Text style={styles.eyebrow}>GLOBAL IDOL MANAGEMENT EXPERIENCE</Text>
          <Text style={styles.title}>Idol Agency{'\n'}Manager</Text>
          <Text style={styles.subtitle}>
            Build a label, scout trainees, train idols,{'\n'}and prepare your first debut.
          </Text>
        </View>

        {/* ── MENU BUTTONS ── */}
        <View style={styles.menuBlock}>
          {/* Primary CTA */}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => openSlots('new')} activeOpacity={0.88}>
            <Gradient colors={[colors.teal, colors.tealBright]} direction="to-r" style={styles.primaryGrad} />
            <Play size={18} color={colors.slate900} />
            <Text style={styles.primaryBtnText}>Start New Game</Text>
          </TouchableOpacity>

          {/* Secondary */}
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => openSlots('load')} activeOpacity={0.85}>
            <Upload size={16} color={colors.tealBright} />
            <Text style={styles.secondaryBtnText}>Load Game</Text>
          </TouchableOpacity>

          {/* Tertiary row */}
          <View style={styles.tertiaryRow}>
            <TouchableOpacity style={styles.tertiaryBtn} onPress={() => navigation.navigate('Settings')} activeOpacity={0.8}>
              <Settings size={14} color={colors.mutedForeground} />
              <Text style={styles.tertiaryText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.tertiaryDivider} />
            <TouchableOpacity style={styles.tertiaryBtn} onPress={() => BackHandler.exitApp()} activeOpacity={0.8}>
              <LogOut size={14} color="#FDA4AF" />
              <Text style={styles.tertiaryDanger}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>©2026 Idol Agency Manager · All rights reserved</Text>
      </View>

      {/* ── SLOT MODAL ── */}
      <Modal visible={slotMode !== null} transparent animationType="fade" onRequestClose={() => setSlotMode(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.flex1}>
                <Text style={styles.modalTitle}>{slotMode === 'new' ? 'Start New Game' : 'Load Game'}</Text>
                <Text style={styles.modalSubtitle}>
                  {slotMode === 'new'
                    ? 'Choose where your next idol journey begins.'
                    : 'Choose a saved agency to continue your comeback journey.'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSlotMode(null)} activeOpacity={0.8}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.slotList}>
              {saveSlots.map(slot => (
                <View key={slot.id} style={[styles.slotCard, slot.hasSave ? styles.slotFilled : styles.slotEmpty]}>
                  <TouchableOpacity onPress={() => handleSlotPress(slot)} activeOpacity={0.85}>
                    <View style={styles.slotTop}>
                      <Text style={styles.slotLabel}>{slot.label}</Text>
                      <Text style={[styles.slotStatus, slot.hasSave ? styles.slotStatusFilled : styles.slotStatusEmpty]}>
                        {slot.hasSave ? 'Saved' : 'Empty'}
                      </Text>
                    </View>
                    <Text style={styles.slotAgency}>{slot.agencyName ?? 'Empty slot'}</Text>
                    <View style={styles.slotMetaRow}>
                      <Text style={styles.slotMeta}>
                        {slot.hasSave ? `${slot.city ?? 'Unknown city'} · ${formatDate(slot.updatedAt)}` : 'Tap to begin a new agency'}
                      </Text>
                      {slot.hasSave ? (
                        <TouchableOpacity style={styles.deleteSaveBtn} onPress={() => confirmDeleteSave(slot)} activeOpacity={0.8}>
                          <Trash2 size={14} color="#FDA4AF" />
                          <Text style={styles.deleteSaveText}>Delete</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Gradient>
  );
}

function formatDate(value?: string) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl },

  // Hero
  hero: { alignItems: 'center', gap: spacing.md },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(234,179,8,0.5)',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  logoImage: { width: '100%', height: '100%' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 2.5, color: colors.mutedForeground },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 46,
  },
  subtitle: { fontSize: 13, lineHeight: 20, color: colors.mutedForeground, textAlign: 'center' },

  // Menu
  menuBlock: { gap: spacing.md },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 58,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowColor: colors.teal,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  primaryGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  primaryBtnText: { fontSize: 17, fontWeight: '900', color: colors.slate900, letterSpacing: 0.2 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
    backgroundColor: 'rgba(34,211,238,0.07)',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '800', color: colors.tealBright },
  tertiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  tertiaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  tertiaryDivider: { width: 1, height: 20, backgroundColor: colors.border },
  tertiaryText: { fontSize: 13, fontWeight: '700', color: colors.mutedForeground },
  tertiaryDanger: { fontSize: 13, fontWeight: '700', color: '#FDA4AF' },

  footer: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' },

  // Slot modal
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.72)' },
  modalCard: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(14,18,30,0.98)',
    padding: spacing.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  modalTitle: { fontSize: 22, fontWeight: '900', color: colors.tealBright },
  modalSubtitle: { marginTop: 3, fontSize: 11, color: colors.mutedForeground },
  closeBtn: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 6 },
  closeText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  slotList: { marginTop: spacing.lg, gap: spacing.sm },
  slotCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.md },
  slotFilled: { borderColor: 'rgba(34,211,238,0.5)', backgroundColor: 'rgba(34,211,238,0.07)' },
  slotEmpty: { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  slotTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedForeground },
  slotStatus: { fontSize: 10, fontWeight: '700' },
  slotStatusFilled: { color: colors.mint },
  slotStatusEmpty: { color: colors.mutedForeground },
  slotAgency: { marginTop: 5, fontSize: 20, fontWeight: '900', color: colors.foreground },
  slotMetaRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  slotMeta: { fontSize: 11, color: colors.mutedForeground, flex: 1 },
  deleteSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.4)',
    backgroundColor: 'rgba(251,113,133,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteSaveText: { fontSize: 10, fontWeight: '600', color: '#FDA4AF' },
});
