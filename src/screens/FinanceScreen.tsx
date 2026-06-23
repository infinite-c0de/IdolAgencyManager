import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { AreaChart, ResponsiveChart } from '../components/charts';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricGrid } from '../components/ui/MetricGrid';
import { getCityByName } from '../features/cities';
import {
  calculateTotalFanbase,
  formatCompactCount,
  selectFinanceSummary,
  selectProfitLossSeries,
} from '../features/economy';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const COST_COLORS: Record<string, string> = {
  Training: colors.teal,
  Promotion: colors.violetBright,
  Recruitment: colors.mint,
  Release: colors.amber,
  Operations: '#FDA4AF',
  Other: colors.mutedForeground,
};

export function FinanceScreen() {
  const { agency, cities, revenueHistory, transactions, idols, groups } = useGame();
  const city = getCityByName(cities, agency.city);
  const pl = selectProfitLossSeries(revenueHistory);
  const { income, expense, net } = selectFinanceSummary(agency, city, transactions);
  const fanbase = calculateTotalFanbase(idols, groups);
  const costs = useMemo(() => {
    const expenseTransactions = transactions.filter(transaction => transaction.amount < 0);
    const total = Math.abs(
      expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    );
    if (total <= 0) {
      return [
        { l: 'Training', v: 0, c: COST_COLORS.Training },
        { l: 'Promotion', v: 0, c: COST_COLORS.Promotion },
        { l: 'Recruitment', v: 0, c: COST_COLORS.Recruitment },
        { l: 'Release', v: 0, c: COST_COLORS.Release },
        { l: 'Operations', v: 0, c: COST_COLORS.Operations },
      ];
    }

    const bucketTotals: Record<string, number> = {
      Training: 0,
      Promotion: 0,
      Recruitment: 0,
      Release: 0,
      Operations: 0,
      Other: 0,
    };

    expenseTransactions.forEach(transaction => {
      const label = transaction.label.toLowerCase();
      const amount = Math.abs(transaction.amount);
      if (label.includes('training')) bucketTotals.Training += amount;
      else if (label.includes('promotion') || label.includes('promo')) bucketTotals.Promotion += amount;
      else if (label.includes('recruit')) bucketTotals.Recruitment += amount;
      else if (label.includes('release') || label.includes('production')) bucketTotals.Release += amount;
      else if (label.includes('operation') || label.includes('tax')) bucketTotals.Operations += amount;
      else bucketTotals.Other += amount;
    });

    return Object.entries(bucketTotals)
      .map(([l, amount]) => ({
        l,
        v: Math.round((amount / total) * 100),
        c: COST_COLORS[l] ?? COST_COLORS.Other,
      }))
      .filter(item => item.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);
  }, [transactions]);

  return (
    <AppShell title="Finance" subtitle="Numbers that move the agency">
      <Card glow="teal">
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>{fmt(agency.money)}</Text>
          </View>
          <Wallet size={32} color={colors.tealBright} />
        </View>
        <MetricGrid style={styles.kpiRow}>
          <MetricCard
            label="Income"
            value={fmt(income)}
            valueColor={colors.mint}
            containerStyle={styles.kpiCard}
          />
          <MetricCard
            label="Expenses"
            value={fmt(expense)}
            valueColor="#FDA4AF"
            containerStyle={styles.kpiCard}
          />
          <MetricCard
            label="Net"
            value={fmt(net)}
            valueColor={colors.tealBright}
            containerStyle={styles.kpiCard}
          />
          <MetricCard
            label="Fanbase"
            value={formatCompactCount(fanbase)}
            valueColor={colors.violetBright}
            containerStyle={styles.kpiCard}
          />
        </MetricGrid>
      </Card>

      <Card>
        <SectionTitle>PROFIT / LOSS</SectionTitle>
        <ResponsiveChart height={176}>
          {width => <AreaChart width={width} data={pl} xKey="m" yKey="profit" />}
        </ResponsiveChart>
      </Card>

      <Card>
        <SectionTitle>COST BREAKDOWN</SectionTitle>
        <View style={styles.costList}>
          {costs.map(r => (
            <View key={r.l}>
              <View style={styles.rowBetween}>
                <Text style={styles.costLabel}>{r.l}</Text>
                <Text style={styles.costPct}>{r.v}%</Text>
              </View>
              <View style={styles.costTrack}>
                <View style={[styles.costFill, { width: `${r.v}%`, backgroundColor: r.c }]} />
              </View>
            </View>
          ))}
          {costs.length === 0 && <Text style={styles.tinyMuted}>No expense transactions recorded yet.</Text>}
        </View>
      </Card>

      <Card>
        <SectionTitle>TRANSACTIONS</SectionTitle>
        <View>
          {transactions.length === 0 ? (
            <Text style={styles.tinyMuted}>No transactions yet. Run weekly actions to generate records.</Text>
          ) : (
            transactions.map((t, idx) => (
              <View
                key={t.id}
                style={[styles.txn, idx < transactions.length - 1 && styles.txnDivider]}>
                <View style={[styles.txnIcon, t.type === 'income' ? styles.txnIncome : styles.txnExpense]}>
                  {t.type === 'income' ? (
                    <ArrowUpRight size={16} color={colors.mint} />
                  ) : (
                    <ArrowDownRight size={16} color="#FDA4AF" />
                  )}
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.txnLabel} numberOfLines={1}>
                    {t.label}
                  </Text>
                  <Text style={styles.tinyMuted}>{t.date}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: t.amount > 0 ? colors.mint : '#FDA4AF' }]}>
                  {t.amount > 0 ? '+' : ''}
                  {fmt(t.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  balanceValue: { fontSize: 28, fontWeight: '900', color: colors.tealBright },
  kpiRow: { marginTop: spacing.md, flexWrap: 'nowrap' },
  kpiCard: { flex: 1, flexBasis: undefined },

  costList: { gap: spacing.sm },
  costLabel: { fontSize: 11, color: colors.foreground },
  costPct: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  costTrack: { marginTop: 4, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  costFill: { height: '100%' },

  txn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  txnDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  txnIcon: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  txnIncome: { backgroundColor: 'rgba(52,211,153,0.15)' },
  txnExpense: { backgroundColor: 'rgba(251,113,133,0.15)' },
  txnLabel: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  txnAmount: { fontSize: 14, fontWeight: '700' },
});
