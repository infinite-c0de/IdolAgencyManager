import { Heart, RefreshCw, Sparkles, UserPlus, X } from 'lucide-react-native';
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
import { Gradient } from '../components/ui/Gradient';
import { BASE_REFRESH_COST, traineeArtPool } from '../data/gameData';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, statColors } from '../theme';
import { fmt, fmtCount } from '../utils/format';

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

const SKILL_COLOR: Record<string, string> = {
  Vocal:    statColors.vocal,
  Dance:    statColors.dance,
  Rap:      statColors.rap,
  Visual:   statColors.visual,
  Charisma: statColors.charisma,
};

const ARCHETYPE_COLOR: Record<string, string> = {
  Center:        statColors.visual,
  Performer:     statColors.dance,
  Strategist:    statColors.rap,
  Anchor:        statColors.charisma,
  Mediator:      statColors.vocal,
  'All-Rounder': '#9AA3B5',
};

function resolveImageAspectRatio(source?: number) {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

type Trainee = ReturnType<typeof useGame>['trainees'][number];

function getProfileFlag(value?: number | string) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.floor(numeric);
  }
  return Number.MAX_SAFE_INTEGER;
}

export function RecruitScreen() {
  const { trainees, agency, recruitTrainee, refreshScoutingCandidates } = useGame();
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
                  onPress={() => setActiveFilter(f)}
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
                  onPress={() => setGenderFilter(g)}
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
                  onPress={() => setNationalityFilter(n)}
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
            {/* Free prev/next page navigation */}
            <View style={styles.pageNav}>
              <TouchableOpacity
                style={[styles.pageNavBtn, page === 0 && styles.pageNavBtnDisabled]}
                onPress={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                activeOpacity={0.8}>
                <Text style={styles.pageNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.pageNavLabel}>{allFilteredCandidates.length === 0 ? '0/0' : `${page + 1}/${totalPages}`}</Text>
              <TouchableOpacity
                style={[styles.pageNavBtn, page >= totalPages - 1 && styles.pageNavBtnDisabled]}
                onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                activeOpacity={0.8}>
                <Text style={styles.pageNavText}>›</Text>
              </TouchableOpacity>
            </View>
            {/* Paid refresh — clearly labeled */}
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.85}>
              <RefreshCw size={13} color={colors.slate900} />
              <Text style={styles.refreshBtnText}>New Pool {refreshCostLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Candidate grid */}
      <View style={styles.grid}>
        {list.map(t => (
          <CandidateCard
            key={t.id}
            trainee={t}
            profileFlag={getProfileFlag(t.artKey)}
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

function CandidateCard({
  trainee: t,
  profileFlag,
  expanded,
  onToggle,
  onRecruit,
  canAfford,
}: {
  trainee: Trainee;
  profileFlag: number;
  expanded: boolean;
  onToggle: () => void;
  onRecruit: () => void;
  canAfford: boolean;
}) {
  const aspectRatio = resolveImageAspectRatio(t.image);
  const skillColor = SKILL_COLOR[t.skill] ?? colors.tealBright;
  const archetypeColor = ARCHETYPE_COLOR[t.personalityProfile?.archetype ?? 'All-Rounder'] ?? colors.mutedForeground;
  const dominance = t.personalityProfile?.dominance ?? 55;
  const initialFans = Math.round(40 + t.potential * 0.35) * 3200;

  return (
    <TouchableOpacity
      style={styles.cardWrap}
      onPress={onToggle}
      activeOpacity={0.93}>
      {/* Art panel — always visible */}
      <View style={[styles.artFrame, { aspectRatio }]}>
        {t.image ? (
          <Image source={t.image} resizeMode="cover" style={styles.artPhoto} />
        ) : (
          <View style={styles.artFallback}>
            <Text style={styles.artFallbackText}>{t.name.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}

        {/* Dark gradient over bottom third */}
        <View style={styles.artGradientBottom} />

        {/* Top badges */}
        <View style={styles.artTopLeft}>
          <View style={[styles.skillBadge, { backgroundColor: skillColor + '22', borderColor: skillColor + '66' }]}>
            <View style={[styles.skillDot, { backgroundColor: skillColor }]} />
            <Text style={[styles.skillBadgeText, { color: skillColor }]}>{t.skill}</Text>
          </View>
        </View>

        {/* Bottom overlay — name + potential + fans */}
        <View style={styles.artBottom}>
          <View style={styles.artBottomLeft}>
            <Text style={styles.artName}>{t.name}</Text>
            <Text style={styles.artSub}>{t.nationality} · {t.age}yr</Text>
          </View>
          <View style={styles.potentialBadge}>
            <Sparkles size={11} color={colors.tealBright} />
            <Text style={styles.potentialText}>{t.potential}</Text>
          </View>
        </View>
      </View>

      {/* Expanded detail panel */}
      {expanded && (
        <View style={styles.detailPanel}>
          {/* Trait pill row */}
          <View style={styles.traitRow}>
            <TraitPill label={t.personalityProfile?.archetype ?? 'All-Rounder'} color={archetypeColor} />
            <TraitPill label={t.personality} color={colors.mutedForeground} />
          </View>

          {/* Dominance bar */}
          <View style={styles.statSection}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statKey}>Dominance</Text>
              <Text style={[styles.statNum, { color: archetypeColor }]}>{dominance}</Text>
            </View>
            <View style={styles.barTrack}>
              <Gradient
                colors={[archetypeColor + 'AA', archetypeColor]}
                direction="to-r"
                style={[styles.barFill, { width: `${dominance}%` }]}
              />
            </View>
          </View>

          {/* Trait mini-bars */}
          {t.personalityProfile && (
            <View style={styles.traitBars}>
              {(Object.entries(t.personalityProfile.traits) as [string, number][]).map(([key, val]) => (
                <View key={key} style={styles.traitBarRow}>
                  <Text style={styles.traitBarKey}>{key.slice(0, 4).toUpperCase()}</Text>
                  <View style={styles.traitBarTrack}>
                    <View style={[styles.traitBarFill, { width: `${val}%`, backgroundColor: archetypeColor + 'CC' }]} />
                  </View>
                  <Text style={styles.traitBarVal}>{val}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages + full name + fans */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>FULL NAME</Text>
              <Text style={styles.metaVal}>{t.fullName ?? t.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>LANGUAGES</Text>
              <Text style={styles.metaVal}>{t.languages.join(' · ')}</Text>
            </View>
          </View>
          <View style={styles.fansRow}>
            <Heart size={12} color="#F9A8D4" />
            <Text style={styles.fansRowKey}>INITIAL FANBASE</Text>
            <Text style={styles.fansRowVal}>{fmtCount(initialFans)} fans</Text>
          </View>

          {/* Recruit footer */}
          <View style={styles.recruitRow}>
            <Text style={[styles.costLabel, !canAfford && styles.costLabelInsufficient]}>
              {fmt(t.cost)}
            </Text>
            <TouchableOpacity
              style={[styles.recruitBtn, !canAfford && styles.recruitBtnDim]}
              onPress={onRecruit}
              activeOpacity={0.8}>
              <UserPlus size={13} color={canAfford ? colors.slate900 : colors.mutedForeground} />
              <Text style={[styles.recruitBtnText, !canAfford && styles.recruitBtnTextDim]}>
                {canAfford ? 'Sign Contract' : 'Insufficient Funds'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Collapsed tap hint */}
      {!expanded && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>TAP FOR DETAILS</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function TraitPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.traitPill, { borderColor: color + '55' }]}>
      <Text style={[styles.traitPillText, { color }]}>{label}</Text>
    </View>
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
  pageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    overflow: 'hidden',
  },
  pageNavBtn: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavBtnDisabled: { opacity: 0.35 },
  pageNavText: { fontSize: 16, fontWeight: '700', color: colors.tealBright },
  pageNavLabel: { fontSize: 11, fontWeight: '700', color: colors.foreground, paddingHorizontal: 4 },
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
  cardWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(20,23,34,0.9)',
  },

  // Art frame
  artFrame: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#080B12',
  },
  artPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  artFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  artFallbackText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 4,
  },
  artGradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'transparent',
    // Simulated gradient via layered opacity trick
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  artTopLeft: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 4,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  skillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  artFlag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 18,
    zIndex: 4,
  },
  artBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
    padding: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  artBottomLeft: {
    flex: 1,
  },
  artName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  artSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  potentialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.5)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  potentialText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.tealBright,
  },
  fansBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,168,212,0.45)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  fansText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F9A8D4',
  },

  // Tap hint
  tapHint: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tapHintText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.mutedForeground,
  },

  // Expanded detail panel
  detailPanel: {
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  traitRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  traitPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  traitPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Stats
  statSection: {
    gap: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statKey: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },
  statNum: {
    fontSize: 13,
    fontWeight: '900',
  },
  barTrack: {
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },

  traitBars: {
    gap: 5,
  },
  traitBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  traitBarKey: {
    width: 34,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.mutedForeground,
  },
  traitBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  traitBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  traitBarVal: {
    width: 22,
    fontSize: 9,
    fontWeight: '700',
    color: colors.mutedForeground,
    textAlign: 'right',
  },

  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaKey: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  fansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(249,168,212,0.12)',
  },
  fansRowKey: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(249,168,212,0.6)',
    flex: 1,
  },
  fansRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F9A8D4',
  },

  recruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  costLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.tealBright,
  },
  costLabelInsufficient: {
    color: colors.hot,
  },
  recruitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recruitBtnDim: {
    backgroundColor: colors.whiteA10,
  },
  recruitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  recruitBtnTextDim: {
    color: colors.mutedForeground,
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
