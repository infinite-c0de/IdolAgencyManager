import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileText, Info, Palette, Rocket, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const swatches = [
  { n: 'bg', c: '#080B12' },
  { n: 'surf', c: '#10131D' },
  { n: 'teal', c: colors.teal },
  { n: 'violet', c: colors.violet },
  { n: 'mint', c: colors.mint },
];

const mvp = [
  'Agency creation',
  'Trainee recruitment',
  'Idol profiles',
  'Training schedule',
  'Group management',
  'Debut single workflow',
  'Promotion scheduling',
  'Market modifiers',
  'Rival event feed',
  'Finance dashboard',
];

const future = [
  'Personalities',
  'Scandals',
  'Sponsorships',
  'AI agencies',
  'Contracts',
  'Idol poaching',
  'Acquisitions',
  'Sub-labels',
  'World tours',
  'Advanced economy',
];

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [autoWeek, setAutoWeek] = useState(false);

  const confirmReset = () => {
    Alert.alert('Reset prototype data', 'This will clear local prototype progress. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <AppShell title="Settings" subtitle="Prototype controls & style guide">
      <Card>
        <SectionTitle>GAME</SectionTitle>
        <Row label="Notifications" value={notifications} onToggle={() => setNotifications(v => !v)} />
        <Row label="Haptics" value={haptics} onToggle={() => setHaptics(v => !v)} />
        <Row label="Auto-advance week" value={autoWeek} onToggle={() => setAutoWeek(v => !v)} />
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.7}>
          <Text style={styles.linkText}>Restart onboarding</Text>
          <Rocket size={16} color={colors.tealBright} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerRow} onPress={confirmReset} activeOpacity={0.7}>
          <Text style={styles.dangerText}>Reset prototype data</Text>
          <Trash2 size={16} color="#FDA4AF" />
        </TouchableOpacity>
      </Card>

      <Card>
        <SectionTitle>STYLE GUIDE</SectionTitle>
        <View style={styles.swatchRow}>
          {swatches.map(s => (
            <View key={s.n} style={styles.swatchCol}>
              <View style={[styles.swatch, { backgroundColor: s.c }]} />
              <Text style={styles.tinyMuted}>{s.n}</Text>
            </View>
          ))}
        </View>
        <View style={styles.noteRow}>
          <Palette size={16} color={colors.mutedForeground} />
          <Text style={styles.note}> Dark futuristic · neon teal / violet · glass cards · soft glow</Text>
        </View>
      </Card>

      <Card>
        <SectionTitle>MVP SCOPE</SectionTitle>
        <View style={styles.bulletList}>
          {mvp.map(s => (
            <View key={s} style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.noteRow}>
          <Info size={16} color={colors.mutedForeground} />
          <Text style={styles.note}> Future expansion</Text>
        </View>
        <View style={styles.chipWrap}>
          {future.map(t => (
            <View key={t} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.footer}>
        <FileText size={12} color={colors.mutedForeground} />
        <Text style={styles.tinyMuted}> Prototype v0.1 · UI-only vertical slice</Text>
      </View>
    </AppShell>
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

  swatchRow: { flexDirection: 'row', gap: spacing.sm },
  swatchCol: { flex: 1, alignItems: 'center', gap: 4 },
  swatch: { height: 48, width: '100%', borderRadius: radius.lg },
  noteRow: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' },
  note: { fontSize: 12, color: colors.mutedForeground },

  bulletList: { gap: 6 },
  bulletItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bulletDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.teal },
  bulletText: { fontSize: 12, color: colors.foreground },

  chipWrap: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  chipText: { fontSize: 10, color: colors.foreground },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
