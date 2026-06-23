import { RefreshCw, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell } from '../components/AppShell';
import { ScoutCard } from '../components/scout/ScoutCard';
import { SKILL_COLOR } from '../components/ui/idolConstants';
import { BASE_REFRESH_COST, traineeArtPool } from '../data/gameData';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { Trainee } from '../types';
import { fmt } from '../utils/format';

// All nationalities that can ever appear — derived from static art constraints once.
// `availableNationality` can be "All" or comma-separated values (e.g. "Thai, Chinese"),
// so we normalize/split and keep a single unique "All" option for chip keys.
const ALL_NATIONALITIES = [
  'All',
  ...Array.from(
    new Set(
      traineeArtPool
        .flatMap(t => t.availableNationality.split(','))
        .map(v => v.trim())
        .filter(v => v.length > 0 && v !== 'All'),
    ),
  ).sort(),
];

const filters = ['All', 'Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'];
const PAGE_SIZE = 10;
const FILTER_COST: Record<string, number> = {
  skill: 2_000_000,
  gender: 3_000_000,
  nationality: 5_000_000,
};

function getProfileFlag(value?: number | string) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.floor(numeric);
  }
  return Number.MAX_SAFE_INTEGER;
}

export function RecruitScreen() {
  const { trainees, agency, recruitTrainee, refreshScoutingCandidates, spendAgencyMoney } = useGame();
  const [confirm, setConfirm] = useState<Trainee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'male' | 'female'>('All');
  const [nationalityFilter, setNationalityFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const matchesFilters = (t: Trainee) => {
    if (activeFilter !== 'All' && t.skill !== activeFilter) return false;
    if (genderFilter !== 'All' && t.gender !== genderFilter) return false;
    if (nationalityFilter !== 'All' && t.nationality !== nationalityFilter) return false;
    return true;
  };
  const orderedCandidates = useMemo(
    () => [...trainees].sort((a, b) => getProfileFlag(a.artKey) - getProfileFlag(b.artKey)),
    [trainees],
  );
  const allFilteredCandidates = orderedCandidates.filter(matchesFilters);
  const nationalities = ALL_NATIONALITIES;
  const totalPages = Math.max(1, Math.ceil(allFilteredCandidates.length / PAGE_SIZE));
  const list = allFilteredCandidates.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [activeFilter, genderFilter, nationalityFilter]);

  useEffect(() => {
    setPage(current => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const handleRecruit = (traineeId: string) => {
    const result = recruitTrainee(traineeId);
    if (result.ok) {
      const recruited = trainees.find(t => t.id === traineeId) ?? null;
      setConfirm(recruited);
      setExpandedId(null);
      return;
    }
    if (result.reason === 'ROSTER_FULL') {
      setError('Your agency has reached the 30-idol limit. You cannot recruit more idols at this time.');
      return;
    }
    if (result.reason === 'INSUFFICIENT_FUNDS') {
      setError('Not enough budget to recruit this trainee.');
      return;
    }
    if (result.reason === 'ALREADY_RECRUITED') {
      setError('This trainee is already in your roster.');
      return;
    }
    setError('Trainee not found.');
  };

  const handleRefresh = () => {
    if (allFilteredCandidates.length === 0) {
      setError('No matching profiles for the selected filters.');
      return;
    }
    const result = refreshScoutingCandidates(
      { skill: activeFilter, gender: genderFilter, nationality: nationalityFilter },
      refreshCost,
    );
    if (!result.ok) {
      if (result.reason === 'INSUFFICIENT_FUNDS') {
        setError(`Not enough budget to refresh. ${refreshCostLabel} required.`);
        return;
      }
      setError('No more candidates to show right now.');
      return;
    }
    setExpandedId(null);
    setPage(current => (current + 1) % totalPages);
  };

  const applyFilterCost = (cost: number, label: string) => {
    if (cost <= 0) return true;
    const result = spendAgencyMoney(cost);
    if (result.ok) return true;
    setError(`Not enough budget to apply ${label} filter. ${fmt(cost)} required.`);
    return false;
  };

  const handleSkillFilterPress = (next: string) => {
    if (next === activeFilter) return;
    if (next !== 'All' && !applyFilterCost(FILTER_COST.skill, 'skill')) return;
    setActiveFilter(next);
    setExpandedId(null);
  };

  const handleGenderFilterPress = (next: 'All' | 'male' | 'female') => {
    if (next === genderFilter) return;
    if (next !== 'All' && !applyFilterCost(FILTER_COST.gender, 'gender')) return;
    setGenderFilter(next);
    setExpandedId(null);
  };

  const handleNationalityFilterPress = (next: string) => {
    if (next === nationalityFilter) return;
    if (next !== 'All' && !applyFilterCost(FILTER_COST.nationality, 'nationality')) return;
    setNationalityFilter(next);
    setExpandedId(null);
  };

  const activeFilterCount = (activeFilter !== 'All' ? 1 : 0) + (genderFilter !== 'All' ? 1 : 0) + (nationalityFilter !== 'All' ? 1 : 0);
  const refreshCost =
    BASE_REFRESH_COST +
    (activeFilter !== 'All' ? FILTER_COST.skill : 0) +
    (genderFilter !== 'All' ? FILTER_COST.gender : 0) +
    (nationalityFilter !== 'All' ? FILTER_COST.nationality : 0);
  const refreshCostLabel = `₩${(refreshCost / 1_000_000).toFixed(1)}M`;

  return (
    <AppShell title="Scout" subtitle={`${allFilteredCandidates.length} total matches`}>

      {/* ── FILTER PANEL ── */}
      <View style={styles.filterPanel}>

        {/* Skill row */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>SKILL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map(f => {
              const active = activeFilter === f;
              const accent = SKILL_COLOR[f];
              const count = f === 'All' ? orderedCandidates.length : orderedCandidates.filter(t => t.skill === f).length;
              const hasMatches = count > 0;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => handleSkillFilterPress(f)}
                  style={[styles.filterChip, active && { borderColor: (accent ?? colors.tealBright) + 'AA', backgroundColor: (accent ?? colors.tealBright) + '18' }, !hasMatches && styles.filterChipEmpty]}
                  activeOpacity={0.7}>
                  {accent && <View style={[styles.filterDot, { backgroundColor: accent, opacity: active ? 1 : hasMatches ? 0.35 : 0.15 }]} />}
                  <Text style={[styles.filterText, active && { color: accent ?? colors.tealBright, fontWeight: '700' }, !hasMatches && styles.filterTextEmpty]}>{f}</Text>
                  {f !== 'All' && <Text style={[styles.filterCount, active && { color: accent ?? colors.tealBright }]}>{count}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Gender row */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>GENDER</Text>
          <View style={styles.genderToggle}>
            {(['All', 'female', 'male'] as const).map(g => {
              const active = genderFilter === g;
              const label = g === 'All' ? 'All' : g === 'female' ? '♀ Female' : '♂ Male';
              const color = g === 'female' ? '#F9A8D4' : g === 'male' ? '#93C5FD' : colors.teal;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => handleGenderFilterPress(g)}
                  style={[styles.genderBtn, active && { borderColor: color + '66', backgroundColor: color + '18' }]}
                  activeOpacity={0.7}>
                  <Text style={[styles.genderBtnText, active && { color, fontWeight: '700' }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nationality row */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>NATIONALITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {nationalities.map(n => {
              const active = nationalityFilter === n;
              const count = n === 'All' ? orderedCandidates.length : orderedCandidates.filter(t => t.nationality === n).length;
              const hasMatches = count > 0;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => handleNationalityFilterPress(n)}
                  style={[styles.filterChip, active && { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg }, !hasMatches && styles.filterChipEmpty]}
                  activeOpacity={0.7}>
                  <Text style={[styles.filterText, active && { color: colors.tealBright, fontWeight: '700' }, !hasMatches && styles.filterTextEmpty]}>{n}</Text>
                  {n !== 'All' && <Text style={[styles.filterCount, active && { color: colors.tealBright }]}>{count}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Refresh CTA + match count */}
        <View style={styles.refreshRow}>
          <View>
            <View style={styles.matchCount}>
              <Text style={styles.matchNum}>{list.length}</Text>
              <Text style={styles.matchLabel}> match{list.length !== 1 ? 'es' : ''}</Text>
            </View>
            <Text style={styles.filterActiveLabel}>
              {allFilteredCandidates.length === 0 ? '0 results' : `${allFilteredCandidates.length} total`}
            </Text>
            {activeFilterCount > 0 && (
              <Text style={styles.filterActiveLabel}>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</Text>
            )}
          </View>
          <View style={styles.refreshSide}>            
            {/* Paid refresh — clearly labeled */}
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.85}>
              <RefreshCw size={13} color={colors.slate900} />
              <Text style={styles.refreshBtnText}>Refresh {refreshCostLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Candidate grid */}
      <View style={styles.grid}>
        {list.map(t => (
          <ScoutCard
            key={t.id}
            trainee={t}
            expanded={expandedId === t.id}
            onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
            onRecruit={() => handleRecruit(t.id)}
            canAfford={agency.money >= t.cost}
          />
        ))}
        {list.length === 0 && (
          <View style={styles.emptyState}>
            {allFilteredCandidates.length > 0 ? (
              <>
                <Text style={styles.emptyTitle}>No results on this page</Text>
                <Text style={styles.emptyBody}>
                  Use ‹ › to browse other pages, or "New Pool" to refresh the scouting pool (costs {refreshCostLabel}).
                </Text>
                <TouchableOpacity
                  style={styles.emptyRefreshBtn}
                  onPress={() => { setActiveFilter('All'); setGenderFilter('All'); setNationalityFilter('All'); }}
                  activeOpacity={0.8}>
                  <X size={13} color={colors.tealBright} />
                  <Text style={styles.emptyRefreshText}>Clear All Filters</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No matching profiles</Text>
                <Text style={styles.emptyBody}>
                  No profiles in the full scout pool match the current filters.
                </Text>
                <TouchableOpacity
                  style={styles.emptyRefreshBtn}
                  onPress={() => { setActiveFilter('All'); setGenderFilter('All'); setNationalityFilter('All'); }}
                  activeOpacity={0.8}>
                  <X size={13} color={colors.tealBright} />
                  <Text style={styles.emptyRefreshText}>Clear All Filters</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Recruit success modal */}
      <Modal
        visible={confirm !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.successCard}>
            {confirm?.image ? (
              <Image
                source={confirm.image}
                resizeMode="cover"
                style={styles.successArt}
              />
            ) : null}
            <View style={styles.successOverlay} />
            <View style={styles.successContent}>
              <View style={styles.successBadge}>
                <Sparkles size={14} color={colors.slate900} />
                <Text style={styles.successBadgeText}>SIGNED</Text>
              </View>
              <Text style={styles.successName}>{confirm?.name}</Text>
              <Text style={styles.successSub}>
                {confirm?.nationality} · {confirm?.skill} · Age {confirm?.age}
              </Text>
              <Text style={styles.successBody}>
                Now on your roster. Assign to training or form a group to start their journey.
              </Text>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => setConfirm(null)}
                activeOpacity={0.8}>
                <Text style={styles.continueText}>Continue Scouting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal
        visible={error !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setError(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.errorCard}>
            <TouchableOpacity style={styles.errorClose} onPress={() => setError(null)}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <Text style={styles.errorTitle}>Cannot Recruit</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => setError(null)}
              activeOpacity={0.8}>
              <Text style={styles.continueText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}


const styles = StyleSheet.create({
  // ── Filter panel ──
  filterPanel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(20,23,34,0.85)',
    padding: spacing.md,
    gap: spacing.md,
  },
  filterSection: {
    gap: 6,
  },
  filterSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  filterChipEmpty: { opacity: 0.45 },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  filterTextEmpty: { color: 'rgba(154,163,181,0.5)' },
  filterCount: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.mutedForeground,
    backgroundColor: colors.whiteA10,
    borderRadius: radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },

  genderToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  genderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  genderBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  matchCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  matchNum: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.tealBright,
  },
  matchLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  filterActiveLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  refreshSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  costBreakdown: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  costBreakdownText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate900,
  },

  grid: {
    gap: spacing.lg,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.foreground,
  },
  emptyBody: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.tealActiveBorder,
    backgroundColor: colors.tealActiveBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyRefreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealBright,
  },

  // Success modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.4)',
    backgroundColor: '#0B0E16',
    minHeight: 320,
  },
  successArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  successOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(8,11,18,0.88)',
  },
  successContent: {
    padding: spacing.xl,
    paddingTop: spacing.xl * 3,
    alignItems: 'center',
    gap: spacing.sm,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  successBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.slate900,
  },
  successName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  continueBtn: {
    marginTop: spacing.sm,
    width: '100%',
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
  },
  continueText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate900,
  },

  // Error modal
  errorCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.4)',
    backgroundColor: 'rgba(20,12,16,0.98)',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.hot,
    marginTop: spacing.md,
  },
  errorBody: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
});
