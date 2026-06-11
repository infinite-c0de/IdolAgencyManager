import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { AreaChart, ResponsiveChart } from '../components/charts';
import { agency, revenueHistory, transactions } from '../data/mock';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

const pl = revenueHistory.map(r => ({
  m: r.m,
  profit: Math.round(r.group + r.solo + r.merch - 220 - r.solo * 0.4),
}));

const costs = [
  { l: 'Training', v: 28, c: colors.teal },
  { l: 'Promotion', v: 36, c: colors.violetBright },
  { l: 'Recruitment', v: 14, c: colors.mint },
  { l: 'Staff', v: 18, c: colors.amber },
  { l: 'Other', v: 4, c: '#FDA4AF' },
];

export function FinanceScreen() {
  const income = 612_000_000;
  const expense = 442_000_000;
  const net = income - expense;

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
        <View style={styles.kpiRow}>
          <KPI label="Income" v={fmt(income)} c={colors.mint} />
          <KPI label="Expenses" v={fmt(expense)} c="#FDA4AF" />
          <KPI label="Net" v={fmt(net)} c={colors.tealBright} />
        </View>
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
                <View style={[styles.costFill, { width: `${r.v * 2}%`, backgroundColor: r.c }]} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>TRANSACTIONS</SectionTitle>
        <View>
          {transactions.map((t, idx) => (
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
          ))}
        </View>
      </Card>
    </AppShell>
  );
}

function KPI({ label, v, c }: { label: string; v: string; c: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.tinyMuted}>{label}</Text>
      <Text style={[styles.kpiValue, { color: c }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  balanceValue: { fontSize: 28, fontWeight: '900', color: colors.tealBright },
  kpiRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  kpi: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  kpiValue: { fontSize: 14, fontWeight: '700' },

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
