import { ChevronRight, FileText, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARCHETYPE_COLOR, TRAIT_LABELS } from '../ui/idolConstants';
import { AgencyLogoMark } from '../ui/AgencyLogoMark';
import { StatBar } from '../ui/StatBar';
import { colors, radius, spacing } from '../../theme';
import type { Group, Idol } from '../../types';
import { fmt } from '../../utils/format';

function formatTrainingMonths(months: number): string {
  const m = Math.max(0, Math.round(months));
  if (m < 12) return `${m}mo`;
  const y = Math.floor(m / 12);
  const rem = m % 12;
  return rem === 0 ? `${y}y` : `${y}y ${rem}m`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal}>{value}</Text>
    </View>
  );
}

type Props = {
  idol: Idol;
  idolGroup: Group | undefined;
  currentWeek: number;
  onGroupPress: () => void;
  onRenewContract: () => void;
};

export function ProfileTab({ idol, idolGroup, currentWeek, onGroupPress, onRenewContract }: Props) {
  const archetype = idol.personalityProfile?.archetype ?? 'All-Rounder';
  const dominance = idol.personalityProfile?.dominance ?? 55;
  const archetypeColor = ARCHETYPE_COLOR[archetype] ?? colors.mutedForeground;
  const traits = idol.personalityProfile?.traits;
  const genderSymbol = idol.gender === 'male' ? '♂' : idol.gender === 'female' ? '♀' : '—';
  const genderLabel = idol.gender ? `${genderSymbol} ${idol.gender.charAt(0).toUpperCase() + idol.gender.slice(1)}` : '—';

  return (
    <View style={styles.container}>

      {/* ── Identity ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IDENTITY</Text>
        <View style={styles.infoList}>
          <InfoRow label="FULL NAME" value={idol.fullName} />
          <InfoRow label="NATIONALITY" value={`${idol.flag} ${idol.nationality}`} />
          <InfoRow label="AGE / DOB" value={`${idol.age} yr  ·  ${idol.dob}`} />
          <InfoRow label="GENDER" value={genderLabel} />
          <InfoRow label="LANGUAGES" value={idol.languages.join(' · ')} />
          <InfoRow label="TRAINING" value={formatTrainingMonths(idol.trainingMonths)} />
        </View>
      </View>

      {/* ── Personality ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PERSONALITY</Text>

        <View style={styles.archetypeRow}>
          <View style={[styles.archetypePill, { borderColor: archetypeColor + '44', backgroundColor: archetypeColor + '18' }]}>
            <Text style={[styles.archetypeLabel, { color: archetypeColor }]}>
              {archetype}  {dominance}
            </Text>
          </View>
          <View style={[styles.personalityPill, { borderColor: colors.border }]}>
            <Text style={styles.personalityText}>{idol.personality}</Text>
          </View>
        </View>

        {traits && (
          <View style={styles.traitList}>
            {(Object.keys(TRAIT_LABELS) as Array<keyof typeof TRAIT_LABELS>).map(key => {
              const val = (traits as Record<string, number>)[key];
              if (val == null) return null;
              return (
                <StatBar
                  key={key}
                  label={TRAIT_LABELS[key].toUpperCase()}
                  value={val}
                  color={archetypeColor}
                  labelWidth={104}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* ── Group ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GROUP</Text>

        {idolGroup ? (
          <TouchableOpacity style={styles.groupBlock} onPress={onGroupPress} activeOpacity={0.75}>
            <AgencyLogoMark
              preset={idolGroup.logo?.kind === 'preset' ? idolGroup.logo.preset : 1}
              size={42}
            />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{idolGroup.name}</Text>
              <View style={styles.groupMeta}>
                <View style={[styles.groupDot, {
                  backgroundColor: idolGroup.status === 'Active' ? colors.mint : colors.mutedForeground,
                }]} />
                <Text style={styles.groupMetaText}>{idolGroup.status}</Text>
                <Text style={styles.groupMetaDivider}>·</Text>
                <Users size={10} color={colors.mutedForeground} />
                <Text style={styles.groupMetaText}>{idolGroup.memberIds.length} members</Text>
              </View>
            </View>
            <View style={[
              styles.groupStatusPill,
              idolGroup.status === 'Active' ? styles.groupStatusActive : styles.groupStatusPre,
            ]}>
              <Text style={[
                styles.groupStatusText,
                idolGroup.status === 'Active' ? styles.groupStatusTextActive : styles.groupStatusTextPre,
              ]}>
                {idolGroup.status === 'Active' ? 'ACTIVE' : 'PRE-DEBUT'}
              </Text>
            </View>
            <ChevronRight size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.soloBlock}>
            <View style={styles.soloIcon}>
              <Text style={styles.soloEmoji}>🎤</Text>
            </View>
            <Text style={styles.soloLabel}>Solo Artist</Text>
          </View>
        )}
      </View>

      {/* ── Contract ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTRACT</Text>
        <ContractBlock
          contractExpiresWeek={idol.contractExpiresWeek}
          popularity={idol.popularity}
          currentWeek={currentWeek}
          onRenew={onRenewContract}
        />
      </View>

    </View>
  );
}

function ContractBlock({
  contractExpiresWeek,
  popularity,
  currentWeek,
  onRenew,
}: {
  contractExpiresWeek: number;
  popularity: number;
  currentWeek: number;
  onRenew: () => void;
}) {
  const weeksLeft = contractExpiresWeek - currentWeek;
  const renewalCost = Math.max(5_000_000, Math.min(50_000_000, Math.round(popularity * 500_000)));

  const statusColor =
    weeksLeft <= 0 ? colors.hot :
      weeksLeft <= 8 ? colors.hotSoft :
        weeksLeft <= 16 ? colors.amber :
          colors.mint;

  const statusLabel =
    weeksLeft <= 0 ? 'EXPIRED' :
      weeksLeft <= 8 ? 'EXPIRING SOON' :
        weeksLeft <= 16 ? 'RENEW SOON' :
          'ACTIVE';

  const expiresLabel = weeksLeft <= 0
    ? 'Contract has expired'
    : `Expires in ${weeksLeft} week${weeksLeft === 1 ? '' : 's'}`;

  return (
    <View style={styles.contractBlock}>
      <View style={styles.contractRow}>
        <View style={styles.contractLeft}>
          <View style={[styles.contractStatusPill, { borderColor: statusColor + '55', backgroundColor: statusColor + '18' }]}>
            <View style={[styles.contractDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.contractStatusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.contractExpiry}>{expiresLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.renewBtn, weeksLeft <= 0 && styles.renewBtnUrgent]}
          onPress={onRenew}
          activeOpacity={0.8}>
          <Text style={styles.renewBtnText}>Renew  {fmt(renewalCost)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  // Section wrapper
  section: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },

  // Identity info rows
  infoList: { gap: 7 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoKey: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'right',
    flexShrink: 1,
  },

  // Personality
  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  archetypePill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  archetypeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  personalityPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: colors.whiteA05,
  },
  personalityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  traitList: {
    gap: 9,
    marginTop: spacing.xs,
  },

  // Group
  groupBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  groupInfo: { flex: 1, gap: 3 },
  groupName: { fontSize: 14, fontWeight: '800', color: colors.foreground },
  groupMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  groupDot: { width: 6, height: 6, borderRadius: radius.full },
  groupMetaText: { fontSize: 10, color: colors.mutedForeground },
  groupMetaDivider: { fontSize: 10, color: colors.mutedForeground },
  groupStatusPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupStatusActive: { borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.08)' },
  groupStatusPre: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  groupStatusText: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  groupStatusTextActive: { color: colors.mint },
  groupStatusTextPre: { color: colors.mutedForeground },

  soloBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
  },
  soloIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soloEmoji: { fontSize: 20 },
  soloLabel: { fontSize: 13, fontWeight: '700', color: colors.mutedForeground },

  // Contract
  contractBlock: { gap: spacing.sm },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  contractLeft: { gap: 5, flex: 1 },
  contractStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contractDot: { width: 5, height: 5, borderRadius: radius.full },
  contractStatusText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  contractExpiry: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  renewBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.5)',
    backgroundColor: 'rgba(52,211,153,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
  },
  renewBtnUrgent: {
    borderColor: 'rgba(239,68,68,0.5)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  renewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mint,
    letterSpacing: 0.2,
  },
});
