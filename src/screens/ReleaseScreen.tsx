import { ChevronRight, Music2, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const stepNames = ['Group', 'Concept', 'Quality', 'Language', 'Budget'];
const qualityNames = ['Demo', 'Standard', 'Premium', 'Cinematic'];
const BUDGET_MIN = 20_000_000;
const BUDGET_MAX = 500_000_000;
const BUDGET_STEP = 10_000_000;

export function ReleaseScreen() {
  const { groups, conceptOptions, languageOptions } = useGame();
  const [step, setStep] = useState(1);
  const [group, setGroup] = useState(groups[0]?.id ?? '');
  const [concept, setConcept] = useState(conceptOptions[0]);
  const [quality, setQuality] = useState(2);
  const [lang, setLang] = useState(languageOptions[0]);
  const [budget, setBudget] = useState(120_000_000);
  const [done, setDone] = useState(false);
  const canContinue = step !== 1 || Boolean(group);

  useEffect(() => {
    if (!group && groups[0]) {
      setGroup(groups[0].id);
    }
  }, [group, groups]);

  return (
    <AppShell title="New Release" subtitle="Plan a debut single">
      <Card glow="teal">
        <View style={styles.stepHead}>
          <Text style={styles.tinyMuted}>Step {step} of 5</Text>
          <Text style={styles.stepName}>{stepNames[step - 1]}</Text>
        </View>
        <View style={styles.progressTrack}>
          <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={[styles.progressFill, { width: `${step * 20}%` }]} />
        </View>

        <View style={styles.stepBody}>
          {step === 1 && (
            <View style={styles.col}>
              {groups.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>No group ready</Text>
                  <Text style={styles.tinyMuted}>Create a group from recruited idols before planning a release.</Text>
                </View>
              )}
              {groups.map(g => {
                const active = group === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGroup(g.id)}
                    style={[styles.optionCard, active ? styles.optActive : styles.optIdle]}
                    activeOpacity={0.85}>
                    <Text style={styles.optTitle}>{g.name}</Text>
                    <Text style={styles.tinyMuted}>
                      {g.memberIds.length} members · {g.concept}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View style={styles.chipWrap}>
              {conceptOptions.map(c => {
                const active = concept === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setConcept(c)}
                    style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
                    activeOpacity={0.8}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Production Quality</Text>
                <Text style={styles.valueText}>{qualityNames[quality]}</Text>
              </View>
              <View style={styles.segment}>
                {qualityNames.map((q, idx) => {
                  const active = quality === idx;
                  return (
                    <TouchableOpacity
                      key={q}
                      onPress={() => setQuality(idx)}
                      style={[styles.segItem, active && styles.segActive]}
                      activeOpacity={0.8}>
                      <Text style={[styles.segText, active && styles.segTextActive]}>{q}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hint}>Higher quality boosts chart potential but increases production cost.</Text>
            </View>
          )}

          {step === 4 && (
            <View style={styles.chipWrap}>
              {languageOptions.map(l => {
                const active = lang === l;
                return (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLang(l)}
                    style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
                    activeOpacity={0.8}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 5 && (
            <View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Promotion budget</Text>
                <Text style={styles.valueText}>{fmt(budget)}</Text>
              </View>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setBudget(b => Math.max(BUDGET_MIN, b - BUDGET_STEP))}
                  activeOpacity={0.8}>
                  <Text style={styles.stepperSign}>−</Text>
                </TouchableOpacity>
                <View style={styles.budgetTrack}>
                  <Gradient
                    colors={[colors.teal, colors.violet]}
                    direction="to-r"
                    style={[
                      styles.budgetFill,
                      { width: `${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%` },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setBudget(b => Math.min(BUDGET_MAX, b + BUDGET_STEP))}
                  activeOpacity={0.8}>
                  <Text style={styles.stepperSign}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.estRow}>
          <Est k="Cost" v={fmt(80_000_000 + quality * 40_000_000)} />
          <Est k="Fan +" v="+185K" c={colors.mint} />
          <Est k="Revenue" v={fmt(420_000_000)} c={colors.tealBright} />
          <Est k="Risk" v={quality >= 3 ? 'High' : 'Medium'} c={colors.violetBright} />
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => Math.max(1, s - 1))} activeOpacity={0.8}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          {step < 5 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
              onPress={() => {
                if (canContinue) {
                  setStep(s => s + 1);
                }
              }}
              activeOpacity={0.8}>
              <Text style={styles.nextText}>Next </Text>
              <ChevronRight size={14} color={colors.slate900} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setDone(true)} activeOpacity={0.85} style={styles.flex1}>
              <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={styles.releaseBtn}>
                <Sparkles size={14} color={colors.slate900} />
                <Text style={styles.nextText}> Release</Text>
              </Gradient>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      <Modal visible={done} transparent animationType="fade" onRequestClose={() => setDone(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Music2 size={20} color={colors.tealBright} />
              <Text style={styles.modalTitle}> Single Released</Text>
            </View>
            <Text style={styles.tinyMuted}>
              {groups.find(g => g.id === group)?.name} · {concept} · {lang}
            </Text>
            <View style={styles.resultGrid}>
              <Result k="1st Week Sales" v="284,500" />
              <Result k="New Fans" v="+212K" c={colors.mint} />
              <Result k="Revenue" v={fmt(486_000_000)} c={colors.tealBright} />
              <Result k="Chart Position" v="#3" c={colors.violetBright} />
              <Result k="Reputation" v="+6" c={colors.mint} />
              <Result k="Critic Score" v="8.4 / 10" />
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={() => setDone(false)} activeOpacity={0.8}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

function Est({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.est}>
      <Text style={styles.tinyMuted}>{k}</Text>
      <Text style={[styles.estVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

function Result({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.result}>
      <Text style={styles.resultK}>{k}</Text>
      <Text style={[styles.resultV, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 11, color: colors.mutedForeground },
  emptyBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
    gap: 4,
  },
  emptyTitle: { color: colors.foreground, fontSize: 14, fontWeight: '800' },

  stepHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  stepName: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: colors.tealBright },
  progressTrack: { height: 4, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  progressFill: { height: '100%' },

  stepBody: { marginTop: spacing.lg, minHeight: 160 },
  col: { gap: spacing.sm },
  optionCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  optIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  optActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  optTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  chipIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  chipActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  chipTextActive: { color: colors.tealBright },

  label: { fontSize: 11, color: colors.foreground },
  valueText: { fontSize: 11, fontWeight: '700', color: colors.tealBright },
  segment: { marginTop: spacing.md, flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: colors.whiteA05 },
  segActive: { backgroundColor: 'rgba(34,211,238,0.12)' },
  segText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  segTextActive: { color: colors.tealBright },
  hint: { marginTop: spacing.sm, fontSize: 11, color: colors.mutedForeground },

  stepperRow: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperBtn: { width: 40, height: 40, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 20, color: colors.tealBright, fontWeight: '700' },
  budgetTrack: { flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  budgetFill: { height: '100%' },

  estRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  est: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  estVal: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  navRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  backBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingVertical: spacing.sm },
  backText: { fontSize: 14, color: colors.foreground },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
  releaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, paddingVertical: spacing.sm },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 440, borderRadius: radius['2xl'], borderWidth: 1, borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(20,23,34,0.98)', padding: spacing.xl },
  modalHead: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  resultGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  result: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md },
  resultK: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  resultV: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  continueBtn: { marginTop: spacing.lg, alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  continueText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
});
