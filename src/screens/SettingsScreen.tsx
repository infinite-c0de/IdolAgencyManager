import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  Heart,
  Pencil,
  Vibrate,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell } from '../components/AppShell';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({
  icon,
  label,
  sub,
  value,
  onToggle,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Toggle on={value} onPress={onToggle} />
    </View>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  onEdit,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onEdit}
      activeOpacity={onEdit ? 0.7 : 1}
      disabled={!onEdit}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      </View>
      {onEdit && <Pencil size={14} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.toggle, on ? styles.toggleOn : styles.toggleOff]}>
      <View style={[styles.knob, on ? styles.knobOn : styles.knobOff]} />
    </TouchableOpacity>
  );
}

// ─── Edit field modal ─────────────────────────────────────────────────────────
function EditModal({
  visible,
  title,
  value,
  placeholder,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  value: string;
  placeholder: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <X size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            style={styles.modalInput}
            autoFocus
            selectTextOnFocus
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !draft.trim() && styles.confirmBtnDim]}
              onPress={() => { if (draft.trim()) onConfirm(draft.trim()); }}
              activeOpacity={0.8}>
              <Text style={styles.confirmText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { agency, updateAgencyProfile } = useGame();

  const [confirmAdvance, setConfirmAdvance] = useState(true);
  const [welfareAlerts, setWelfareAlerts]   = useState(true);
  const [haptics, setHaptics]               = useState(false);
  const [notifications, setNotifications]   = useState(true);

  const [editField, setEditField] = useState<'name' | 'ceo' | null>(null);

  return (
    <AppShell title="Settings">

      {/* ── AGENCY ── */}
      <Section label="AGENCY">
        <InfoRow
          icon={<Text style={styles.fieldIcon}>🏢</Text>}
          label="Agency Name"
          value={agency.name}
          onEdit={() => setEditField('name')}
        />
        <InfoRow
          icon={<Text style={styles.fieldIcon}>👤</Text>}
          label="CEO"
          value={agency.ceoName || '—'}
          onEdit={() => setEditField('ceo')}
        />
        <InfoRow
          icon={<Text style={styles.fieldIcon}>📍</Text>}
          label="City"
          value={agency.city}
          last
        />
      </Section>

      {/* ── GAMEPLAY ── */}
      <Section label="GAMEPLAY">
        <ToggleRow
          icon={<CalendarCheck size={16} color={colors.tealBright} />}
          label="Confirm before advancing week"
          sub="Show a dialog before each week advance"
          value={confirmAdvance}
          onToggle={() => setConfirmAdvance(v => !v)}
        />
        <ToggleRow
          icon={<Heart size={16} color={colors.hot} />}
          label="Low welfare alerts"
          sub="Warn when morale or health drops below 40"
          value={welfareAlerts}
          onToggle={() => setWelfareAlerts(v => !v)}
          last
        />
      </Section>

      {/* ── FEEDBACK ── */}
      <Section label="FEEDBACK">
        <ToggleRow
          icon={<Vibrate size={16} color={colors.violetBright} />}
          label="Haptics"
          value={haptics}
          onToggle={() => setHaptics(v => !v)}
        />
        <ToggleRow
          icon={<Bell size={16} color={colors.mint} />}
          label="Notifications"
          value={notifications}
          onToggle={() => setNotifications(v => !v)}
          last
        />
      </Section>

      {/* ── Edit modals ── */}
      <EditModal
        visible={editField === 'name'}
        title="Agency Name"
        value={agency.name}
        placeholder="e.g. AURORA ENTERTAINMENT"
        onConfirm={v => { updateAgencyProfile({ name: v }); setEditField(null); }}
        onCancel={() => setEditField(null)}
      />
      <EditModal
        visible={editField === 'ceo'}
        title="CEO Name"
        value={agency.ceoName}
        placeholder="e.g. Park Min-ji"
        onConfirm={v => { updateAgencyProfile({ ceoName: v }); setEditField(null); }}
        onCancel={() => setEditField(null)}
      />

    </AppShell>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Section
  section: { gap: 6 },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
    paddingHorizontal: spacing.xs,
  },
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(22,26,40,0.85)',
    overflow: 'hidden',
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowIcon: { width: 28, alignItems: 'center', flexShrink: 0 },
  rowText: { flex: 1, gap: 2, minWidth: 0 },
  rowLabel: { fontSize: 14, color: colors.foreground, fontWeight: '500' },
  rowSub: { fontSize: 11, color: colors.mutedForeground, lineHeight: 15 },
  rowValue: { fontSize: 12, color: colors.tealBright, fontWeight: '600' },
  fieldIcon: { fontSize: 14 },

  // Toggle
  toggle: {
    width: 38,
    height: 22,
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 2,
    flexShrink: 0,
  },
  toggleOn:  { backgroundColor: colors.teal },
  toggleOff: { backgroundColor: colors.whiteA15 },
  knob: { width: 18, height: 18, borderRadius: radius.full, backgroundColor: '#fff' },
  knobOn:  { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(18,21,32,0.99)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  modalInput: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.foreground,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  cancelText: { fontSize: 13, color: colors.foreground },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
  },
  confirmBtnDim: { opacity: 0.45 },
  confirmText: { fontSize: 13, fontWeight: '700', color: colors.slate900 },
});
