import { FastForward } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { SESSION_COST } from '../features/simulation';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, statColors } from '../theme';
import { fmt } from '../utils/format';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const TRAINING_ACCENT: Record<string, string> = {
  vocal:    statColors.vocal,
  dance:    statColors.dance,
  rap:      statColors.rap,
  visual:   statColors.visual,
  acting:   statColors.acting,
  language: '#93C5FD',
  stamina:  statColors.stamina,
  rest:     '#6B7280',
};

function getTrainingAccent(id: string, name: string): string {
  const lower = (id + name).toLowerCase();
  if (lower.includes('vocal')) return TRAINING_ACCENT.vocal;
  if (lower.includes('dance')) return TRAINING_ACCENT.dance;
  if (lower.includes('rap')) return TRAINING_ACCENT.rap;
  if (lower.includes('visual')) return TRAINING_ACCENT.visual;
  if (lower.includes('acting')) return TRAINING_ACCENT.acting;
  if (lower.includes('lang')) return TRAINING_ACCENT.language;
  if (lower.includes('stamina') || lower.includes('conditioning')) return TRAINING_ACCENT.stamina;
  if (lower.includes('rest')) return TRAINING_ACCENT.rest;
  return colors.tealBright;
}

export function TrainingScreen() {
  const { idols, groups, trainingTypes, trainingPlans, setTrainingPlan, advanceWeek, agency } = useGame();
  const [selectedType, setSelectedType] = useState(trainingTypes[0]?.id ?? '');
  const [selectedTarget, setSelectedTarget] = useState<string>('SOLO_DEFAULT');
  const [toast, setToast] = useState<string | null>(null);

  const targetOptions = useMemo(
    () => [
      { id: 'SOLO_DEFAULT', label: 'Solo / Default' },
      ...groups.map(group => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  // Auto-select first group if there are no solo idols and a group exists
  useEffect(() => {
    const hasSoloIdols = idols.some(i => !i.group);
    if (!hasSoloIdols && groups.length > 0 && selectedTarget === 'SOLO_DEFAULT') {
      setSelectedTarget(groups[0].id);
    }
  }, [idols, groups, selectedTarget]);

  // Keep selectedTarget valid if the referenced group was deleted
  useEffect(() => {
    if (!targetOptions.some(option => option.id === selectedTarget)) {
      setSelectedTarget('SOLO_DEFAULT');
    }
  }, [selectedTarget, targetOptions]);

  useEffect(() => {
    if (!selectedType && trainingTypes[0]) setSelectedType(trainingTypes[0].id);
  }, [selectedType, trainingTypes]);

  // Idols that follow the currently selected plan
  const targetMembers = useMemo(() => {
    if (selectedTarget === 'SOLO_DEFAULT') return idols.filter(i => !i.group);
    const group = groups.find(g => g.id === selectedTarget);
    if (!group) return [];
    return idols.filter(i => group.memberIds.includes(i.id));
  }, [selectedTarget, idols, groups]);

  const grid = trainingPlans[selectedTarget] ?? {};
  const canPlan = trainingTypes.length > 0;

  const toggle = (key: string) =>
    setTrainingPlan(selectedTarget, {
      ...grid,
      [key]: grid[key] === selectedType ? '' : selectedType,
    });

  const simulate = () => {
    Alert.alert(
      'Advance to Next Week?',
      weeklyCost > 0
        ? `Training costs ${fmt(weeklyCost)} will be deducted. This cannot be undone.`
        : 'No training sessions are planned this week. Advance anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Advance',
          style: 'default',
          onPress: () => {
            advanceWeek();
            setToast(idols.length > 0 ? 'Week advanced — training applied.' : 'Week advanced.');
            setTimeout(() => setToast(null), 2500);
          },
        },
      ],
    );
  };

  // Compute total weekly training cost across all plans × idols
  const weeklyCost = useMemo(() => {
    let total = 0;
    const groupIdByName = new Map(groups.map(g => [g.name, g.id]));
    for (const idol of idols) {
      const key = idol.group ? groupIdByName.get(idol.group) ?? idol.group : undefined;
      const plan = key ? trainingPlans[key] ?? trainingPlans[idol.group ?? ''] ?? trainingPlans.SOLO_DEFAULT ?? {} : trainingPlans.SOLO_DEFAULT ?? {};
      for (const typeId of Object.values(plan)) total += SESSION_COST[typeId] ?? 0;
    }
    return total;
  }, [trainingPlans, idols, groups]);
  const canAffordWeek = agency.money >= weeklyCost;
  const selectedTrainType = trainingTypes.find(t => t.id === selectedType);

  return (
    <AppShell title="Training" subtitle="Plan the week, then advance">

      {/* ── Target selector + member preview ── */}
      <Card>
        <View style={styles.rowLabel}>
          <Text style={styles.rowLabelText}>PLAN FOR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {targetOptions.map(option => {
              const active = selectedTarget === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setSelectedTarget(option.id)}
                  style={[styles.targetChip, active && styles.chipActive]}
                  activeOpacity={0.8}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Members following this plan */}
        {targetMembers.length > 0 ? (
          <View style={styles.memberPreviewRow}>
            <Text style={styles.memberPreviewLabel}>
              {targetMembers.length} idol{targetMembers.length !== 1 ? 's' : ''} follow this schedule
            </Text>
            <View style={styles.memberChipRow}>
              {targetMembers.map(i => (
                <View key={i.id} style={styles.memberChip}>
                  <View style={styles.memberAvatar}>
                    {i.image ? (
                      <Image source={i.image} resizeMode="cover" style={styles.memberAvatarImg} />
                    ) : (
                      <Text style={styles.memberAvatarFallback}>{i.stageName.slice(0, 1)}</Text>
                    )}
                  </View>
                  <Text style={styles.memberChipName} numberOfLines={1}>{i.stageName}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.memberPreviewEmpty}>
            {selectedTarget === 'SOLO_DEFAULT'
              ? 'No solo idols yet — assign idols to groups or recruit more.'
              : 'No members in this group yet.'}
          </Text>
        )}
      </Card>

      {/* ── Training type — color-coded compact tiles ── */}
      <Card>
        <View style={styles.typeGrid}>
          {trainingTypes.map(t => {
            const active = selectedType === t.id;
            const accent = getTrainingAccent(t.id, t.name);
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedType(t.id)}
                style={[
                  styles.typeTile,
                  active
                    ? { borderColor: accent + '88', backgroundColor: accent + '14' }
                    : { borderColor: colors.border, backgroundColor: colors.whiteA05 },
                ]}
                activeOpacity={0.8}>
                <View style={[styles.typeAccentDot, { backgroundColor: accent }]} />
                <Text style={[styles.typeName, active && { color: accent }]} numberOfLines={1}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedTrainType && (
          <View style={styles.selectedTypeDetails}>
            <Text style={styles.selectedTypeEffect}>{selectedTrainType.effect}</Text>
            <Text style={styles.selectedTypeCost}>{selectedTrainType.cost}</Text>
          </View>
        )}
      </Card>

      {/* ── Week schedule grid ── */}
      <Card glow="teal">
        <View style={styles.weekHeader}>
          <Text style={styles.weekHeaderLabel}>WEEK PLAN</Text>
          {selectedTrainType && (
            <View style={[styles.activeTypeBadge, { borderColor: getTrainingAccent(selectedType, selectedTrainType.name) + '66' }]}>
              <View style={[styles.activeTypeDot, { backgroundColor: getTrainingAccent(selectedType, selectedTrainType.name) }]} />
              <Text style={[styles.activeTypeName, { color: getTrainingAccent(selectedType, selectedTrainType.name) }]}>
                {selectedTrainType.name}
              </Text>
            </View>
          )}
        </View>

        {/* Header row */}
        <View style={styles.gridRow}>
          <View style={styles.gridRowLabelCell} />
          {days.map(d => (
            <View key={d} style={styles.dayHeadCell}>
              <Text style={styles.dayHead}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Session rows */}
        {(['AM', 'PM', 'EVE'] as const).map((rowLabel, row) => (
          <View key={row} style={styles.gridRow}>
            <View style={styles.gridRowLabelCell}>
              <Text style={styles.gridRowLabel}>{rowLabel}</Text>
            </View>
            {days.map(d => {
              const key = `${row}-${d}`;
              const v = grid[key];
              const matchType = v ? trainingTypes.find(t => t.id === v) : null;
              const accent = matchType ? getTrainingAccent(matchType.id, matchType.name) : colors.tealBright;
              const label = matchType ? matchType.name.split(' ')[0] : '';
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => { if (canPlan) toggle(key); }}
                  style={[
                    styles.slot,
                    v
                      ? { borderColor: accent + '88', backgroundColor: accent + '18' }
                      : styles.slotIdle,
                  ]}
                  activeOpacity={0.7}>
                  {v ? (
                    <View style={[styles.slotDot, { backgroundColor: accent }]} />
                  ) : (
                    <Text style={styles.slotPlus}>+</Text>
                  )}
                  {label ? <Text style={[styles.slotText, { color: accent }]} numberOfLines={1}>{label}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Card>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* ── ADVANCE WEEK ── bottom CTA */}
      <View style={[styles.advanceWrap, !canAffordWeek && styles.advanceWrapWarn]}>
        {weeklyCost > 0 && (
          <Text style={[styles.costPreview, !canAffordWeek && styles.costPreviewWarn]}>
            Training cost this week: {fmt(weeklyCost)}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.nextWeekBtn, !canAffordWeek && styles.nextWeekBtnWarn]}
          onPress={simulate}
          activeOpacity={0.8}>
          <FastForward size={16} color={colors.slate900} />
          <Text style={styles.nextWeekText}>Advance to Next Week</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  advanceWrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  advanceWrapWarn: { borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.04)' },
  costPreview: { fontSize: 11, fontWeight: '700', color: colors.mint, letterSpacing: 0.5 },
  costPreviewWarn: { color: colors.hotSoft },
  nextWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    width: '100%',
  },
  nextWeekBtnWarn: { backgroundColor: '#F87171' },
  nextWeekText: { fontSize: 14, fontWeight: '800', color: colors.slate900 },

  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabelText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground, width: 48 },
  chipRow: { flexDirection: 'row', gap: 6 },
  targetChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  chipActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  chipTextActive: { color: colors.tealBright },

  memberPreviewRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  memberPreviewLabel: { fontSize: 10, fontWeight: '600', color: colors.mutedForeground },
  memberChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  memberAvatar: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarImg: { width: '100%', height: '100%' },
  memberAvatarFallback: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground },
  memberChipName: { fontSize: 10, fontWeight: '700', color: colors.tealBright },
  memberPreviewEmpty: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexGrow: 1,
    flexBasis: '44%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  typeAccentDot: { width: 7, height: 7, borderRadius: radius.full, flexShrink: 0 },
  typeName: { fontSize: 11, fontWeight: '600', color: colors.foreground, flexShrink: 1 },
  selectedTypeDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedTypeEffect: { fontSize: 11, color: colors.mint },
  selectedTypeCost: { fontSize: 11, color: colors.hotSoft },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekHeaderLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground },
  activeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  activeTypeDot: { width: 6, height: 6, borderRadius: radius.full },
  activeTypeName: { fontSize: 10, fontWeight: '700' },

  gridRow: { flexDirection: 'row', gap: 4, marginBottom: 4, alignItems: 'center' },
  gridRowLabelCell: { width: 28, alignItems: 'flex-end', paddingRight: 2 },
  gridRowLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8, color: colors.mutedForeground },
  dayHeadCell: { flex: 1, alignItems: 'center' },
  dayHead: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: colors.mutedForeground },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    padding: 1,
  },
  slotIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  slotDot: { width: 7, height: 7, borderRadius: radius.full },
  slotPlus: { fontSize: 14, color: colors.mutedForeground, lineHeight: 16 },
  slotText: { fontSize: 7, fontWeight: '700', lineHeight: 9 },

  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 96,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.tealActiveBorder,
    backgroundColor: 'rgba(18,21,32,0.98)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  toastText: { fontSize: 13, fontWeight: '600', color: colors.tealBright },
});
