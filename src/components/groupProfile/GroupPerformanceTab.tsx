import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RadarChart } from '../charts';
import { StatBar } from '../ui/StatBar';
import { colors, radius, spacing, statColors } from '../../theme';
import type { GroupRadarPoint } from '../../features/groups/types';

type Props = {
  radar: GroupRadarPoint[];
  avgVocal: number;
  avgDance: number;
  avgRap: number;
  avgVisual: number;
  avgCharisma: number;
  avgMorale: number;
  avgStamina: number;
};

const STAGE_STATS: {
  label: string;
  key: keyof Omit<Props, 'radar'>;
  color: string;
}[] = [
  { label: 'VOCAL',    key: 'avgVocal',    color: statColors.vocal },
  { label: 'DANCE',    key: 'avgDance',    color: statColors.dance },
  { label: 'RAP',      key: 'avgRap',      color: statColors.rap },
  { label: 'VISUAL',   key: 'avgVisual',   color: statColors.visual },
  { label: 'CHARISMA', key: 'avgCharisma', color: statColors.charisma },
];

const TEAM_STATS: {
  label: string;
  key: keyof Omit<Props, 'radar'>;
  color: string;
}[] = [
  { label: 'MORALE',  key: 'avgMorale',  color: colors.tealBright },
  { label: 'STAMINA', key: 'avgStamina', color: statColors.stamina },
];

export function GroupPerformanceTab(props: Props) {
  return (
    <View style={styles.container}>

      {/* Radar chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GROUP RADAR</Text>
        <View style={styles.radarWrap}>
          <RadarChart data={props.radar} size={190} showValueInLabels />
        </View>
      </View>

      {/* Stage performance averages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STAGE PERFORMANCE  ·  TEAM AVERAGES</Text>
        <View style={styles.barList}>
          {STAGE_STATS.map(s => (
            <StatBar
              key={s.key}
              label={s.label}
              value={props[s.key] as number}
              color={s.color}
              labelWidth={80}
            />
          ))}
        </View>
      </View>

      {/* Team welfare averages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TEAM WELFARE</Text>
        <View style={styles.barList}>
          {TEAM_STATS.map(s => (
            <StatBar
              key={s.key}
              label={s.label}
              value={props[s.key] as number}
              color={s.color}
              labelWidth={80}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },

  section: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  radarWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  barList: {
    gap: 8,
  },
});
