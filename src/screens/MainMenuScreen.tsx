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
        Alert.alert(
          'Saved game found',
          'There is already game data here. Please remove it first and try again.',
        );
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
    if (!slot.hasSave) {
      return;
    }

    Alert.alert(
      'Delete saved data',
      `Remove saved data for ${slot.label}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSaveSlot(slot.id);
          },
        },
      ],
    );
  };

  return (
    <Gradient colors={['#050711', '#111827', '#22113A']} direction="to-b" style={styles.root}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Image source={firstScreenLogo} style={styles.logoImage} resizeMode="cover" />
          </View>
          <Text style={styles.eyebrow}>GLOBAL IDOL MANAGEMENT EXPERIENCE</Text>
          <Text style={styles.title}>Idol Agency Manager</Text>
          <Text style={styles.subtitle}>
            Build a label, scout trainees, train idols, and prepare your first debut.
          </Text>
        </View>

        <View style={styles.buttonStack}>
          <TitleButton
            label="Start New Game"
            description="Start your agency here and begin your debut roadmap."
            Icon={Play}
            primary
            onPress={() => openSlots('new')}
          />
          <TitleButton
            label="Load Game"
            description="Continue your agency and resume your comeback journey"
            Icon={Upload}
            onPress={() => openSlots('load')}
          />
          <TitleButton
            label="Settings"
            description="Gameplay preferences and account controls"
            Icon={Settings}
            onPress={() => navigation.navigate('Settings')}
          />
          <TitleButton
            label="Exit"
            description="Close the game"
            Icon={LogOut}
            danger
            onPress={() => BackHandler.exitApp()}
          />
        </View>

        <Text style={styles.footer}>©2026 Idol Agency Manager · All rights reserved</Text>
      </View>

      <Modal visible={slotMode !== null} transparent animationType="fade" onRequestClose={() => setSlotMode(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{slotMode === 'new' ? 'Start New Game' : 'Load Game'}</Text>
                <Text style={styles.modalSubtitle}>
                  {slotMode === 'new'
                    ? 'Welcome, choose where your next idol journey begins.'
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
                    <Text style={styles.slotAgency}>{slot.agencyName ?? 'empty slot'}</Text>
                    <View style={styles.slotMetaRow}>
                      <Text style={styles.slotMeta}>
                        {slot.hasSave ? `${slot.city ?? 'Unknown city'} · ${formatDate(slot.updatedAt)}` : 'Tap to begin a new agency'}
                      </Text>
                      {slot.hasSave ? (
                        <TouchableOpacity
                          style={styles.deleteSaveBtn}
                          onPress={() => confirmDeleteSave(slot)}
                          activeOpacity={0.8}>
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

function TitleButton({
  label,
  description,
  Icon,
  onPress,
  primary = false,
  danger = false,
}: {
  label: string;
  description: string;
  Icon: typeof Play;
  onPress: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.titleButton, primary ? styles.titleButtonPrimary : danger ? styles.titleButtonDanger : styles.titleButtonIdle]}
      onPress={onPress}
      activeOpacity={0.85}>
      <View style={[styles.buttonIcon, primary ? styles.buttonIconPrimary : danger ? styles.buttonIconDanger : styles.buttonIconIdle]}>
        <Icon size={18} color={primary ? colors.slate900 : danger ? '#FDA4AF' : colors.tealBright} />
      </View>
      <View style={styles.flex1}>
        <Text style={[styles.buttonLabel, danger && styles.buttonLabelDanger]}>{label}</Text>
        <Text style={styles.buttonDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return 'No timestamp';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl },

  hero: { alignItems: 'center', paddingTop: spacing.xl },
  logo: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.65)',
    // backgroundColor: 'rgba(34,211,238,0.08)',
    shadowColor: colors.teal,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  eyebrow: { marginTop: spacing.lg, fontSize: 10, fontWeight: '700', letterSpacing: 2, color: colors.mutedForeground },
  title: { marginTop: 10, fontSize: 40, fontWeight: '900', letterSpacing: -1.5, color: colors.tealBright, textAlign: 'center' },
  subtitle: { marginTop: spacing.sm, maxWidth: 320, fontSize: 13, lineHeight: 20, color: colors.mutedForeground, textAlign: 'center' },

  buttonStack: { gap: spacing.md },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing.md,
  },
  titleButtonPrimary: { borderColor: 'rgba(34,211,238,0.75)', backgroundColor: 'rgba(34,211,238,0.18)' },
  titleButtonIdle: { borderColor: colors.borderStrong, backgroundColor: 'rgba(20,23,34,0.78)' },
  titleButtonDanger: { borderColor: 'rgba(251,113,133,0.42)', backgroundColor: 'rgba(251,113,133,0.08)' },
  buttonIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg },
  buttonIconPrimary: { backgroundColor: colors.teal },
  buttonIconIdle: { backgroundColor: colors.whiteA10 },
  buttonIconDanger: { backgroundColor: 'rgba(251,113,133,0.14)' },
  buttonLabel: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  buttonLabelDanger: { color: '#FDA4AF' },
  buttonDescription: { marginTop: 2, fontSize: 11, color: colors.mutedForeground },
  footer: { textAlign: 'center', fontSize: 10, color: colors.mutedForeground },

  modalBackdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.68)' },
  modalCard: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(20,23,34,0.98)',
    padding: spacing.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  modalTitle: { fontSize: 22, fontWeight: '900', color: colors.tealBright },
  modalSubtitle: { marginTop: 2, fontSize: 11, color: colors.mutedForeground },
  closeBtn: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 6 },
  closeText: { fontSize: 11, fontWeight: '600', color: colors.foreground },

  slotList: { marginTop: spacing.lg, gap: spacing.sm },
  slotCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.md },
  slotFilled: { borderColor: 'rgba(34,211,238,0.55)', backgroundColor: 'rgba(34,211,238,0.08)' },
  slotEmpty: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  slotTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: colors.foreground },
  slotStatus: { fontSize: 10, fontWeight: '700' },
  slotStatusFilled: { color: colors.mint },
  slotStatusEmpty: { color: colors.mutedForeground },
  slotAgency: { marginTop: 6, fontSize: 18, fontWeight: '900', color: colors.tealBright },
  slotMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotMeta: { fontSize: 11, color: colors.mutedForeground, flex: 1 },
  deleteSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
    backgroundColor: 'rgba(251,113,133,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteSaveText: { fontSize: 10, fontWeight: '600', color: '#FDA4AF' },
});
