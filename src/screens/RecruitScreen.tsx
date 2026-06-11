import { Sparkles, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { trainees } from '../data/mock';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const filters = ['All', 'Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'];

export function RecruitScreen() {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <AppShell title="Scout Trainees" subtitle="Build the next generation of stars">
      <Card>
        <SectionTitle>FILTERS</SectionTitle>
        <View style={styles.filterWrap}>
          {filters.map(f => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[styles.filterChip, active && styles.filterActive]}
                activeOpacity={0.7}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={styles.grid}>
        {trainees.map(t => (
          <Card key={t.id} style={styles.traineeCard}>
            <Gradient colors={t.gradient} style={styles.image}>
              <Text style={styles.flag}>{t.flag}</Text>
              <View style={styles.imageFooter}>
                <View style={styles.rowBetweenEnd}>
                  <View>
                    <Text style={styles.name}>{t.name}</Text>
                    <Text style={styles.sub}>
                      {t.nationality} · {t.age}
                    </Text>
                  </View>
                  <View style={styles.potential}>
                    <Sparkles size={12} color={colors.tealBright} />
                    <Text style={styles.potentialText}> {t.potential}</Text>
                  </View>
                </View>
              </View>
            </Gradient>
            <View style={styles.info}>
              <InfoRow k="Skill" v={t.skill} />
              <InfoRow k="Personality" v={t.personality} />
              <InfoRow k="Cost" v={fmt(t.cost)} c={colors.tealBright} />
            </View>
            <TouchableOpacity style={styles.recruitBtn} onPress={() => setConfirm(t.name)} activeOpacity={0.8}>
              <UserPlus size={14} color={colors.slate900} />
              <Text style={styles.recruitText}> Recruit</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Sparkles size={28} color={colors.tealBright} />
            <Text style={styles.modalTitle}>Welcome, {confirm}</Text>
            <Text style={styles.modalBody}>Trainee added to your roster. Budget updated.</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => setConfirm(null)} activeOpacity={0.8}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

function InfoRow({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{k}</Text>
      <Text style={[styles.infoVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },

  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingHorizontal: 10, paddingVertical: 4 },
  filterActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  filterText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  filterTextActive: { color: colors.tealBright },

  grid: { gap: spacing.md },
  traineeCard: {},
  image: { height: 144, borderRadius: radius.lg, overflow: 'hidden' },
  flag: { position: 'absolute', right: 8, top: 6, fontSize: 18 },
  imageFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.45)' },
  name: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  sub: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  potential: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, backgroundColor: colors.black40, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  potentialText: { fontSize: 10, fontWeight: '700', color: colors.tealBright },

  info: { marginTop: spacing.sm, gap: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoKey: { fontSize: 11, color: colors.mutedForeground },
  infoVal: { fontSize: 11, fontWeight: '600', color: colors.foreground },

  recruitBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
  },
  recruitText: { fontSize: 12, fontWeight: '700', color: colors.slate900 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(20,23,34,0.98)',
    padding: spacing.xl,
  },
  modalTitle: { marginTop: spacing.sm, fontSize: 20, fontWeight: '900', color: colors.tealBright },
  modalBody: { marginTop: 4, fontSize: 12, color: colors.mutedForeground, textAlign: 'center' },
  continueBtn: { marginTop: spacing.lg, width: '100%', alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  continueText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
});
