import { RefreshCw, Sparkles, UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
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
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const filters = ['All', 'Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'];

const SKILL_COLOR: Record<string, string> = {
  Vocal: '#E879F9',
  Dance: '#67E8F9',
  Rap: '#FCD34D',
  Visual: '#FB7185',
  Charisma: '#34D399',
};

const ARCHETYPE_COLOR: Record<string, string> = {
  Center: '#FB7185',
  Performer: '#67E8F9',
  Strategist: '#FCD34D',
  Anchor: '#34D399',
  Mediator: '#E879F9',
  'All-Rounder': '#9AA3B5',
};

function resolveImageAspectRatio(source?: number) {
  if (!source) return 0.72;
  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) return 0.72;
  return asset.width / asset.height;
}

type Trainee = ReturnType<typeof useGame>['trainees'][number];

export function RecruitScreen() {
  const { trainees, agency, recruitTrainee, refreshScoutingCandidates } = useGame();
  const [confirm, setConfirm] = useState<Trainee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleCandidates = trainees.filter(t => t.isScoutingVisible !== false);
  const list = visibleCandidates.filter(t => activeFilter === 'All' || t.skill === activeFilter);

  const handleRecruit = (traineeId: string) => {
    const result = recruitTrainee(traineeId);
    if (result.ok) {
      const recruited = trainees.find(t => t.id === traineeId) ?? null;
      setConfirm(recruited);
      setExpandedId(null);
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
    const result = refreshScoutingCandidates(activeFilter);
    if (result.ok) {
      if (activeFilter !== 'All' && result.filterMatches === 0) {
        setError('Candidates refreshed — no matches for this filter right now.');
      }
      return;
    }
    if (result.reason === 'INSUFFICIENT_FUNDS') {
      setError('Not enough budget to refresh candidates. (₩12,000,000 required)');
      return;
    }
    setError('No more candidates to show right now.');
  };

  return (
    <AppShell title="Scout" subtitle={`${list.length} candidates visible`}>
      {/* Filter + refresh bar */}
      <View style={styles.controlBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {filters.map(f => {
            const active = activeFilter === f;
            const accent = SKILL_COLOR[f];
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[
                  styles.filterChip,
                  active && { borderColor: accent ?? colors.tealBright, backgroundColor: 'rgba(103,232,249,0.07)' },
                ]}
                activeOpacity={0.7}>
                {accent && active && (
                  <View style={[styles.filterDot, { backgroundColor: accent }]} />
                )}
                <Text style={[styles.filterText, active && { color: accent ?? colors.tealBright }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.refreshPill} onPress={handleRefresh} activeOpacity={0.8}>
          <RefreshCw size={12} color={colors.tealBright} />
          <Text style={styles.refreshPillText}>₩12M</Text>
        </TouchableOpacity>
      </View>

      {/* Candidate grid */}
      <View style={styles.grid}>
        {list.map(t => (
          <CandidateCard
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
            <Text style={styles.emptyTitle}>No candidates visible</Text>
            <Text style={styles.emptyBody}>
              Use Refresh to cycle new faces into the scouting pool.
            </Text>
            <TouchableOpacity style={styles.emptyRefreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
              <RefreshCw size={13} color={colors.tealBright} />
              <Text style={styles.emptyRefreshText}>Refresh Candidates</Text>
            </TouchableOpacity>
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
  expanded,
  onToggle,
  onRecruit,
  canAfford,
}: {
  trainee: Trainee;
  expanded: boolean;
  onToggle: () => void;
  onRecruit: () => void;
  canAfford: boolean;
}) {
  const aspectRatio = resolveImageAspectRatio(t.image);
  const skillColor = SKILL_COLOR[t.skill] ?? colors.tealBright;
  const archetypeColor = ARCHETYPE_COLOR[t.personalityProfile?.archetype ?? 'All-Rounder'] ?? colors.mutedForeground;
  const dominance = t.personalityProfile?.dominance ?? 55;

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
        <Text style={styles.artFlag}>{t.flag}</Text>

        {/* Bottom overlay — name + potential */}
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

          {/* Languages + full name */}
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
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: spacing.sm,
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
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.45)',
    backgroundColor: 'rgba(34,211,238,0.07)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  refreshPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealBright,
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
    backgroundColor: 'rgba(34,211,238,0.06)',
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
    borderColor: 'rgba(103,232,249,0.5)',
    backgroundColor: 'rgba(34,211,238,0.07)',
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
