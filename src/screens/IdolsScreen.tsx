import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, UserPlus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { RosterIdolCard } from '../components/roster/RosterIdolCard';
import { filterIdols, IDOL_STATUSES, type IdolFilterStatus } from '../features/idols';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, statusColor } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
          const groupLogoPreset = groupForIdol?.logo?.kind === 'preset' ? groupForIdol.logo.preset : undefined;

          return (
            <View key={i.id} style={styles.cardWrap}>
              <RosterIdolCard
                idol={i}
                groupLogoPreset={groupLogoPreset}
                onPress={() => navigation.navigate('IdolProfile', { id: i.id })}
              />
            </View>
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
  chipActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  statusDot: { width: 6, height: 6, borderRadius: radius.full },
  filterChipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  filterChipTextActive: { color: colors.tealBright },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cardWrap: { width: '50%', padding: spacing.xs },

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
