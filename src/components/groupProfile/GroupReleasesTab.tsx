import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { Release } from '../../types';
import { fmt, fmtCount } from '../../utils/format';

type Props = {
  releases?: Release[];
};

function QualityStars({ quality }: { quality: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < quality);
  return (
    <View style={styles.stars}>
      {stars.map((filled, i) => (
        <Text key={i} style={[styles.star, filled ? styles.starOn : styles.starOff]}>★</Text>
      ))}
    </View>
  );
}

function ReleaseRow({ release, isFirst }: { release: Release; isFirst: boolean }) {
  return (
    <View style={[styles.releaseRow, !isFirst && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={styles.titleRow}>
          <Text style={styles.releaseTitle} numberOfLines={1}>"{release.title}"</Text>
          <QualityStars quality={release.quality} />
        </View>
        <Text style={styles.releaseMeta}>
          {release.concept} · {release.language} · Week {release.weekReleased}
        </Text>
      </View>
      <View style={styles.rowStats}>
        <StatCell label="CHART"   value={`#${release.chartPosition}`}          color={colors.amber} />
        <StatCell label="FANS"    value={`+${fmtCount(release.fansGained)}`}    color={colors.mint} />
        <StatCell label="REVENUE" value={fmt(release.revenueGained)}            color={colors.tealBright} />
      </View>
    </View>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function GroupReleasesTab({ releases }: Props) {
  const sorted = releases && releases.length > 0
    ? [...releases].reverse()
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DISCOGRAPHY</Text>
        {sorted ? (
          sorted.map((rel, i) => (
            <ReleaseRow key={rel.id} release={rel} isFirst={i === 0} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No releases yet</Text>
            <Text style={styles.emptyBody}>Drop a single or album to start building your discography.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

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

  // Release row
  releaseRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLeft: { gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  releaseTitle: { fontSize: 15, fontWeight: '800', color: colors.foreground, flex: 1 },
  releaseMeta: { fontSize: 10, color: colors.mutedForeground },
  rowStats: { flexDirection: 'row', gap: spacing.md },

  // Stat cells
  statCell: { alignItems: 'center', gap: 2, minWidth: 52 },
  statVal: { fontSize: 12, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: colors.mutedForeground },

  // Quality stars
  stars: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 10 },
  starOn:  { color: colors.amber },
  starOff: { color: 'rgba(255,255,255,0.15)' },

  // Empty state
  empty: { paddingVertical: spacing.lg, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 13, fontWeight: '700', color: colors.mutedForeground },
  emptyBody:  { fontSize: 11, color: colors.mutedForeground, textAlign: 'center', lineHeight: 16 },
});
