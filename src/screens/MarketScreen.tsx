import { TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricGrid } from '../components/ui/MetricGrid';
import { getCityByName } from '../features/cities';
import { selectMarketByRegion } from '../features/economy';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

const toneColor: Record<string, string> = {
  mint: colors.mint,
  hot: '#FDA4AF',
  violet: colors.violetBright,
  teal: colors.tealBright,
};

export function MarketScreen() {
  const { cities, markets, opportunities, agency } = useGame();
  const [tab, setTab] = useState(markets[0].region);
  const homeCity = getCityByName(cities, agency.city);
  const selectedMarket = selectMarketByRegion(markets, tab);

  return (
    <AppShell title="Market Pulse" subtitle="City modifiers and regional demand">
      <Card glow="teal">
        <SectionTitle>{`HOME · ${homeCity.name.toUpperCase()}`}</SectionTitle>
        <Text style={styles.desc}>{homeCity.desc}</Text>
        <MetricGrid style={styles.modRow}>
          <MetricCard label="Fan Growth" value={`x${homeCity.fan}`} valueColor={colors.mint} />
          <MetricCard label="Costs" value={`x${homeCity.cost}`} valueColor="#FDA4AF" />
          <MetricCard label="Revenue" value={`x${homeCity.revenue}`} valueColor={colors.tealBright} />
          <MetricCard label="Competition" value={`${homeCity.competition}%`} valueColor={colors.violetBright} />
        </MetricGrid>
      </Card>

      <Card>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
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
        </ScrollView>
        {selectedMarket ? (
          <MetricGrid style={styles.bigRow}>
            <MetricCard
              label="Fans"
              value={selectedMarket.fans}
              containerStyle={styles.bigMetric}
              labelStyle={styles.bigLabel}
              valueStyle={styles.bigVal}
            />
            <MetricCard
              label="Revenue"
              value={selectedMarket.revenue}
              containerStyle={styles.bigMetric}
              labelStyle={styles.bigLabel}
              valueStyle={styles.bigVal}
            />
            <MetricCard
              label="Chart"
              value={selectedMarket.rank}
              containerStyle={styles.bigMetric}
              labelStyle={styles.bigLabel}
              valueStyle={styles.bigVal}
            />
            <MetricCard
              label="Trend"
              value={selectedMarket.trend}
              valueColor={colors.mint}
              containerStyle={styles.bigMetric}
              labelStyle={styles.bigLabel}
              valueStyle={styles.bigVal}
            />
          </MetricGrid>
        ) : null}
      </Card>

      <Card>
        <SectionTitle>OPPORTUNITIES</SectionTitle>
        <View style={styles.list}>
          {opportunities.map(o => {
            const c = toneColor[o.tone];
            return (
              <View key={o.text} style={[styles.opp, { borderColor: c + '66' }]}>
                <TrendingUp size={16} color={c} />
                <View style={styles.flex1}>
                  <Text style={[styles.oppRegion, { color: c }]}>{o.region}</Text>
                  <Text style={styles.oppText}>{o.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  desc: { fontSize: 11, color: colors.mutedForeground },

  modRow: { marginTop: spacing.md },

  tabRow: { gap: spacing.sm },
  tab: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  tabIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  tabActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  tabTextActive: { color: colors.tealBright },

  bigRow: { marginTop: spacing.md },
  bigMetric: { flexGrow: 1, flexBasis: '46%', padding: spacing.md },
  bigLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  bigVal: { fontSize: 18, fontWeight: '700', color: colors.foreground },

  list: { gap: spacing.sm },
  opp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.whiteA04,
    padding: spacing.md,
  },
  oppRegion: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  oppText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
});
