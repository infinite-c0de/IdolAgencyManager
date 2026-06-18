import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, UserPlus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { filterIdols, IDOL_STATUSES, type IdolFilterStatus } from '../features/idols';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, statusColor } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOP_STATS: Array<{ key: keyof ReturnType<typeof useGame>['idols'][number]['stats']; label: string; color: string }> = [
  { key: 'vocal', label: 'VOC', color: '#E879F9' },
  { key: 'dance', label: 'DNC', color: '#67E8F9' },
  { key: 'rap', label: 'RAP', color: '#FCD34D' },
  { key: 'visual', label: 'VIS', color: '#FB7185' },
  { key: 'charisma', label: 'CHA', color: '#34D399' },
];

function resolveImageAspectRatio(source?: number) {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

export function IdolsScreen() {
  const navigation = useNavigation<Nav>();
  const { idols, groups } = useGame();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<IdolFilterStatus>('All');

  const list = useMemo(() => filterIdols(idols, q, filter), [idols, q, filter]);

  const recruitAction = (
    <TouchableOpacity
      style={styles.recruitBtn}
      onPress={() => navigation.navigate('Recruit')}
      activeOpacity={0.8}>
      <UserPlus size={14} color={colors.slate900} />
      <Text style={styles.recruitText}>Recruit</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell
      title="Idol Roster"
      subtitle={`${idols.length} talents under contract`}
      action={recruitAction}>

      {/* Search + filter */}
      <Card>
        <View style={styles.searchBox}>
          <Search size={15} color={colors.mutedForeground} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search name, role, group…"
            placeholderTextColor={colors.mutedForeground}
            style={styles.searchInput}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {IDOL_STATUSES.map(s => {
            const active = filter === s;
            const dot = statusColor[s];
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setFilter(s)}
                style={[styles.filterChip, active ? styles.chipActive : styles.chipIdle]}
                activeOpacity={0.7}>
                {dot && <View style={[styles.statusDot, { backgroundColor: dot }]} />}
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card>

      {/* Grid */}
      <View style={styles.grid}>
        {list.map(i => {
          const groupForIdol = i.group ? groups.find(g => g.name === i.group) : undefined;
          const aspectRatio = resolveImageAspectRatio(i.image);
          const statusDotColor = statusColor[i.status] ?? colors.mutedForeground;
          const isActive = i.status === 'Active';

          return (
            <TouchableOpacity
              key={i.id}
              style={styles.cardWrap}
              onPress={() => navigation.navigate('IdolProfile', { id: i.id })}
              activeOpacity={0.88}>
              <View style={[styles.card, isActive ? styles.cardGlow : styles.cardBorder]}>

                {/* Full-bleed art */}
                <View style={[styles.artFrame, { aspectRatio }]}>
                  {i.image ? (
                    <Image source={i.image} resizeMode="cover" style={styles.artPhoto} />
                  ) : (
                    <View style={styles.artFallback}>
                      <Text style={styles.artFallbackText}>{i.stageName.slice(0, 2).toUpperCase()}</Text>
                    </View>
                  )}

                  {/* Top badges */}
                  <View style={styles.topLeft}>
                    <View style={[styles.statusPill, { borderColor: statusDotColor + '66' }]}>
                      <View style={[styles.statusPillDot, { backgroundColor: statusDotColor }]} />
                      <Text style={[styles.statusPillText, { color: statusDotColor }]}>{i.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.artFlag}>{i.flag}</Text>

                  {/* Bottom overlay */}
                  <View style={styles.artBottom}>
                    <View style={styles.artBottomLeft}>
                      <Text style={styles.artName} numberOfLines={1}>{i.stageName}</Text>
                      <Text style={styles.artRole} numberOfLines={1}>{i.role}</Text>
                    </View>
                    {i.group && groupForIdol && (
                      <View style={styles.artGroupBadge}>
                        <AgencyLogoMark
                          preset={groupForIdol.logo?.kind === 'preset' ? groupForIdol.logo.preset : 1}
                          size={22}
                        />
                        <Text style={styles.artGroupName} numberOfLines={1}>{i.group}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Stat mini-bars below art */}
                <View style={styles.statStrip}>
                  {TOP_STATS.map(stat => {
                    const val = i.stats[stat.key];
                    return (
                      <View key={stat.key} style={styles.statCol}>
                        <View style={styles.statBarTrack}>
                          <Gradient
                            colors={[stat.color + '88', stat.color]}
                            direction="to-t"
                            style={[styles.statBarFill, { height: `${val}%` }]}
                          />
                        </View>
                        <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.popCol}>
                    <Text style={styles.popNum}>{i.popularity}</Text>
                    <Text style={styles.popLabel}>POP</Text>
                  </View>
                </View>

                {/* Group tag */}
                {i.group && (
                  <View style={styles.groupTag}>
                    <Text style={styles.groupTagText} numberOfLines={1}>{i.group}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {list.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No idols yet</Text>
            <Text style={styles.emptyBody}>Recruit from the Scout screen to build your roster.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Recruit')}
              activeOpacity={0.8}>
              <UserPlus size={14} color={colors.slate900} />
              <Text style={styles.emptyBtnText}>Go to Scout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  recruitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recruitText: { fontSize: 11, fontWeight: '700', color: colors.slate900 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.foreground, fontSize: 13, padding: 0 },

  filterScroll: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, paddingBottom: 2 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5, borderWidth: 1 },
  chipIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  chipActive: { borderColor: 'rgba(34,211,238,0.55)', backgroundColor: 'rgba(34,211,238,0.07)' },
  statusDot: { width: 6, height: 6, borderRadius: radius.full },
  filterChipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  filterChipTextActive: { color: colors.tealBright },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  cardWrap: { width: '50%', padding: spacing.xs },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,23,34,0.92)',
  },
  cardBorder: { borderWidth: 1, borderColor: colors.border },
  cardGlow: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.5)',
    shadowColor: colors.teal,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  artFrame: { width: '100%', position: 'relative', backgroundColor: '#080B12' },
  artPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  artFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,211,238,0.05)' },
  artFallbackText: { fontSize: 24, fontWeight: '900', color: 'rgba(103,232,249,0.3)', letterSpacing: 3 },

  topLeft: { position: 'absolute', top: spacing.xs, left: spacing.xs, zIndex: 3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statusPillDot: { width: 5, height: 5, borderRadius: radius.full },
  statusPillText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  artFlag: { position: 'absolute', top: spacing.xs, right: spacing.xs, fontSize: 14, zIndex: 3 },
  artBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  artBottomLeft: { flex: 1, marginRight: spacing.xs },
  artGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    maxWidth: '55%',
  },
  artGroupName: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  artName: { fontSize: 12, fontWeight: '800', color: colors.foreground },
  artRole: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  statStrip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statCol: { flex: 1, alignItems: 'center', gap: 3 },
  statBarTrack: {
    width: '100%',
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  statBarFill: { width: '100%', borderRadius: radius.sm },
  statLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 0.4 },
  popCol: { flex: 1, alignItems: 'center', gap: 2 },
  popNum: { fontSize: 16, fontWeight: '900', color: colors.tealBright, lineHeight: 18 },
  popLabel: { fontSize: 7, fontWeight: '800', letterSpacing: 0.4, color: colors.mutedForeground },

  groupTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  groupTagText: { fontSize: 9, fontWeight: '700', color: colors.violetBright, letterSpacing: 0.5 },

  emptyState: { width: '100%', alignItems: 'center', paddingVertical: 40, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  emptyBody: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyBtnText: { fontSize: 12, fontWeight: '700', color: colors.slate900 },
});
