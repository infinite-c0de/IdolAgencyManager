import { ChevronRight, Music2, Sparkles } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';import { AppShell, Card } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { projectRelease, RELEASE_QUALITY_COST } from '../features/groups';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt, fmtCount } from '../utils/format';

const STEP_NAMES = ['Group', 'Title', 'Concept', 'Quality', 'Budget'];
const QUALITY_LABELS: Record<number, string> = { 1: 'Demo', 2: 'Standard', 3: 'Premium', 4: 'Cinematic', 5: 'Legendary' };
const BUDGET_MIN = 10_000_000;
const BUDGET_MAX = 500_000_000;
const BUDGET_STEP = 10_000_000;

type ResultData = {
  groupName: string;
  title: string;
  concept: string;
  chartPosition: number;
  totalSales: number;
  fansGained: number;
  reputationGained: number;
  revenueGained: number;
  budgetSpent: number;
  isDebut: boolean;
};

export function ReleaseScreen() {
  const { groups, idols, agency, conceptOptions, languageOptions, releaseDebut } = useGame();
  const [step, setStep] = useState(1);
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState(conceptOptions[0]);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [lang, setLang] = useState(languageOptions[0]);
  const [budget, setBudget] = useState(60_000_000);
  const [budgetText, setBudgetText] = useState('60');
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId && groups[0]) setGroupId(groups[0].id);
  }, [groups, groupId]);

  const commitBudget = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n > 0) {
      const clamped = Math.min(BUDGET_MAX / 1_000_000, Math.max(BUDGET_MIN / 1_000_000, n));
      setBudget(clamped * 1_000_000);
      setBudgetText(String(clamped));
    } else {
      setBudgetText(String(budget / 1_000_000));
    }
  };

  const stepBudget = (delta: number) => {
    setBudget(prev => {
      const next = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, prev + delta));
      setBudgetText(String(Math.round(next / 1_000_000)));
      return next;
    });
  };

  const selectedGroup = groups.find(g => g.id === groupId);
  const members = useMemo(
    () => (selectedGroup ? idols.filter(i => selectedGroup.memberIds.includes(i.id)) : []),
    [selectedGroup, idols],
  );

  const projection = useMemo(() => {
    if (!selectedGroup || members.length < 2) return null;
    return projectRelease(selectedGroup, members, quality, budget);
  }, [selectedGroup, members, quality, budget]);

  const totalCost = RELEASE_QUALITY_COST[quality] + budget;
  const canAfford = agency.money >= totalCost;
  const canContinue =
    step === 1 ? Boolean(groupId) && members.length >= 2 :
    step === 2 ? title.trim().length > 0 :
    true;

  const handleRelease = () => {
    if (!selectedGroup) return;
    if (!canAfford) { setError(`Not enough funds. You need ${fmt(totalCost)} to release this single.`); return; }
    const res = releaseDebut({
      groupId,
      title: title.trim() || `${selectedGroup.name} Debut`,
      concept,
      quality,
      language: lang,
      budget,
    });
    if (!res.ok) {
      if (res.reason === 'INSUFFICIENT_FUNDS') setError('Not enough budget to release this single.');
      else if (res.reason === 'NOT_ENOUGH_MEMBERS') setError('The group needs at least 2 members to release.');
      else setError('Could not release. Please check the group and try again.');
      return;
    }
    setResult({
      groupName: selectedGroup.name,
      title: title.trim() || `${selectedGroup.name} Debut`,
      concept,
      chartPosition: res.projection.chartPosition,
      totalSales: res.projection.totalSales,
      fansGained: res.projection.fansGained,
      reputationGained: res.projection.reputationGained,
      revenueGained: res.projection.revenueGained,
      budgetSpent: totalCost,
      isDebut: selectedGroup.status === 'Pre-debut',
    });
  };

  return (
    <AppShell title="New Release" subtitle="Plan and publish a single">

      <Card glow="teal">
        {/* Step header */}
        <View style={styles.stepHead}>
          <Text style={styles.tinyMuted}>Step {step} of {STEP_NAMES.length}</Text>
          <Text style={styles.stepName}>{STEP_NAMES[step - 1]}</Text>
        </View>
        <View style={styles.progressTrack}>
          <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={[styles.progressFill, { width: `${(step / STEP_NAMES.length) * 100}%` }]} />
        </View>

        {/* Step bodies */}
        <View style={styles.stepBody}>

          {step === 1 && (
            <View style={styles.col}>
              {groups.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>No group available</Text>
                  <Text style={styles.tinyMuted}>Create a group from your recruited idols before planning a release.</Text>
                </View>
              )}
              {groups.map(g => {
                const mCount = idols.filter(i => g.memberIds.includes(i.id)).length;
                const active = groupId === g.id;
                const isDebut = g.status === 'Pre-debut';
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGroupId(g.id)}
                    style={[styles.optionCard, active ? styles.optActive : styles.optIdle]}
                    activeOpacity={0.85}>
                    <View style={styles.optRow}>
                      <Text style={styles.optTitle}>{g.name}</Text>
                      <View style={[styles.statusPill, isDebut ? styles.pillDebut : styles.pillActive]}>
                        <Text style={styles.pillText}>{g.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.tinyMuted}>{mCount} members · {g.concept}</Text>
                    {mCount < 2 && <Text style={styles.warnText}>⚠ Needs at least 2 members</Text>}
                    {(g.releases?.length ?? 0) > 0 && (
                      <Text style={styles.releaseCountText}>{g.releases!.length} previous release{g.releases!.length > 1 ? 's' : ''}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View style={styles.col}>
              <Text style={styles.label}>Song Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder={`e.g. ${selectedGroup?.name ?? 'Group'} Debut`}
                placeholderTextColor={colors.mutedForeground}
                maxLength={40}
              />
              <Text style={styles.tinyMuted}>{title.length}/40</Text>
              <Text style={styles.label} >Language</Text>
              <View style={styles.chipWrap}>
                {languageOptions.map(l => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLang(l)}
                    style={[styles.chip, lang === l ? styles.chipActive : styles.chipIdle]}
                    activeOpacity={0.8}>
                    <Text style={[styles.chipText, lang === l && styles.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.chipWrap}>
              {conceptOptions.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setConcept(c)}
                  style={[styles.chip, concept === c ? styles.chipActive : styles.chipIdle]}
                  activeOpacity={0.8}>
                  <Text style={[styles.chipText, concept === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 4 && (
            <View style={styles.col}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Production Quality</Text>
                <Text style={styles.valueText}>{QUALITY_LABELS[quality]}</Text>
              </View>
              <View style={styles.segment}>
                {([1, 2, 3, 4, 5] as const).map(q => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => setQuality(q)}
                    style={[styles.segItem, quality === q && styles.segActive]}
                    activeOpacity={0.8}>
                    <Text style={[styles.segText, quality === q && styles.segTextActive]}>{QUALITY_LABELS[q]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>Production cost: {fmt(RELEASE_QUALITY_COST[quality])}</Text>
              <Text style={styles.hint}>Higher quality boosts chart potential and fan growth.</Text>
            </View>
          )}

          {step === 5 && (
            <View style={styles.col}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Promotion Budget</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetText}
                  onChangeText={setBudgetText}
                  onEndEditing={() => commitBudget(budgetText)}
                  onBlur={() => commitBudget(budgetText)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={styles.budgetUnit}>M</Text>
              </View>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => stepBudget(-BUDGET_STEP)} activeOpacity={0.8}>
                  <Text style={styles.stepperSign}>−</Text>
                </TouchableOpacity>
                <View style={styles.budgetTrack}>
                  <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={[styles.budgetFill, { width: `${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%` }]} />
                </View>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => stepBudget(BUDGET_STEP)} activeOpacity={0.8}>
                  <Text style={styles.stepperSign}>＋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>More budget = wider reach and faster fan growth. Range: ₩10M – ₩500M</Text>
            </View>
          )}
        </View>

        {/* Live projection strip */}
        {projection && (
          <View style={styles.estRow}>
            <Est k="Total Cost" v={fmt(totalCost)} c={canAfford ? undefined : colors.hotSoft} />
            <Est k="Chart" v={`#${projection.chartPosition}`} c={colors.violetBright} />
            <Est k="Fans +" v={`+${fmtCount(projection.fansGained)}`} c={colors.mint} />
            <Est k="Revenue" v={fmt(projection.revenueGained)} c={colors.tealBright} />
          </View>
        )}
        {!canAfford && step === 5 && (
          <Text style={styles.fundWarn}>⚠ Insufficient funds — you need {fmt(totalCost - agency.money)} more</Text>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)} activeOpacity={0.8}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={styles.backBtn} />}

          {step < STEP_NAMES.length ? (
            <TouchableOpacity
              style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
              onPress={() => canContinue && setStep(s => s + 1)}
              activeOpacity={0.8}>
              <Text style={styles.nextText}>Next</Text>
              <ChevronRight size={14} color={colors.slate900} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.flex1, (!canAfford) && styles.nextBtnDisabled]}
              onPress={handleRelease}
              activeOpacity={0.85}
              disabled={!canAfford}>
              <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={styles.releaseBtn}>
                <Sparkles size={14} color={colors.slate900} />
                <Text style={styles.nextText}> Release</Text>
              </Gradient>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Error modal */}
      <Modal visible={error !== null} transparent animationType="fade" onRequestClose={() => setError(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cannot Release</Text>
            <Text style={styles.tinyMuted}>{error}</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => setError(null)} activeOpacity={0.8}>
              <Text style={styles.continueText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal visible={result !== null} transparent animationType="fade" onRequestClose={() => { setResult(null); setStep(1); setTitle(''); }}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <View style={styles.modalHead}>
                <Music2 size={20} color={colors.tealBright} />
                <Text style={styles.modalTitle}> {result?.isDebut ? 'Debut Released!' : 'Single Released!'}</Text>
              </View>
              <Text style={styles.tinyMuted}>{result?.groupName} · "{result?.title}" · {result?.concept}</Text>
              {result?.isDebut && (
                <View style={styles.debutBadge}>
                  <Sparkles size={12} color={colors.slate900} />
                  <Text style={styles.debutBadgeText}>GROUP NOW ACTIVE</Text>
                </View>
              )}
              <View style={styles.resultGrid}>
                <Result k="1st Week Sales" v={fmtCount(result?.totalSales ?? 0)} />
                <Result k="New Fans" v={`+${fmtCount(result?.fansGained ?? 0)}`} c={colors.mint} />
                <Result k="Release Revenue" v={fmt(result?.revenueGained ?? 0)} c={colors.tealBright} />
                <Result k="Chart Position" v={`#${result?.chartPosition ?? '—'}`} c={colors.violetBright} />
                <Result k="Reputation +" v={`+${result?.reputationGained ?? 0}`} c={colors.mint} />
                <Result k="Total Spent" v={fmt(result?.budgetSpent ?? 0)} />
              </View>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => { setResult(null); setStep(1); setTitle(''); }}
                activeOpacity={0.8}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  col: { gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 11, color: colors.mutedForeground },
  warnText: { fontSize: 10, color: colors.hotSoft, marginTop: 2 },
  releaseCountText: { fontSize: 10, color: colors.teal, marginTop: 2 },
  fundWarn: { fontSize: 11, color: colors.hotSoft, marginTop: spacing.sm, textAlign: 'center' },

  emptyBox: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md, gap: 4 },
  emptyTitle: { color: colors.foreground, fontSize: 14, fontWeight: '800' },

  stepHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  stepName: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: colors.tealBright },
  progressTrack: { height: 4, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  progressFill: { height: '100%' },

  stepBody: { marginTop: spacing.lg, minHeight: 160 },
  optionCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: 4 },
  optIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  optActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optTitle: { fontSize: 17, fontWeight: '800', color: colors.foreground },
  statusPill: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  pillDebut: { borderColor: 'rgba(167,139,250,0.5)', backgroundColor: 'rgba(167,139,250,0.1)' },
  pillActive: { borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.1)' },
  pillText: { fontSize: 9, fontWeight: '700', color: colors.foreground, letterSpacing: 0.5 },

  label: { fontSize: 11, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  valueText: { fontSize: 11, fontWeight: '700', color: colors.tealBright },
  titleInput: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.whiteA05, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  chipIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  chipActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  chipTextActive: { color: colors.tealBright },

  segment: { marginTop: spacing.sm, flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: colors.whiteA05 },
  segActive: { backgroundColor: colors.tealActiveBg },
  segText: { fontSize: 9, fontWeight: '600', color: colors.mutedForeground },
  segTextActive: { color: colors.tealBright },
  hint: { marginTop: 6, fontSize: 10, color: colors.mutedForeground },

  stepperRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperBtn: { width: 40, height: 40, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 20, color: colors.tealBright, fontWeight: '700' },
  budgetTrack: { flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  budgetFill: { height: '100%' },
  budgetInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.tealBright,
    minWidth: 54,
    textAlign: 'right',
  },
  budgetUnit: { fontSize: 12, color: colors.mutedForeground, fontWeight: '600' },

  estRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  est: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  estVal: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  navRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  backBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingVertical: spacing.sm },
  backText: { fontSize: 14, color: colors.foreground },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm, gap: 4 },
  nextBtnDisabled: { opacity: 0.45 },
  nextText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
  releaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, paddingVertical: spacing.sm },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', padding: spacing.lg },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center' },
  modalCard: { borderRadius: radius['2xl'], borderWidth: 1, borderColor: colors.tealActiveBorder, backgroundColor: 'rgba(14,18,30,0.98)', padding: spacing.xl },
  modalHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  debutBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: spacing.sm, borderRadius: radius.full, backgroundColor: colors.teal, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  debutBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: colors.slate900 },
  resultGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  result: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md },
  resultK: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  resultV: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  continueBtn: { marginTop: spacing.lg, alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  continueText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
});
