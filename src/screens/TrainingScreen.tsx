import { Activity, Heart, Sparkles, Zap } from 'lucide-react-native';
import React, { ComponentType, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Avatar, Card, SectionTitle } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type IconType = ComponentType<{ size?: number; color?: string }>;

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function TrainingScreen() {
  const { idols, trainingTypes } = useGame();
  const [selectedIdol, setSelectedIdol] = useState(idols[0].id);
  const [selectedType, setSelectedType] = useState(trainingTypes[0].id);
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const toggle = (key: string) =>
    setGrid(g => ({ ...g, [key]: g[key] === selectedType ? '' : selectedType }));

  const simulate = () => {
    setToast('Week simulated · +2 Vocal · +3 Dance · −18 Energy · +6 Morale');
    setTimeout(() => setToast(null), 3000);
  };

  const simulateAction = (
    <TouchableOpacity style={styles.simulateBtn} onPress={simulate} activeOpacity={0.8}>
      <Sparkles size={14} color={colors.slate900} />
      <Text style={styles.simulateText}>Simulate Week</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell title="Weekly Training" subtitle="Tap a slot to schedule a session" action={simulateAction}>
      <Card>
        <SectionTitle>SELECT IDOL</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.idolRow}>
          {idols.map(i => {
            const active = selectedIdol === i.id;
            return (
              <TouchableOpacity
                key={i.id}
                onPress={() => setSelectedIdol(i.id)}
                style={[styles.idolPick, active ? styles.pickActive : styles.pickIdle]}
                activeOpacity={0.8}>
                <Avatar name={i.stageName} gradient={i.gradient} image={i.image} size={44} ring={active} />
                <Text style={styles.idolPickName}>{i.stageName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card>

      <Card>
        <SectionTitle>TRAINING TYPE</SectionTitle>
        <View style={styles.typeGrid}>
          {trainingTypes.map(t => {
            const active = selectedType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedType(t.id)}
                style={[styles.typeBtn, active ? styles.pickActive : styles.pickIdle]}
                activeOpacity={0.8}>
                <Text style={styles.typeName}>{t.name}</Text>
                <View style={styles.typeMeta}>
                  <Text style={styles.effect}>{t.effect}</Text>
                  <Text style={styles.cost}>{t.cost}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card glow="teal">
        <SectionTitle>WEEK PLAN</SectionTitle>
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
              const label = v ? trainingTypes.find(t => t.id === v)?.name.split(' ')[0] : '';
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => toggle(key)}
                  style={[styles.slot, v ? styles.slotActive : styles.slotIdle]}
                  activeOpacity={0.7}>
                  <Text style={[styles.slotText, v && styles.slotTextActive]} numberOfLines={1}>
                    {label || '+'}
                  </Text>
                </TouchableOpacity>
              );
            }),
          )}
        </View>
        <View style={styles.vitalRow}>
          <Vital Icon={Heart} label="Health" v={84} />
          <Vital Icon={Activity} label="Morale" v={76} />
          <Vital Icon={Zap} label="Energy" v={78} />
        </View>
      </Card>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </AppShell>
  );
}

function Vital({ Icon, label, v }: { Icon: IconType; label: string; v: number }) {
  return (
    <View style={styles.vital}>
      <View style={styles.vitalHead}>
        <Icon size={12} color={colors.mutedForeground} />
        <Text style={styles.tinyMuted}> {label}</Text>
      </View>
      <View style={styles.vitalTrack}>
        <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={[styles.vitalFill, { width: `${v}%` }]} />
      </View>
      <Text style={styles.vitalValue}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  simulateText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  idolRow: { gap: spacing.sm },
  idolPick: { alignItems: 'center', gap: 4, borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm },
  pickIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  pickActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  idolPickName: { fontSize: 10, fontWeight: '600', color: colors.foreground },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  typeName: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  typeMeta: { marginTop: 4, flexDirection: 'row', gap: spacing.sm },
  effect: { fontSize: 10, color: colors.mint },
  cost: { fontSize: 10, color: '#FDA4AF' },

  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayHeadCell: { width: '12.7%', alignItems: 'center' },
  dayHead: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  slot: {
    width: '12.7%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  slotIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  slotActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.1)' },
  slotText: { fontSize: 9, fontWeight: '700', color: colors.mutedForeground },
  slotTextActive: { color: colors.tealBright },

  vitalRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  vital: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  vitalHead: { flexDirection: 'row', alignItems: 'center' },
  vitalTrack: { marginTop: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  vitalFill: { height: '100%' },
  vitalValue: { marginTop: 4, fontSize: 12, fontWeight: '700', color: colors.foreground },

  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 96,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(20,23,34,0.98)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toastText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.tealBright },
});
