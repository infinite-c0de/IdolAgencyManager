import { Crown, Plus, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell, Avatar, Card } from '../components/AppShell';
import { RadarChart } from '../components/charts';
import { Gradient } from '../components/ui/Gradient';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

function avg(a: number[]) {
  return Math.round(a.reduce((s, n) => s + n, 0) / Math.max(a.length, 1));
}

export function GroupsScreen() {
  const { groups, idols } = useGame();
  const [open, setOpen] = useState(false);
  const active = groups.filter(g => g.status === 'Active').length;
  const predebut = groups.filter(g => g.status === 'Pre-debut').length;

  const newAction = (
    <TouchableOpacity style={styles.newBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
      <Plus size={14} color={colors.slate900} />
      <Text style={styles.newText}>New</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell
      title="Groups"
      subtitle={`${active} active · ${predebut} pre-debut`}
      action={newAction}>
      {groups.map(g => {
        const members = g.memberIds
          .map(id => idols.find(i => i.id === id))
          .filter((i): i is NonNullable<typeof i> => Boolean(i));
        const radar = [
          { skill: 'VOCAL', v: avg(members.map(m => m.stats.vocal)) },
          { skill: 'DANCE', v: avg(members.map(m => m.stats.dance)) },
          { skill: 'RAP', v: avg(members.map(m => m.stats.rap)) },
          { skill: 'VISUAL', v: avg(members.map(m => m.stats.visual)) },
          { skill: 'CHARISMA', v: avg(members.map(m => m.stats.charisma)) },
        ];
        const ready =
          members.length >= 3 &&
          avg(members.map(m => m.stats.vocal)) >= 70 &&
          avg(members.map(m => m.stats.dance)) >= 70;

        const checks = [
          { ok: members.length >= 3, t: '≥ 3 members' },
          { ok: true, t: 'Leader assigned' },
          { ok: avg(members.map(m => m.stats.vocal)) >= 70, t: 'Vocal avg ≥ 70' },
          { ok: avg(members.map(m => m.stats.dance)) >= 70, t: 'Dance avg ≥ 70' },
          { ok: g.status === 'Active', t: 'Debut song' },
          { ok: g.status === 'Active', t: 'Promotion plan' },
        ];

        return (
          <Card key={g.id} glow={g.status === 'Active' ? 'teal' : 'violet'}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Gradient colors={g.gradient} style={styles.groupIcon}>
                  <Sparkles size={20} color="rgba(255,255,255,0.9)" />
                </Gradient>
                <View style={styles.flex1}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={styles.tinyMuted}>
                    Fandom · <Text style={styles.fanName}>{g.fanName}</Text> · {g.concept}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  g.status === 'Active' ? styles.statusTeal : styles.statusViolet,
                ]}>
                <Text style={[styles.statusBadgeText, g.status === 'Active' ? styles.tealText : styles.violetText]}>
                  {g.status}
                </Text>
              </View>
            </View>

            <View style={styles.miniRow}>
              <Mini label="Popularity" v={`${g.popularity}%`} />
              <Mini label="Synergy" v={`${g.synergy}`} />
              <Mini label="Income" v={g.monthlyRevenue ? fmt(g.monthlyRevenue) : '—'} />
            </View>

            <View style={styles.bodyRow}>
              <View style={styles.flex1}>
                <Text style={styles.subLabel}>MEMBERS & ROLES</Text>
                <View style={styles.memberList}>
                  {members.map((m, idx) => (
                    <View key={m.id} style={styles.memberItem}>
                      <Avatar name={m.stageName} gradient={m.gradient} image={m.image} size={32} />
                      <View style={styles.flex1}>
                        <View style={styles.memberNameRow}>
                          {idx === 0 && <Crown size={12} color={colors.amber} />}
                          <Text style={styles.memberName}> {m.stageName}</Text>
                        </View>
                        <Text style={styles.tinyMuted}>
                          {idx === 0 ? 'Leader · ' : ''}
                          {m.role}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.synergyCol}>
                <Text style={styles.subLabel}>SYNERGY</Text>
                <View style={styles.radarBox}>
                  <RadarChart data={radar} size={150} fillStops={[colors.teal, colors.violet]} />
                </View>
              </View>
            </View>

            <View style={styles.readiness}>
              <Text style={styles.subLabel}>DEBUT READINESS</Text>
              <View style={styles.checkGrid}>
                {checks.map(c => (
                  <View key={c.t} style={styles.checkItem}>
                    <View style={[styles.checkDot, c.ok ? styles.checkOn : styles.checkOff]} />
                    <Text style={c.ok ? styles.checkTextOn : styles.checkTextOff}>{c.t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.readyText}>
                {ready ? (
                  <Text style={styles.mintText}>Ready to debut</Text>
                ) : (
                  <Text style={styles.amberText}>Almost there</Text>
                )}
              </Text>
            </View>
          </Card>
        );
      })}

      <NewGroupModal visible={open} onClose={() => setOpen(false)} idols={idols} />
    </AppShell>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.tinyMuted}>{label}</Text>
      <Text style={styles.miniValue}>{v}</Text>
    </View>
  );
}

function NewGroupModal({
  visible,
  onClose,
  idols,
}: {
  visible: boolean;
  onClose: () => void;
  idols: ReturnType<typeof useGame>['idols'];
}) {
  const roles = ['Leader', 'Main Vocal', 'Lead Vocal', 'Main Dancer', 'Lead Dancer', 'Main Rapper', 'Visual', 'Center', 'Maknae'];
  const [name, setName] = useState('');
  const [fan, setFan] = useState('');
  const available = idols.filter(i => !i.group);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Create new group</Text>
            <Text style={styles.tinyMuted}>Define identity, fandom and roles.</Text>
            <View style={styles.modalBody}>
              <Field label="Group name" placeholder="e.g. AURORA" value={name} onChangeText={setName} />
              <Field label="Fan name" placeholder="e.g. STELLA" value={fan} onChangeText={setFan} />
              <View>
                <Text style={styles.fieldLabel}>LOGO</Text>
                <View style={styles.uploadBox}>
                  <Text style={styles.tinyMuted}>Upload logo (placeholder)</Text>
                </View>
              </View>
              <View>
                <Text style={styles.fieldLabel}>AVAILABLE MEMBERS</Text>
                <View style={styles.chipWrap}>
                  {available.map(i => (
                    <View key={i.id} style={styles.memberChip}>
                      <Avatar name={i.stageName} gradient={i.gradient} image={i.image} size={18} />
                      <Text style={styles.memberChipText}> {i.stageName}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View>
                <Text style={styles.fieldLabel}>ROLES</Text>
                <View style={styles.chipWrap}>
                  {roles.map(r => (
                    <View key={r} style={styles.roleChip}>
                      <Text style={styles.roleChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.createText}>Create group</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  tinyMuted: { fontSize: 11, color: colors.mutedForeground },
  tealText: { color: colors.tealBright },
  violetText: { color: colors.violetBright },
  mintText: { color: colors.mint, fontWeight: '600' },
  amberText: { color: colors.amber, fontWeight: '600' },

  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  newText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  groupName: { color: colors.tealBright, fontSize: 22, fontWeight: '900' },
  fanName: { color: colors.violetBright, fontWeight: '600' },
  statusBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusTeal: { borderColor: 'rgba(103,232,249,0.5)' },
  statusViolet: { borderColor: 'rgba(232,121,249,0.5)' },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },

  miniRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  mini: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  miniValue: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  bodyRow: { marginTop: spacing.md, gap: spacing.md },
  subLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground, marginBottom: spacing.sm },
  memberList: { gap: 6 },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: 6,
  },
  memberNameRow: { flexDirection: 'row', alignItems: 'center' },
  memberName: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  synergyCol: {},
  radarBox: { alignItems: 'center' },

  readiness: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  checkItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  checkDot: { width: 8, height: 8, borderRadius: radius.full },
  checkOn: { backgroundColor: colors.mint },
  checkOff: { backgroundColor: 'rgba(255,255,255,0.2)' },
  checkTextOn: { fontSize: 11, color: colors.foreground },
  checkTextOff: { fontSize: 11, color: colors.mutedForeground },
  readyText: { textAlign: 'right', fontSize: 11 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(20,23,34,0.98)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  modalBody: { marginTop: spacing.lg, gap: spacing.md },
  fieldLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  fieldInput: {
    marginTop: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.foreground,
  },
  uploadBox: {
    marginTop: 4,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.whiteA15,
    backgroundColor: colors.whiteA05,
  },
  chipWrap: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  memberChipText: { fontSize: 11, color: colors.foreground },
  roleChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  roleChipText: { fontSize: 10, color: colors.foreground },
  modalActions: { marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  cancelText: { fontSize: 14, color: colors.foreground },
  createBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  createText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
});
