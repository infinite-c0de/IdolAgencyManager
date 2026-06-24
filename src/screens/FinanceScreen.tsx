import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { LineChart, ResponsiveChart, lineColors } from '../components/charts';
import { getCityByName } from '../features/cities';
import {
  calculateTotalFanbase,
  selectFinanceSummary,
  selectFinanceHealth,
  selectRunwayWeeks,
} from '../features/economy';
import { fmtCount } from '../utils/format';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt } from '../utils/format';

// ── constants ─────────────────────────────────────────────────────────────────

const COST_COLORS: Record<string, string> = {
  Training:    colors.teal,
  Promotion:   colors.violetBright,
  Recruitment: colors.mint,
  Release:     colors.amber,
  Operations:  colors.hotSoft,
  Other:       colors.mutedForeground,
};

const HEALTH_CONFIG = {
  healthy:  { label: 'Healthy',  color: colors.mint,    icon: TrendingUp   },
  deficit:  { label: 'Deficit',  color: colors.amber,   icon: Minus        },
  critical: { label: 'Critical', color: colors.hotSoft, icon: TrendingDown },
};

// ── helper ────────────────────────────────────────────────────────────────────

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

// ── screen ────────────────────────────────────────────────────────────────────

export function FinanceScreen() {
  const { agency, cities, revenueHistory, transactions, idols, groups } = useGame();
  const city    = getCityByName(cities, agency.city);
  const { income, expense, net, weekly } = selectFinanceSummary(agency, city, transactions);
  const health  = selectFinanceHealth(net, agency.money);
  const runway  = selectRunwayWeeks(agency.money, net);
  const fanbase = calculateTotalFanbase(idols, groups);

  // ── revenue sources (what actually drives income) ──────────────────────────
  const revSources = useMemo(() => {
    // Group: sum of group.monthlyRevenue / 4 = weekly
    const groupWeekly = Math.round(
      groups.reduce((s, g) => s + g.monthlyRevenue, 0) / 4,
    );
    // Solo: only ungrouped idols count
    const ungrouped   = idols.filter(i => !i.group).length;
    const soloWeekly  = ungrouped * 2_200_000;
    // Merch: active groups, popularity × synergy × members × factor
    const merchWeekly = groups
      .filter(g => g.status === 'Active')
      .reduce((s, g) => {
        const memberCount = idols.filter(i => g.memberIds.includes(i.id)).length;
        return s + Math.round(
          (g.popularity / 100) * (g.synergy / 100) * Math.max(memberCount, 1) * 2_500_000,
        );
      }, 0);
    const total = groupWeekly + soloWeekly + merchWeekly;
    return [
      { key: 'Group', weekly: groupWeekly,  color: lineColors.group, pct: pct(groupWeekly, total)  },
      { key: 'Solo',  weekly: soloWeekly,   color: lineColors.solo,  pct: pct(soloWeekly,  total)  },
      { key: 'Merch', weekly: merchWeekly,  color: lineColors.merch, pct: pct(merchWeekly, total)  },
    ];
  }, [groups, idols]);


  // ── target monthly income (what income is trending toward) ─────────────────
  const groupsRevTotal = groups.reduce((s, g) => s + g.monthlyRevenue, 0);
  const targetMonthly  = Math.max(
    18_000_000,
    Math.round(groupsRevTotal * 0.78 + idols.length * 3_800_000),
  );

  // ── cost breakdown ─────────────────────────────────────────────────────────
  const costs = useMemo(() => {
    const expTxns = transactions.filter(t => t.amount < 0);
    const total   = expTxns.reduce((s, t) => s + Math.abs(t.amount), 0);
    if (total <= 0) return [];
    const buckets: Record<string, number> = {
      Training: 0, Promotion: 0, Recruitment: 0, Release: 0, Operations: 0, Other: 0,
    };
    expTxns.forEach(t => {
      const l = t.label.toLowerCase();
      const a = Math.abs(t.amount);
      if (l.includes('training'))                              buckets.Training    += a;
      else if (l.includes('promotion') || l.includes('promo')) buckets.Promotion  += a;
      else if (l.includes('recruit'))                          buckets.Recruitment += a;
      else if (l.includes('release') || l.includes('production')) buckets.Release += a;
      else if (l.includes('operation') || l.includes('tax'))   buckets.Operations += a;
      else                                                      buckets.Other      += a;
    });
    return Object.entries(buckets)
      .map(([l, amt]) => ({ l, v: pct(amt, total), c: COST_COLORS[l] ?? COST_COLORS.Other }))
      .filter(r => r.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);
  }, [transactions]);

  const hCfg       = HEALTH_CONFIG[health];
  const HealthIcon = hCfg.icon;
  const runwayLabel = runway === Infinity ? '∞ profitable' : `${runway} wk runway`;

  return (
    <AppShell title="Finance" subtitle="Agency ledger">

      {/* ── 1. Balance + health ───────────────────────────── */}
      <Card glow="teal">
        <View style={styles.balRow}>
          <View>
            <Text style={styles.balLabel}>BALANCE</Text>
            <Text style={styles.balValue}>{fmt(agency.money)}</Text>
            <View style={styles.incomeRow}>
              <Text style={styles.incomeLabel}>Monthly income </Text>
              <Text style={styles.incomeValue}>{fmt(agency.monthlyIncome)}</Text>
              {targetMonthly !== agency.monthlyIncome && (
                <Text style={styles.incomeTarget}> → {fmt(targetMonthly)}</Text>
              )}
            </View>
          </View>
          <View style={styles.balRight}>
            <View style={[styles.healthBadge, { borderColor: hCfg.color }]}>
              <HealthIcon size={12} color={hCfg.color} />
              <Text style={[styles.healthText, { color: hCfg.color }]}>{hCfg.label}</Text>
            </View>
            <Text style={styles.runwayText}>{runwayLabel}</Text>
            <Text style={styles.fanbaseText}>{fmtCount(fanbase)} fans</Text>
          </View>
        </View>
      </Card>

      {/* ── 2. Weekly income statement ────────────────────── */}
      <Card>
        <SectionTitle>WEEKLY INCOME STATEMENT</SectionTitle>
        <View style={styles.statementRow}>
          <StatementCol
            label="GROSS"
            value={fmt(weekly.grossWeekly + weekly.transactionIncomeWeekly)}
            color={colors.mint}
          />
          <StatementDivider label="−" />
          <StatementCol label="TAX"  value={fmt(weekly.taxWeekly)}        color={colors.hotSoft} />
          <StatementDivider label="−" />
          <StatementCol label="OPS"  value={fmt(weekly.operationsWeekly)} color={colors.amber}   />
          <StatementDivider label="=" />
          <StatementCol
            label="NET"
            value={fmt(net)}
            color={net >= 0 ? colors.tealBright : colors.hotSoft}
            bold
          />
        </View>
        <View style={styles.statementMeta}>
          <Text style={styles.metaText}>Income  {fmt(income)}</Text>
          <Text style={styles.metaText}>Expenses  {fmt(expense)}</Text>
        </View>
      </Card>

      {/* ── 3. Revenue sources (real breakdown) ───────────── */}
      <Card>
        <SectionTitle>REVENUE SOURCES  <Text style={styles.sectionNote}>per week</Text></SectionTitle>
        <View style={styles.srcList}>
          {revSources.map(s => (
            <View key={s.key} style={styles.srcRow}>
              <View style={[styles.srcDot, { backgroundColor: s.color }]} />
              <Text style={styles.srcKey}>{s.key}</Text>
              <View style={styles.srcBarWrap}>
                <View style={[styles.srcBar, { width: `${s.pct}%`, backgroundColor: s.color + '55' }]}>
                  <View style={[styles.srcBarFill, { backgroundColor: s.color }]} />
                </View>
              </View>
              <Text style={[styles.srcPct, { color: s.color }]}>{s.pct}%</Text>
              <Text style={styles.srcAmt}>{fmt(s.weekly)}</Text>
            </View>
          ))}
        </View>
        {revSources.every(s => s.weekly === 0) && (
          <Text style={styles.muted}>
            Form an Active group to generate meaningful revenue. Solo idols add ₩2.2M/wk each.
          </Text>
        )}
      </Card>

      {/* ── 4. Revenue streams chart ──────────────────────── */}
      <Card>
        <SectionTitle>REVENUE HISTORY</SectionTitle>
        <ResponsiveChart height={220}>
          {w => (
            <LineChart
              width={w}
              height={220}
              data={revenueHistory}
              xKey="m"
              series={[
                { key: 'group', color: lineColors.group, label: 'Group' },
                { key: 'solo',  color: lineColors.solo,  label: 'Solo'  },
                { key: 'merch', color: lineColors.merch, label: 'Merch' },
              ]}
            />
          )}
        </ResponsiveChart>
      </Card>

      {/* ── 6. Cost breakdown ─────────────────────────────── */}
      {costs.length > 0 && (
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
          </View>
        </Card>
      )}

      {/* ── 7. City operating profile ─────────────────────── */}
      <Card>
        <SectionTitle>CITY OPERATING PROFILE</SectionTitle>
        <View style={styles.cityRow}>
          <Text style={styles.cityFlag}>{city.flag}</Text>
          <View style={styles.flex1}>
            <View style={styles.rowBetween}>
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={[styles.cityDiff, diffColor(city.difficulty)]}>{city.difficulty}</Text>
            </View>
            <View style={styles.cityGrid}>
              <CityChip label="Tax"         value={`${Math.round(city.taxRate * 100)}%`} />
              <CityChip label="Rent/wk"     value={fmt(city.officeRentWeekly)} />
              <CityChip label="Rev ×"       value={city.revenue.toFixed(1)} />
              <CityChip label="Competition" value={`${city.competition}%`} />
              <CityChip label="Fan ×"       value={city.fan.toFixed(2)} />
              <CityChip label="Streaming"   value={`+${Math.round(city.domesticStreamingBonus * 100)}%`} />
            </View>
          </View>
        </View>
      </Card>

      {/* ── 8. Transactions ───────────────────────────────── */}
      <Card>
        <SectionTitle>TRANSACTIONS</SectionTitle>
        {transactions.length === 0 ? (
          <Text style={styles.muted}>No transactions yet.</Text>
        ) : (
          transactions.map((t, idx) => (
            <View
              key={t.id}
              style={[styles.txn, idx < transactions.length - 1 && styles.txnDivider]}>
              <View style={[styles.txnIcon, t.type === 'income' ? styles.txnIncome : styles.txnExpense]}>
                {t.type === 'income'
                  ? <ArrowUpRight   size={16} color={colors.mint}    />
                  : <ArrowDownRight size={16} color={colors.hotSoft} />}
              </View>
              <View style={styles.flex1}>
                <Text style={styles.txnLabel} numberOfLines={1}>{t.label}</Text>
                <Text style={styles.muted}>{t.date}</Text>
              </View>
              <Text style={[styles.txnAmt, { color: t.amount > 0 ? colors.mint : colors.hotSoft }]}>
                {t.amount > 0 ? '+' : ''}{fmt(t.amount)}
              </Text>
            </View>
          ))
        )}
      </Card>

    </AppShell>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatementCol({ label, value, color, bold }: {
  label: string; value: string; color: string; bold?: boolean;
}) {
  return (
    <View style={styles.stCol}>
      <Text style={styles.stLabel}>{label}</Text>
      <Text style={[styles.stValue, { color }, bold && styles.stBold]}>{value}</Text>
    </View>
  );
}

function StatementDivider({ label }: { label: string }) {
  return <Text style={styles.stDivider}>{label}</Text>;
}

function CityChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function diffColor(diff: string) {
  if (diff === 'Easy')   return { color: colors.mint };
  if (diff === 'Medium') return { color: colors.amber };
  return { color: colors.hotSoft };
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex1:       { flex: 1, minWidth: 0 },
  rowBetween:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted:       { fontSize: 11, color: colors.mutedForeground, lineHeight: 17 },
  sectionNote: { fontSize: 9, fontWeight: '400', color: colors.mutedForeground, letterSpacing: 0 },

  // Balance card
  balRow:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  balLabel:     { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.mutedForeground },
  balValue:     { fontSize: 30, fontWeight: '900', color: colors.tealBright, marginTop: 2 },
  incomeRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  incomeLabel:  { fontSize: 10, color: colors.mutedForeground },
  incomeValue:  { fontSize: 10, fontWeight: '700', color: colors.foreground },
  incomeTarget: { fontSize: 10, color: colors.teal },
  balRight:     { alignItems: 'flex-end', gap: 6 },
  healthBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4,
                  borderWidth: 1, borderRadius: radius.full,
                  paddingHorizontal: 8, paddingVertical: 3 },
  healthText:   { fontSize: 11, fontWeight: '700' },
  runwayText:   { fontSize: 11, color: colors.mutedForeground },
  fanbaseText:  { fontSize: 11, color: colors.mutedForeground },

  // Weekly statement
  statementRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  stCol:        { flex: 1, alignItems: 'center' },
  stLabel:      { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: colors.mutedForeground, marginBottom: 2 },
  stValue:      { fontSize: 11, fontWeight: '700' },
  stBold:       { fontSize: 13, fontWeight: '900' },
  stDivider:    { fontSize: 12, color: colors.mutedForeground, paddingHorizontal: 2 },
  statementMeta:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm,
                  paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  metaText:     { fontSize: 10, color: colors.mutedForeground },

  // Revenue sources
  srcList:    { gap: 10, marginTop: spacing.xs },
  srcRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  srcDot:     { width: 8, height: 8, borderRadius: radius.full, flexShrink: 0 },
  srcKey:     { fontSize: 11, fontWeight: '700', color: colors.foreground, width: 42 },
  srcBarWrap: { flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA05, overflow: 'hidden' },
  srcBar:     { height: '100%', borderRadius: radius.full, overflow: 'hidden' },
  srcBarFill: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, borderRadius: radius.full },
  srcPct:     { fontSize: 10, fontWeight: '700', width: 30, textAlign: 'right' },
  srcAmt:     { fontSize: 11, fontWeight: '700', color: colors.foreground, width: 72, textAlign: 'right' },

  // Cost breakdown
  costList:  { gap: spacing.sm },
  costLabel: { fontSize: 11, color: colors.foreground },
  costPct:   { fontSize: 11, fontWeight: '600', color: colors.foreground },
  costTrack: { marginTop: 4, height: 6, borderRadius: radius.full, backgroundColor: colors.whiteA10, overflow: 'hidden' },
  costFill:  { height: '100%' },

  // City profile
  cityRow:  { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginTop: spacing.xs },
  cityFlag: { fontSize: 28, lineHeight: 32 },
  cityName: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  cityDiff: { fontSize: 11, fontWeight: '700' },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  chip:     { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md,
               paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  chipLabel:{ fontSize: 8, fontWeight: '700', letterSpacing: 0.8, color: colors.mutedForeground },
  chipValue:{ fontSize: 11, fontWeight: '700', color: colors.foreground, marginTop: 1 },

  // Transactions
  txn:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  txnDivider:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  txnIcon:   { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  txnIncome: { backgroundColor: 'rgba(52,211,153,0.15)' },
  txnExpense:{ backgroundColor: 'rgba(251,113,133,0.15)' },
  txnLabel:  { fontSize: 12, fontWeight: '600', color: colors.foreground },
  txnAmt:    { fontSize: 14, fontWeight: '700' },
});
