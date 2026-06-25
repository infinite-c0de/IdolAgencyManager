import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarDays, Lock, Megaphone, Sparkles } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { fmtCount } from '../utils/format';
import {
  selectDynamicSchedule,
  selectPromotionOptions,
  selectSoloPromotionOptions,
  type DynamicScheduleItem,
} from '../features/simulation';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const eventColor = {
  teal: colors.tealBright,
  violet: colors.violetBright,
  hot: colors.hotSoft,
  mint: colors.mint,
};

function toDurationLabel(hours: number) {
  if (hours >= 24 && hours % 24 === 0) {
    const dayCount = Math.round(hours / 24);
    return `${dayCount} day${dayCount > 1 ? 's' : ''}`;
  }
  return `${hours}h`;
}

function parseWeekFromDate(dateLabel: string) {
  const match = dateLabel.match(/Week\s+(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function dateHasDay(dateLabel: string, dayLabel: string) {
  return dateLabel.toLowerCase().includes(dayLabel.toLowerCase());
}

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const {
    agency,
    cities,
    idols,
    groups,
    runPromotion,
    currentWeek,
    transactions,
    promotionSchedule,
    addPromotionScheduleEntry,
  } = useGame();
  const schedule = selectDynamicSchedule(idols, groups);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? '');
  const [selectedDayIndex, setSelectedDayIndex] = useState(2);
  const selectedGroup = useMemo(
    () => groups.find(group => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );
  const promotions = useMemo(
    () => selectPromotionOptions(cities, agency, idols, selectedGroup ? [selectedGroup] : []),
    [cities, agency, idols, selectedGroup],
  );
  const [error, setError] = useState<string | null>(null);
  const [promoMode, setPromoMode] = useState<'group' | 'solo'>('group');
  const [selectedIdolId, setSelectedIdolId] = useState(idols[0]?.id ?? '');
  const selectedIdol = useMemo(
    () => idols.find(i => i.id === selectedIdolId) ?? null,
    [idols, selectedIdolId],
  );
  const soloPromotions = useMemo(
    () => (selectedIdol ? selectSoloPromotionOptions(cities, agency, selectedIdol) : []),
    [cities, agency, selectedIdol],
  );
  const [confirmPromotion, setConfirmPromotion] = useState<{ id: string; name: string; cost: number } | null>(null);
  const [promotionResult, setPromotionResult] = useState<{
    name: string;
    fans: number;
    revenue: number;
    net: number;
    reputation: number;
    groupName: string;
    factor: number;
  } | null>(null);

  useEffect(() => {
    if (!selectedGroupId && groups[0]) {
      setSelectedGroupId(groups[0].id);
      return;
    }
    if (selectedGroupId && !groups.some(group => group.id === selectedGroupId)) {
      setSelectedGroupId(groups[0]?.id ?? '');
    }
  }, [groups, selectedGroupId]);

  const effectiveSchedule: DynamicScheduleItem[] = useMemo(() => {
    const entries = promotionSchedule
      .filter(item => item.week === currentWeek)
      .map((item, index) => ({
        id: `promo-log-${item.id}`,
        num: schedule.length + index + 1,
        title: `${item.groupName} · ${item.promotionName}`,
        category: `Scheduled · Net ${fmt(item.net)}`,
        date: `Week ${item.week} · ${dayLabels[item.dayIndex]}`,
        dayIndex: item.dayIndex,
        progress: 100,
        accent: item.net >= 0 ? ('violet' as const) : ('hot' as const),
        badge: 'ready' as const,
      }));
    return [...schedule, ...entries];
  }, [promotionSchedule, currentWeek, schedule]);

  const getPromotionLockReason = (promotion: (typeof promotions)[number]) => {
    if (promotion.lockedReason) {
      return promotion.lockedReason;
    }
    if (!selectedGroup) {
      return 'Select a group to schedule this promotion.';
    }
    if (agency.energy < promotion.energyCost) {
      return `Not enough agency energy (${promotion.energyCost} needed). Advance a week to refresh.`;
    }
    const groupTag = `(${selectedGroup.name})`;
    const sameWeekPromotion = transactions.some(transaction => {
      if (transaction.type !== 'expense') return false;
      if (!transaction.label.includes('Promotion Spend:')) return false;
      if (!transaction.label.includes(promotion.name) || !transaction.label.includes(groupTag)) return false;
      const week = parseWeekFromDate(transaction.date);
      return week === currentWeek;
    });
    if (sameWeekPromotion) {
      return 'Cooldown: this promotion already ran this week for the selected group.';
    }

    const selectedDay = dayLabels[selectedDayIndex];
    const sameDayAnyPromotion = transactions.some(transaction => {
      if (transaction.type !== 'expense') return false;
      if (!transaction.label.includes('Promotion Spend:')) return false;
      if (!transaction.label.includes(groupTag)) return false;
      const week = parseWeekFromDate(transaction.date);
      return week === currentWeek && dateHasDay(transaction.date, selectedDay);
    });
    if (sameDayAnyPromotion) {
      return `Cooldown: ${selectedGroup.name} already has a promotion on ${selectedDay}.`;
    }

    const queuedSameDay = promotionSchedule.some(item =>
      item.week === currentWeek &&
      item.dayIndex === selectedDayIndex &&
      item.groupName === selectedGroup.name,
    );
    if (queuedSameDay) {
      return `Cooldown: ${selectedGroup.name} already booked on ${selectedDay}.`;
    }
    return undefined;
  };

  const handleRunPromotion = (promotionId: string) => {
    const isSolo = promoMode === 'solo';
    const selectedPromotion = isSolo
      ? soloPromotions.find(item => item.id === promotionId)
      : promotions.find(item => item.id === promotionId);
    const selectedLockReason = selectedPromotion ? getPromotionLockReason(selectedPromotion) : undefined;
    if (selectedLockReason) {
      setError(selectedLockReason);
      return;
    }
    if (!isSolo && !selectedGroup) {
      setError('Select a group before scheduling a promotion.');
      return;
    }
    if (isSolo && !selectedIdol) {
      setError('Select an idol before scheduling a solo promotion.');
      return;
    }
    setConfirmPromotion({
      id: promotionId,
      name: selectedPromotion?.name ?? '',
      cost: selectedPromotion?.cost ?? 0,
    });
  };

  const executePromotion = (promotionId: string) => {
    setConfirmPromotion(null);
    const isSolo = promoMode === 'solo';
    if (!isSolo && !selectedGroup) return;
    if (isSolo && !selectedIdol) return;

    const result = runPromotion(
      isSolo
        ? { promotionId, idolId: selectedIdol!.id, week: currentWeek, dayIndex: selectedDayIndex }
        : { promotionId, groupId: selectedGroup!.id, week: currentWeek, dayIndex: selectedDayIndex },
    );
    if (!result.ok) {
      if (result.reason === 'INSUFFICIENT_FUNDS') {
        setError('Not enough funds for this promotion.');
      } else if (result.reason === 'INSUFFICIENT_ENERGY') {
        setError('Not enough agency energy. Advance a week to refresh.');
      } else if (result.reason === 'PROMOTION_LOCKED') {
        setError('This promotion is still locked. Debut requirements are not met yet.');
      } else if (result.reason === 'GROUP_NOT_FOUND') {
        setError('No active target group was found for this promotion.');
      } else {
        setError('Could not run this promotion right now. Please try again.');
      }
      return;
    }

    setPromotionResult({
      name: result.promotionName,
      fans: result.fansGained,
      revenue: result.revenueGained,
      net: result.netDelta,
      reputation: result.reputationGained,
      groupName: result.groupName,
      factor: result.performanceFactor,
    });
    addPromotionScheduleEntry({
      id: `${result.groupId}-${promotionId}-${Date.now()}`,
      week: currentWeek,
      dayIndex: selectedDayIndex,
      groupName: result.groupName,
      promotionName: result.promotionName,
      net: result.netDelta,
      fans: result.fansGained,
    });
  };

  const releaseAction = (
    <TouchableOpacity style={styles.releaseBtn} onPress={() => navigation.navigate('Release')} activeOpacity={0.8}>
      <Sparkles size={14} color={colors.slate900} />
      <Text style={styles.releaseText}>New Release</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell title="Schedule" subtitle="Coordinate performances and promotions" action={releaseAction}>
      <Card>
        <SectionTitle>THIS WEEK</SectionTitle>
        <View style={styles.weekRow}>
          {days.map((d, i) => {
            const events = effectiveSchedule.filter(item => item.dayIndex === i); const visible = events.slice(0, 2);
            const overflow = events.length - visible.length;
            const first = events[0];
            const isSelected = selectedDayIndex === i;
            const cellStyle =
              first?.accent === 'teal'
                ? styles.cellTeal
                : first?.accent === 'violet'
                  ? styles.cellViolet
                  : styles.cellIdle;
            return (
              <View key={d} style={styles.dayCol}>
                <Text style={[styles.dayHead, isSelected && styles.dayHeadSelected]}>{d}</Text>
                <TouchableOpacity
                  style={[styles.dayCell, cellStyle, isSelected && styles.cellSelected]}
                  onPress={() => setSelectedDayIndex(i)}
                  activeOpacity={0.75}>
                  {visible.map(ev => (
                    <Text key={ev.id} style={[styles.eventText, { color: eventColor[ev.accent] }]} numberOfLines={1}>
                      {ev.title}
                    </Text>
                  ))}
                  {overflow > 0 && (
                    <Text style={styles.overflowText}>+{overflow} more</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        <Text style={styles.calendarHint}>
          Tap a day to select it for your promotion ·{' '}
          <Text style={styles.calendarHintAccent}>{dayLabels[selectedDayIndex]} selected</Text>
        </Text>
      </Card>

      <Card>
        <View style={styles.list}>
          {effectiveSchedule.map(s => (
            <View key={s.id} style={styles.activity}>
              <CalendarDays size={20} color={colors.tealBright} />
              <View style={styles.flex1}>
                <View style={styles.rowBetween}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.tinyMuted}>{s.date}</Text>
                </View>
                <Text style={styles.tinyMuted}>{s.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card glow="violet">
        <SectionTitle>PROMOTION CATALOG</SectionTitle>

        {/* Group / Solo toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeTab, promoMode === 'group' && styles.modeTabActive]}
            onPress={() => setPromoMode('group')}
            activeOpacity={0.8}>
            <Text style={[styles.modeTabText, promoMode === 'group' && styles.modeTabTextActive]}>
              GROUP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, promoMode === 'solo' && styles.modeTabActive]}
            onPress={() => setPromoMode('solo')}
            activeOpacity={0.8}>
            <Text style={[styles.modeTabText, promoMode === 'solo' && styles.modeTabTextActive]}>
              SOLO ARTIST
            </Text>
          </TouchableOpacity>
        </View>

        {promoMode === 'group' ? (
          <>
            <Text style={styles.tinyMuted}>Step 1: pick group</Text>
            <View style={styles.selectRow}>
              {groups.map(group => {
                const active = selectedGroupId === group.id;
                const logoPreset = group.logo?.kind === 'preset' ? group.logo.preset : 1;
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={[styles.avatarChip, active ? styles.avatarChipActive : styles.avatarChipIdle]}
                    onPress={() => setSelectedGroupId(group.id)}
                    activeOpacity={0.8}>
                    <View style={styles.groupLogoWrap}>
                      <AgencyLogoMark preset={logoPreset} size={46} />
                    </View>
                    <Text style={[styles.avatarChipName, active && styles.avatarChipNameActive]}>{group.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {groups.length === 0 && <Text style={styles.tinyMuted}>Create a group first to unlock group promotions.</Text>}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.tinyMuted}>Step 1: pick idol</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectIdolRow}>
              {idols.map(idol => {
                const active = selectedIdolId === idol.id;
                const isInjured = idol.status === 'Injured';
                return (
                  <TouchableOpacity
                    key={idol.id}
                    style={[styles.avatarChip, active ? styles.avatarChipActive : styles.avatarChipIdle, isInjured && styles.avatarChipDisabled]}
                    onPress={() => !isInjured && setSelectedIdolId(idol.id)}
                    activeOpacity={0.8}
                    disabled={isInjured}>
                    <View style={styles.idolAvatarWrap}>
                      {idol.image ? (
                        <Image source={idol.image} resizeMode="cover" style={styles.idolAvatarImg} />
                      ) : (
                        <Text style={styles.idolAvatarFallback}>{idol.stageName.slice(0, 1)}</Text>
                      )}
                    </View>
                    <Text style={[styles.avatarChipName, active && styles.avatarChipNameActive]} numberOfLines={1}>
                      {idol.stageName}{isInjured ? ' 🤕' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {idols.length === 0 && <Text style={styles.tinyMuted}>Recruit idols first.</Text>}
            </ScrollView>
          </>
        )}

        <Text style={styles.tinyMuted}>Step 2: pick day</Text>
        <View style={styles.selectRow}>
          {days.map((day, index) => {
            const active = selectedDayIndex === index;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.selectChip, active ? styles.selectChipActive : styles.selectChipIdle]}
                onPress={() => setSelectedDayIndex(index)}
                activeOpacity={0.8}>
                <Text style={[styles.selectChipText, active && styles.selectChipTextActive]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.tinyMuted}>Step 3: run promotion</Text>
        <View style={styles.promoGrid}>
          {(promoMode === 'group' ? promotions : soloPromotions).map(p => {
            const lockReason = promoMode === 'group' ? getPromotionLockReason(p) : p.lockedReason;
            return (
              <View key={p.id} style={styles.promo}>
                <View style={styles.rowBetween}>
                  <Text style={styles.promoName}>{p.name}</Text>
                  {lockReason ? <Lock size={16} color={colors.mutedForeground} /> : <Megaphone size={16} color={colors.violetBright} />}
                </View>
                <Text style={styles.tinyMuted}>
                  Target · {promoMode === 'solo' ? (selectedIdol?.stageName ?? '—') : (selectedGroup?.name ?? p.target)}
                </Text>
                <View style={styles.statGrid}>
                  <Stat k="Cost" v={fmt(p.cost)} />
                  <Stat k="Energy" v={`-${p.energyCost}`} c={colors.hotSoft} />
                  <Stat k="Fans" v={`+${fmtCount(p.fansGain)}`} c={colors.mint} />
                  <Stat k="Reputation" v={`+${p.reputationGain}`} c={colors.tealBright} />
                  <Stat k="Fatigue" v={`+${p.fatigueGain}`} c={colors.hotSoft} />
                  <Stat k="Duration" v={toDurationLabel(p.durationHours)} />
                  <Stat k="Est. Revenue" v={fmt(p.expectedRevenue)} c={colors.violetBright} />
                  <Stat k="Efficiency" v={`${p.efficiencyScore}`} />
                </View>
                {lockReason ? <Text style={styles.lockText}>{lockReason}</Text> : null}
                <TouchableOpacity
                  style={[styles.scheduleBtn, lockReason && styles.scheduleBtnDisabled]}
                  onPress={() => !lockReason && handleRunPromotion(p.id)}
                  disabled={Boolean(lockReason)}
                  activeOpacity={0.8}>
                  <Text style={styles.scheduleBtnText}>
                    {lockReason ? 'Locked' : `Run on ${dayLabels[selectedDayIndex]} · ${fmt(p.cost)}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {promoMode === 'group' && groups.length === 0 && (
            <Text style={[styles.tinyMuted, { marginTop: spacing.sm }]}>
              No groups yet — form a group to unlock group promotions.
            </Text>
          )}
          {promoMode === 'solo' && idols.length === 0 && (
            <Text style={[styles.tinyMuted, { marginTop: spacing.sm }]}>
              No idols signed yet.
            </Text>
          )}
        </View>
      </Card>

      <Modal visible={error !== null} transparent animationType="fade" onRequestClose={() => setError(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Promotion Failed</Text>
            <Text style={styles.tinyMuted}>{error}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setError(null)} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmPromotion !== null} transparent animationType="fade" onRequestClose={() => setConfirmPromotion(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Promotion</Text>
            <Text style={styles.promoResultTitle}>{confirmPromotion?.name}</Text>
            <Text style={styles.tinyMuted}>
              {promoMode === 'solo'
                ? `${selectedIdol?.stageName ?? '—'} · ${dayLabels[selectedDayIndex]}`
                : `${selectedGroup?.name ?? '—'} · ${dayLabels[selectedDayIndex]}`}
            </Text>
            <Text style={styles.confirmCost}>Cost: {fmt(confirmPromotion?.cost ?? 0)}</Text>
            <Text style={styles.tinyMuted}>This will immediately deduct funds and run the promotion.</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setConfirmPromotion(null)} activeOpacity={0.8}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmRunBtn} onPress={() => confirmPromotion && executePromotion(confirmPromotion.id)} activeOpacity={0.8}>
                <Text style={styles.modalBtnText}>Run Promotion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={promotionResult !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPromotionResult(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Promotion Complete</Text>
            <Text style={styles.promoResultTitle}>{promotionResult?.groupName} · {promotionResult?.name}</Text>
            <View style={styles.modalStats}>
              <Stat k="Fans" v={`+${fmtCount(promotionResult?.fans ?? 0)}`} c={colors.mint} />
              <Stat k="Revenue" v={fmt(promotionResult?.revenue ?? 0)} c={colors.tealBright} />
              <Stat k="Net" v={fmt(promotionResult?.net ?? 0)} c={colors.violetBright} />
              <Stat k="Reputation" v={`+${promotionResult?.reputation ?? 0}`} c={colors.mint} />
              <Stat k="Performance" v={`${Math.round((promotionResult?.factor ?? 0) * 100)}%`} c={colors.tealBright} />
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setPromotionResult(null)} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.tinyMuted}>{k}</Text>
      <Text style={[styles.statVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  releaseText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  weekRow: { flexDirection: 'row', gap: 4 },
  dayCol: { flex: 1, alignItems: 'center', gap: 4 },
  dayHead: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', color: colors.mutedForeground },
  dayHeadSelected: { color: colors.tealBright },
  dayCell: { height: 80, width: '100%', borderRadius: radius.md, borderWidth: 1, padding: 4 },
  cellIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  cellTeal: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  cellViolet: { borderColor: 'rgba(217,70,239,0.6)', backgroundColor: 'rgba(217,70,239,0.1)' },
  cellSelected: { borderColor: colors.tealBright, borderWidth: 2 },
  eventText: { fontSize: 9, fontWeight: '700' },
  overflowText: { fontSize: 8, fontWeight: '600', color: colors.mutedForeground, marginTop: 2 },
  calendarHint: { marginTop: spacing.sm, fontSize: 10, color: colors.mutedForeground },
  calendarHintAccent: { color: colors.tealBright, fontWeight: '700' },

  list: { gap: spacing.sm },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  activityTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground, flexShrink: 1 },

  promoGrid: { gap: spacing.sm, marginTop: 6 },
  promo: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md },
  promoName: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: spacing.sm },
  selectIdolRow: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: spacing.sm },
  selectChip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  selectChipIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  selectChipActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  selectChipDisabled: { opacity: 0.4 },
  selectChipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  selectChipTextActive: { color: colors.tealBright },
  selectChipTextDisabled: { color: colors.mutedForeground },

  // Avatar chips ─ group logo or idol photo
  avatarChip: {
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 52,
  },
  avatarChipIdle:       { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  avatarChipActive:     { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  avatarChipDisabled:   { opacity: 0.4 },
  avatarChipName:       { fontSize: 10, fontWeight: '700', color: colors.mutedForeground },
  avatarChipNameActive: { color: colors.tealBright },

  groupLogoWrap: {
    width: 46, height: 46,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  idolAvatarWrap: {
    width: 42, height: 42, borderRadius: 18,
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  idolAvatarImg:      { width: '100%', height: '100%' },
  idolAvatarFallback: { fontSize: 14, fontWeight: '800', color: colors.mutedForeground },
  modeRow: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.whiteA05,
  },
  modeTabActive: {
    backgroundColor: colors.tealActiveBg,
    borderColor: colors.tealActiveBorder,
  },
  modeTabText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.mutedForeground },
  modeTabTextActive: { color: colors.tealBright },
  lockText: { marginTop: spacing.sm, fontSize: 10, color: colors.mutedForeground },
  statGrid: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', flexDirection: 'row', justifyContent: 'space-between', paddingRight: spacing.md, marginBottom: 2 },
  statVal: { fontSize: 10, fontWeight: '600', color: colors.foreground },
  scheduleBtn: { marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.teal, paddingVertical: 6, alignItems: 'center' },
  scheduleBtnDisabled: { backgroundColor: colors.whiteA10 },
  scheduleBtnText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(14,18,30,0.98)', padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.tealBright },
  promoResultTitle: { fontSize: 12, color: colors.foreground, fontWeight: '600' },
  modalStats: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  modalBtn: { marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.teal, paddingVertical: spacing.sm, alignItems: 'center' },
  modalBtnText: { fontSize: 12, fontWeight: '800', color: colors.slate900 },
  confirmRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  confirmCancelBtn: { flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmCancelText: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  confirmRunBtn: { flex: 1, borderRadius: radius.md, backgroundColor: colors.teal, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmCost: { fontSize: 16, fontWeight: '900', color: colors.tealBright, marginTop: spacing.xs },
});
