import { Activity, Heart, Sparkles, Zap } from 'lucide-react-native';
import React, { ComponentType, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type IconType = ComponentType<{ size?: number; color?: string }>;

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const TRAINING_ACCENT: Record<string, string> = {
  vocal: '#E879F9',
  dance: '#67E8F9',
  rap: '#FCD34D',
  visual: '#FB7185',
  acting: '#34D399',
  language: '#93C5FD',
  rest: '#6B7280',
};

function getTrainingAccent(id: string, name: string): string {
  const lower = (id + name).toLowerCase();
  if (lower.includes('vocal')) return TRAINING_ACCENT.vocal;
  if (lower.includes('dance')) return TRAINING_ACCENT.dance;
  if (lower.includes('rap')) return TRAINING_ACCENT.rap;
  if (lower.includes('visual')) return TRAINING_ACCENT.visual;
  if (lower.includes('acting')) return TRAINING_ACCENT.acting;
  if (lower.includes('lang')) return TRAINING_ACCENT.language;
  if (lower.includes('rest')) return TRAINING_ACCENT.rest;
  return colors.tealBright;
}

export function TrainingScreen() {
  const { idols, groups, trainingTypes, trainingPlans, setTrainingPlan, advanceWeek } = useGame();
  const [selectedIdol, setSelectedIdol] = useState(idols[0]?.id ?? '');
  const [selectedType, setSelectedType] = useState(trainingTypes[0]?.id ?? '');
  const [selectedTarget, setSelectedTarget] = useState<string>('SOLO_DEFAULT');
  const [toast, setToast] = useState<string | null>(null);

  const targetOptions = useMemo(
    () => [
      { id: 'SOLO_DEFAULT', label: 'Solo' },
      ...groups.map(group => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const grid = trainingPlans[selectedTarget] ?? {};
  const canPlan = idols.length > 0 && trainingTypes.length > 0;

  useEffect(() => {
    if (!selectedIdol && idols[0]) setSelectedIdol(idols[0].id);
  }, [idols, selectedIdol]);

  useEffect(() => {
    if (!selectedType && trainingTypes[0]) setSelectedType(trainingTypes[0].id);
  }, [selectedType, trainingTypes]);

  useEffect(() => {
    if (!targetOptions.some(option => option.id === selectedTarget)) {
      setSelectedTarget('SOLO_DEFAULT');
    }
  }, [selectedTarget, targetOptions]);

  const toggle = (key: string) =>
    setTrainingPlan(selectedTarget, {
      ...grid,
      [key]: grid[key] === selectedType ? '' : selectedType,
    });

  const simulate = () => {
    advanceWeek();
    setToast(idols.length > 0 ? 'Week advanced — training applied.' : 'Week advanced.');
    setTimeout(() => setToast(null), 2500);
  };

  const simulateAction = (
    <TouchableOpacity style={styles.nextWeekBtn} onPress={simulate} activeOpacity={0.8}>
      <Sparkles size={14} color={colors.slate900} />
      <Text style={styles.nextWeekText}>Next Week</Text>
    </TouchableOpacity>
  );

  const selectedTrainType = trainingTypes.find(t => t.id === selectedType);

  return (
    <AppShell title="Training" subtitle="Plan the week, then advance" action={simulateAction}>

      {/* ── Target + Idol strip — compact single row per section ── */}
      <Card>
        {/* Target selector */}
        <View style={styles.rowLabel}>
          <Text style={styles.rowLabelText}>TARGET</Text>
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

        {/* Idol selector */}
        {idols.length > 0 && (
          <View style={[styles.rowLabel, { marginTop: spacing.md }]}>
            <Text style={styles.rowLabelText}>IDOL</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.idolStrip}>
              {idols.map(i => {
                const active = selectedIdol === i.id;
                return (
                  <TouchableOpacity
                    key={i.id}
                    onPress={() => setSelectedIdol(i.id)}
                    style={[styles.idolPill, active && styles.chipActive]}
                    activeOpacity={0.8}>
                    <View style={[styles.idolThumb, active && styles.idolThumbActive]}>
                      {i.image ? (
                        <Image source={i.image} resizeMode="cover" style={styles.idolThumbImage} />
                      ) : (
                        <Text style={styles.idolThumbFallback}>{i.stageName.slice(0, 1)}</Text>
                      )}
                    </View>
                    <Text style={[styles.idolPillName, active && styles.chipTextActive]} numberOfLines={1}>
                      {i.stageName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
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
        <View style={styles.weekGrid}>
          {days.map(d => (
            <View key={d} style={styles.dayHeadCell}>
              <Text style={styles.dayHead}>{d}</Text>
            </View>
          ))}
          {[0, 1, 2].flatMap(row =>
            days.map(d => {
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
            }),
          )}
        </View>
      </Card>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  nextWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nextWeekText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabelText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground, width: 42 },
  chipRow: { flexDirection: 'row', gap: 6 },
  targetChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  chipActive: { borderColor: 'rgba(34,211,238,0.55)', backgroundColor: 'rgba(34,211,238,0.07)' },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  chipTextActive: { color: colors.tealBright },

  idolStrip: { flexDirection: 'row', gap: 6 },
  idolPill: {
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.xs,
    minWidth: 52,
  },
  idolThumb: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idolThumbActive: { borderColor: 'rgba(34,211,238,0.8)' },
  idolThumbImage: { width: '100%', height: '100%' },
  idolThumbFallback: { fontSize: 14, fontWeight: '700', color: colors.mutedForeground },
  idolPillName: { fontSize: 9, fontWeight: '600', color: colors.foreground, maxWidth: 52, textAlign: 'center' },

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
  selectedTypeCost: { fontSize: 11, color: '#FDA4AF' },

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

  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  dayHeadCell: { width: '12.7%', alignItems: 'center' },
  dayHead: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: colors.mutedForeground },
  slot: {
    width: '12.7%',
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
    borderColor: 'rgba(34,211,238,0.5)',
    backgroundColor: 'rgba(18,21,32,0.98)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  toastText: { fontSize: 13, fontWeight: '600', color: colors.tealBright },
});
