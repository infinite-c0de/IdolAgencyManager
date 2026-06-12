import { TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
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
  const homeCity = cities.find(c => c.name === agency.city) ?? cities[0];

  return (
    <AppShell title="Market Pulse" subtitle="City modifiers and regional demand">
      <Card glow="teal">
        <SectionTitle>{`HOME · ${homeCity.name.toUpperCase()}`}</SectionTitle>
        <Text style={styles.desc}>{homeCity.desc}</Text>
        <View style={styles.modRow}>
          <Mod label="Fan Growth" v={`x${homeCity.fan}`} c={colors.mint} />
          <Mod label="Costs" v={`x${homeCity.cost}`} c="#FDA4AF" />
          <Mod label="Revenue" v={`x${homeCity.revenue}`} c={colors.tealBright} />
          <Mod label="Competition" v={`${homeCity.competition}%`} c={colors.violetBright} />
        </View>
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
        {markets
          .filter(m => m.region === tab)
          .map(m => (
            <View key={m.region} style={styles.bigRow}>
              <Big label="Fans" v={m.fans} />
              <Big label="Revenue" v={m.revenue} />
              <Big label="Chart" v={m.rank} />
              <Big label="Trend" v={m.trend} c={colors.mint} />
            </View>
          ))}
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

function Mod({ label, v, c }: { label: string; v: string; c: string }) {
  return (
    <View style={styles.mod}>
      <Text style={styles.tinyMuted}>{label}</Text>
      <Text style={[styles.modVal, { color: c }]}>{v}</Text>
    </View>
  );
}

function Big({ label, v, c }: { label: string; v: string; c?: string }) {
  return (
    <View style={styles.big}>
      <Text style={styles.bigLabel}>{label}</Text>
      <Text style={[styles.bigVal, c ? { color: c } : null]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
  desc: { fontSize: 11, color: colors.mutedForeground },

  modRow: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mod: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  modVal: { fontSize: 14, fontWeight: '700' },

  tabRow: { gap: spacing.sm },
  tab: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1 },
  tabIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  tabActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  tabTextActive: { color: colors.tealBright },

  bigRow: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  big: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: spacing.md },
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
