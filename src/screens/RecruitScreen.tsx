import { Sparkles, UserPlus } from 'lucide-react-native';
import React, { ReactNode, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const filters = ['All', 'Vocal', 'Dance', 'Rap', 'Visual', 'Charisma'];

function resolveImageAspectRatio(source?: number) {
  if (!source) {
    return 0.72;
  }

  const asset = Image.resolveAssetSource(source);
  if (!asset?.width || !asset?.height) {
    return 0.72;
  }

  return asset.width / asset.height;
}

export function RecruitScreen() {
  const { trainees, recruitTrainee, refreshScoutingCandidates } = useGame();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const visibleCandidates = trainees.filter(t => t.isScoutingVisible !== false);
  const list = visibleCandidates.filter(t => activeFilter === 'All' || t.skill === activeFilter);

  const handleRecruit = (traineeId: string) => {
    const result = recruitTrainee(traineeId);
    if (result.ok) {
      setConfirm(result.idolName);
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
        setError('Candidates refreshed, but this filter still has no available trainees.');
      }
      return;
    }

    if (result.reason === 'INSUFFICIENT_FUNDS') {
      setError('Not enough budget to refresh candidates.');
      return;
    }

    setError('No candidates left to refresh.');
  };

  return (
    <AppShell title="Scout Trainees" subtitle="Build the next generation of stars">
      <Card>
        <SectionTitle>FILTERS</SectionTitle>
        <View style={styles.filterWrap}>
          {filters.map(f => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[styles.filterChip, active && styles.filterActive]}
                activeOpacity={0.7}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
          <Text style={styles.refreshBtnText}>Refresh Candidates (₩12,000,000)</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.grid}>
        {list.map(t => (
          <Card key={t.id} style={styles.traineeCard}>
            <TraineeArt trainee={t}>
              <Text style={styles.flag}>{t.flag}</Text>
              <View style={styles.imageFooter}>
                <View style={styles.rowBetweenEnd}>
                  <View>
                    <Text style={styles.name}>{t.name}</Text>
                    <Text style={styles.sub}>
                      {t.nationality} · {t.age}
                    </Text>
                  </View>
                  <View style={styles.potential}>
                    <Sparkles size={12} color={colors.tealBright} />
                    <Text style={styles.potentialText}> {t.potential}</Text>
                  </View>
                </View>
              </View>
            </TraineeArt>
            <View style={styles.info}>
              <InfoRow k="Skill" v={t.skill} />
              <InfoRow k="Gender" v={t.gender === 'male' ? 'Male' : 'Female'} />
              <InfoRow k="Full Name" v={t.fullName ?? t.name} />
              <InfoRow k="Date of Birth" v={t.dob ?? 'Auto-assigned on recruit'} />
              <InfoRow k="Archetype" v={t.personalityProfile?.archetype ?? 'All-Rounder'} />
              <InfoRow k="Languages" v={t.languages.join(', ')} />
              <InfoRow k="Personality" v={t.personality} />
              <InfoRow k="Dominance" v={`${t.personalityProfile?.dominance ?? 55}`} />
              <InfoRow k="Cost" v={fmt(t.cost)} c={colors.tealBright} />
            </View>
            <TouchableOpacity style={styles.recruitBtn} onPress={() => handleRecruit(t.id)} activeOpacity={0.8}>
              <UserPlus size={14} color={colors.slate900} />
              <Text style={styles.recruitText}> Recruit</Text>
            </TouchableOpacity>
          </Card>
        ))}
        {list.length === 0 && (
          <Card>
            <Text style={styles.emptyText}>No visible trainees for this filter this week.</Text>
            <TouchableOpacity style={styles.emptyRefreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
              <Text style={styles.emptyRefreshText}>Reroll Candidates</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>

      <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Sparkles size={28} color={colors.tealBright} />
            <Text style={styles.modalTitle}>Welcome, {confirm}</Text>
            <Text style={styles.modalBody}>Trainee added to your roster. Budget updated.</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => setConfirm(null)} activeOpacity={0.8}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={error !== null} transparent animationType="fade" onRequestClose={() => setError(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Recruitment failed</Text>
            <Text style={styles.modalBody}>{error}</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => setError(null)} activeOpacity={0.8}>
              <Text style={styles.continueText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

function TraineeArt({
  trainee,
  children,
}: {
  trainee: ReturnType<typeof useGame>['trainees'][number];
  children: ReactNode;
}) {
  const imageAspectRatio = resolveImageAspectRatio(trainee.image);

  return (
    <View style={[styles.image, { aspectRatio: imageAspectRatio }]}>
      {trainee.image ? (
        <Image source={trainee.image} resizeMode="contain" style={styles.imagePhoto} />
      ) : (
        <Text style={styles.emptyArtText}>{trainee.name}</Text>
      )}
      <View style={styles.imageShade} />
      {children}
    </View>
  );
}

function InfoRow({ k, v, c }: { k: string; v: string; c?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{k}</Text>
      <Text style={[styles.infoVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },

  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingHorizontal: 10, paddingVertical: 4 },
  filterActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  filterText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  filterTextActive: { color: colors.tealBright },
  refreshBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  refreshBtnText: { fontSize: 11, fontWeight: '700', color: colors.tealBright },

  grid: { gap: spacing.md },
  traineeCard: {},
  image: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,10,18,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePhoto: {
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
  emptyArtText: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  imageShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 2,
  },
  flag: { position: 'absolute', right: 8, top: 6, fontSize: 18, zIndex: 3 },
  imageFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  sub: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  potential: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, backgroundColor: colors.black40, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  potentialText: { fontSize: 10, fontWeight: '700', color: colors.tealBright },

  info: { marginTop: spacing.sm, gap: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoKey: { fontSize: 11, color: colors.mutedForeground },
  infoVal: { fontSize: 11, fontWeight: '600', color: colors.foreground },

  recruitBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
  },
  recruitText: { fontSize: 12, fontWeight: '700', color: colors.slate900 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(20,23,34,0.98)',
    padding: spacing.xl,
  },
  modalTitle: { marginTop: spacing.sm, fontSize: 20, fontWeight: '900', color: colors.tealBright },
  modalBody: { marginTop: 4, fontSize: 12, color: colors.mutedForeground, textAlign: 'center' },
  continueBtn: { marginTop: spacing.lg, width: '100%', alignItems: 'center', borderRadius: radius.lg, backgroundColor: colors.teal, paddingVertical: spacing.sm },
  continueText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
  emptyText: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center' },
  emptyRefreshBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  emptyRefreshText: { fontSize: 12, fontWeight: '700', color: colors.tealBright },
});
