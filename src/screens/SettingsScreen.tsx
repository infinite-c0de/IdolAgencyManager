import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Rocket, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, SectionTitle } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { resetGame } = useGame();
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [autoWeek, setAutoWeek] = useState(false);

  const confirmReset = () => {
    Alert.alert('Reset save data', 'This will clear every local save slot. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetGame();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  return (
    <Gradient colors={['#050711', '#0E1624', '#1B1233']} direction="to-b" style={styles.root}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
            style={styles.backBtn}
            activeOpacity={0.8}>
            <ChevronLeft size={16} color={colors.foreground} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>Gameplay controls and save management</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.modalCard}>
            <SectionTitle>GAME</SectionTitle>
            <Row label="Notifications" value={notifications} onToggle={() => setNotifications(v => !v)} />
            <Row label="Haptics" value={haptics} onToggle={() => setHaptics(v => !v)} />
            <Row label="Auto-advance week" value={autoWeek} onToggle={() => setAutoWeek(v => !v)} />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}>
              <Text style={styles.linkText}>Back to title screen</Text>
              <Rocket size={16} color={colors.tealBright} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerRow} onPress={confirmReset} activeOpacity={0.7}>
              <Text style={styles.dangerText}>Reset all save slots</Text>
              <Trash2 size={16} color="#FDA4AF" />
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
    </Gradient>
  );
}

function Row({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Toggle on={value} onPress={onToggle} />
    </View>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.toggle, on ? styles.toggleOn : styles.toggleOff]}>
      <View style={[styles.knob, on ? styles.knobOn : styles.knobOff]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  backText: { fontSize: 12, color: colors.foreground },
  headerTitle: { fontSize: 24, fontWeight: '900', color: colors.tealBright, letterSpacing: -0.4 },
  headerSpacer: { width: 72 },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  scrollContent: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  modalCard: {
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.45)',
    backgroundColor: 'rgba(17,22,35,0.92)',
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
  },
  settingLabel: { fontSize: 14, color: colors.foreground },
  toggle: { width: 36, height: 20, borderRadius: radius.full, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: colors.teal },
  toggleOff: { backgroundColor: colors.whiteA15 },
  knob: { width: 16, height: 16, borderRadius: radius.full, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },

  linkRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  linkText: { fontSize: 14, color: colors.foreground },
  dangerRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.4)',
    backgroundColor: 'rgba(251,113,133,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  dangerText: { fontSize: 14, color: '#FDA4AF' },

});
