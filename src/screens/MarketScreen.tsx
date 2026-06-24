import { CheckCircle, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricGrid } from '../components/ui/MetricGrid';
import { getCityByName } from '../features/cities';
import { selectMarketByRegion } from '../features/economy';
import { selectMarketOpportunities, selectMarketPulse } from '../features/simulation';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const toneColor: Record<string, string> = {
  mint: colors.mint,
  hot: colors.hotSoft,
  violet: colors.violetBright,
  teal: colors.tealBright,
};

export function MarketScreen() {
  const { cities, agency, idols, groups, takeMarketOpportunity } = useGame();
  const markets = selectMarketPulse(cities, agency, idols, groups);
  const opportunities = selectMarketOpportunities(cities, agency, idols, groups);
  const [tab, setTab] = useState(markets[0]?.region ?? '');
  const homeCity = getCityByName(cities, agency.city);
  const selectedMarket = selectMarketByRegion(markets, tab);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{
    id: string; label: string; cost: number; repGain: number; incomeGain: number;
  } | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMarket && markets[0]) {
      setTab(markets[0].region);
    }
  }, [markets, selectedMarket]);

  const handleTakeOpportunity = () => {
    if (!confirm) return;
    const result = takeMarketOpportunity(confirm.id, confirm.cost, confirm.repGain, confirm.incomeGain);
    setConfirm(null);
    if (!result.ok) {
      setResultMsg('Insufficient funds to take this opportunity.');
      return;
    }
    setTakenIds(prev => new Set([...prev, confirm.id]));
    const parts: string[] = [];
    if (confirm.repGain > 0) parts.push(`+${confirm.repGain} Reputation`);
    if (confirm.incomeGain > 0) parts.push(`+${fmt(confirm.incomeGain)} Income`);
    setResultMsg(`Done! ${parts.join(' · ')}`);
  };

  return (
    <AppShell title="Market Pulse" subtitle="City modifiers and regional demand">
      <Card glow="teal">
        <SectionTitle>{`HOME · ${homeCity.name.toUpperCase()}`}</SectionTitle>
        <Text style={styles.desc}>{homeCity.desc}</Text>
        <MetricGrid style={styles.modRow}>
          <MetricCard label="Fan Growth" value={`x${homeCity.fan}`} valueColor={colors.mint} />
          <MetricCard label="Costs" value={`x${homeCity.cost}`} valueColor={colors.hotSoft} />
          <MetricCard label="Revenue" value={`x${homeCity.revenue}`} valueColor={colors.tealBright} />
          <MetricCard label="Competition" value={`${homeCity.competition}%`} valueColor={colors.violetBright} />
        </MetricGrid>
      </Card>

      <Card>
        <View style={styles.tabRow}>
          {markets.map(m => {
            const active = tab === m.region;
            return (
              <TouchableOpacity
                key={m.region}
                onPress={() => setTab(m.region)}
                style={[styles.tab, active ? styles.tabActive : styles.tabIdle]}
                activeOpacity={0.7}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{m.region}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedMarket ? (
          <MetricGrid style={styles.bigRow}>
            <MetricCard label="Fans" value={selectedMarket.fans} containerStyle={styles.bigMetric} labelStyle={styles.bigLabel} valueStyle={styles.bigVal} />
            <MetricCard label="Revenue" value={selectedMarket.revenue} containerStyle={styles.bigMetric} labelStyle={styles.bigLabel} valueStyle={styles.bigVal} />
            <MetricCard label="Chart" value={selectedMarket.rank} containerStyle={styles.bigMetric} labelStyle={styles.bigLabel} valueStyle={styles.bigVal} />
            <MetricCard label="Trend" value={selectedMarket.trend} valueColor={colors.mint} containerStyle={styles.bigMetric} labelStyle={styles.bigLabel} valueStyle={styles.bigVal} />
          </MetricGrid>
        ) : null}
      </Card>

      <Card>
        <SectionTitle>OPPORTUNITIES</SectionTitle>
        <View style={styles.list}>
          {opportunities.map(o => {
            const c = toneColor[o.tone];
            const taken = takenIds.has(o.id);
            const canAfford = agency.money >= o.actionCost;
            return (
              <View key={o.id} style={[styles.opp, { borderColor: c + '55' }, taken && styles.oppTaken]}>
                <TrendingUp size={16} color={taken ? colors.mutedForeground : c} />
                <View style={styles.flex1}>
                  <Text style={[styles.oppRegion, { color: taken ? colors.mutedForeground : c }]}>{o.region}</Text>
                  <Text style={[styles.oppText, taken && styles.oppTextTaken]}>{o.text}</Text>
                  <View style={styles.actionRow}>
                    {taken ? (
                      <View style={styles.takenBadge}>
                        <CheckCircle size={11} color={colors.mint} />
                        <Text style={styles.takenText}>DONE THIS WEEK</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.costChip}>
                          <Text style={styles.costText}>{fmt(o.actionCost)}</Text>
                        </View>
                        {o.reputationGain > 0 && (
                          <Text style={styles.gainText}>+{o.reputationGain} Rep</Text>
                        )}
                        {o.incomeGain > 0 && (
                          <Text style={[styles.gainText, { color: colors.mint }]}>+{fmt(o.incomeGain)}</Text>
                        )}
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: c + '88', backgroundColor: c + '18' }, !canAfford && styles.actionBtnDisabled]}
                          onPress={() => canAfford && setConfirm({ id: o.id, label: o.actionLabel, cost: o.actionCost, repGain: o.reputationGain, incomeGain: o.incomeGain })}
                          disabled={!canAfford}
                          activeOpacity={0.8}>
                          <Text style={[styles.actionBtnText, { color: canAfford ? c : colors.mutedForeground }]}>
                            {canAfford ? o.actionLabel : 'Need funds'}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Confirm modal */}
      <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirm?.label}</Text>
            <Text style={styles.tinyMuted}>This will immediately deduct funds and apply the effect.</Text>
            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.tinyMuted}>COST</Text>
                <Text style={[styles.modalStatVal, { color: colors.hotSoft }]}>{fmt(confirm?.cost ?? 0)}</Text>
              </View>
              {(confirm?.repGain ?? 0) > 0 && (
                <View style={styles.modalStat}>
                  <Text style={styles.tinyMuted}>REPUTATION</Text>
                  <Text style={[styles.modalStatVal, { color: colors.tealBright }]}>+{confirm?.repGain}</Text>
                </View>
              )}
              {(confirm?.incomeGain ?? 0) > 0 && (
                <View style={styles.modalStat}>
                  <Text style={styles.tinyMuted}>INCOME</Text>
                  <Text style={[styles.modalStatVal, { color: colors.mint }]}>+{fmt(confirm?.incomeGain ?? 0)}</Text>
                </View>
              )}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirm(null)} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleTakeOpportunity} activeOpacity={0.8}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result toast modal */}
      <Modal visible={resultMsg !== null} transparent animationType="fade" onRequestClose={() => setResultMsg(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Opportunity Taken</Text>
            <Text style={styles.resultMsgText}>{resultMsg}</Text>
            <TouchableOpacity style={styles.confirmBtnFull} onPress={() => setResultMsg(null)} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  desc: { fontSize: 11, color: colors.mutedForeground },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
  modRow: { marginTop: spacing.md },

  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  tab: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  tabIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  tabActive: { borderColor: colors.tealActiveBorder, backgroundColor: colors.tealActiveBg },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  tabTextActive: { color: colors.tealBright },

  bigRow: { marginTop: spacing.sm },
  bigMetric: { flexGrow: 1, flexBasis: '46%', padding: spacing.md },
  bigLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  bigVal: { fontSize: 18, fontWeight: '700', color: colors.foreground },

  list: { gap: spacing.sm },
  opp: {
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.whiteA04,
    padding: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  oppTaken: { opacity: 0.6 },
  oppRegion: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  oppText: { fontSize: 12, fontWeight: '600', color: colors.foreground, lineHeight: 17 },
  oppTextTaken: { color: colors.mutedForeground },
  actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  costChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  costText: { fontSize: 10, fontWeight: '700', color: colors.hotSoft },
  gainText: { fontSize: 10, fontWeight: '700', color: colors.tealBright },
  actionBtn: {
    marginLeft: 'auto',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  actionBtnDisabled: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  actionBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  takenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  takenText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: colors.mint },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.lg },
  modalCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(14,18,30,0.98)',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 16, fontWeight: '900', color: colors.tealBright },
  modalStats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  modalStat: { gap: 3 },
  modalStatVal: { fontSize: 16, fontWeight: '800' },
  resultMsgText: { fontSize: 13, fontWeight: '600', color: colors.foreground, lineHeight: 18 },
  modalBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  confirmBtn: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  confirmBtnFull: {
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  confirmText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
