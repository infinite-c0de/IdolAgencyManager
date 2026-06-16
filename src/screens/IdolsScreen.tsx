import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Search, SlidersHorizontal, UserPlus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell, Card, StatusDot } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { filterIdols, IDOL_STATUSES, type IdolFilterStatus } from '../features/idols';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function IdolsScreen() {
  const navigation = useNavigation<Nav>();
  const { idols } = useGame();
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
      <Card>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search idols, roles, groups"
            placeholderTextColor={colors.mutedForeground}
            style={styles.searchInput}
          />
          <SlidersHorizontal size={16} color={colors.mutedForeground} />
        </View>
        <View style={styles.filterRow}>
          {IDOL_STATUSES.map(s => {
            const active = filter === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setFilter(s)}
                style={[styles.filterChip, active ? styles.chipActive : styles.chipIdle]}
                activeOpacity={0.7}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={styles.grid}>
        {list.map(i => (
          <TouchableOpacity
            key={i.id}
            style={[styles.idolCard, i.status === 'Active' ? styles.glowTeal : styles.cardBorder]}
            onPress={() => navigation.navigate('IdolProfile', { id: i.id })}
            activeOpacity={0.85}>
            <Gradient colors={i.gradient} style={styles.idolImage}>
              {i.image ? <Image source={i.image} resizeMode="cover" style={styles.idolImagePhoto} /> : null}
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{i.rank}</Text>
              </View>
              <Text style={styles.flag}>{i.flag}</Text>
              <View style={styles.idolImageFooter}>
                <View style={styles.statusRow}>
                  <StatusDot status={i.status} />
                  <Text style={styles.statusText}> {i.status}</Text>
                </View>
              </View>
            </Gradient>
            <View style={styles.idolBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.idolName}>{i.stageName}</Text>
                <Text style={styles.idolPop}>{i.popularity}%</Text>
              </View>
              <Text style={styles.idolRole} numberOfLines={1}>
                {i.role}
              </Text>
              <View style={styles.rowBetween}>
                <Text style={styles.tinyMuted}>{i.group ?? 'Solo'}</Text>
                <ChevronRight size={12} color={colors.mutedForeground} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 9, color: colors.mutedForeground },

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
  searchInput: { flex: 1, color: colors.foreground, fontSize: 14, padding: 0 },

  filterRow: { gap: spacing.sm, marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap' },
  filterChip: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  chipIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  chipActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  filterChipTextActive: { color: colors.tealBright },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  idolCard: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(28,32,48,0.7)',
    padding: spacing.md,
  },
  cardBorder: { borderWidth: 1, borderColor: colors.border },
  glowTeal: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    shadowColor: colors.teal,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  idolImage: { height: 128, borderRadius: radius.lg, overflow: 'hidden' },
  idolImagePhoto: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    elevation: 1,
  },
  rankBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    zIndex: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.black40,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: { fontSize: 9, fontWeight: '700', color: colors.foreground },
  flag: { position: 'absolute', right: 8, top: 6, fontSize: 16, zIndex: 2 },
  idolImageFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 9, color: 'rgba(255,255,255,0.8)' },

  idolBody: { marginTop: spacing.sm },
  idolName: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  idolPop: { fontSize: 10, fontWeight: '600', color: colors.tealBright },
  idolRole: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
});
