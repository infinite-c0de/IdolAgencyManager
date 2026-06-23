import { BarChart3, Megaphone, Search, ShieldAlert, Swords } from 'lucide-react-native';
import React, { ComponentType } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card, SectionTitle } from '../components/AppShell';
import { selectRivalFeed, selectRivalIntel } from '../features/simulation';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type IconType = ComponentType<{ size?: number; color?: string }>;

const feedColor: Record<string, string> = {
  hot: colors.hotSoft,
  mint: colors.mint,
  teal: colors.tealBright,
  violet: colors.violetBright,
};

export function RivalsScreen() {
  const { agency, groups, idols } = useGame();
  const rivals = selectRivalIntel(agency, groups, idols);
  const feed = selectRivalFeed(agency, groups, idols);
  return (
    <AppShell title="Rival Agencies" subtitle="Event-driven market intel">
      {rivals.map(r => {
        const tone =
          r.threat === 'High'
            ? styles.threatHigh
            : r.threat === 'Medium'
            ? styles.threatMed
            : styles.threatLow;
        const toneText =
          r.threat === 'High' ? colors.hotSoft : r.threat === 'Medium' ? colors.amber : colors.mint;
        return (
          <Card key={r.id}>
            <View style={styles.headerRow}>
              <View style={styles.flex1}>
                <Text style={styles.rivalName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.tinyMuted}>{r.recent}</Text>
              </View>
              <View style={[styles.threatBadge, tone]}>
                <ShieldAlert size={12} color={toneText} />
                <Text style={[styles.threatText, { color: toneText }]}> {r.threat}</Text>
              </View>
            </View>
            <View style={styles.miniRow}>
              <Mini label="Reputation" v={`${r.reputation}`} />
              <Mini label="Groups" v={`${r.groups}`} />
              <Mini label="Share" v={`${r.share}%`} />
            </View>
            <View style={styles.actRow}>
              <Act Icon={BarChart3} t="Compare" />
              <Act Icon={Search} t="Details" />
              <Act Icon={Megaphone} t="Counter" />
              <Act Icon={Swords} t="Scout" />
            </View>
          </Card>
        );
      })}

      <Card glow="violet">
        <SectionTitle>EVENT FEED</SectionTitle>
        <View style={styles.list}>
          {feed.map(e => (
            <View key={e.t} style={styles.feedItem}>
              <View style={[styles.feedDot, { backgroundColor: feedColor[e.tone] }]} />
              <View style={styles.flex1}>
                <Text style={styles.feedText}>{e.t}</Text>
                <Text style={styles.tinyMuted}>{e.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </AppShell>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.tinyMuted}>{label}</Text>
      <Text style={styles.miniValue}>{v}</Text>
    </View>
  );
}

function Act({ Icon, t }: { Icon: IconType; t: string }) {
  return (
    <TouchableOpacity style={styles.act} activeOpacity={0.7}>
      <Icon size={14} color={colors.foreground} />
      <Text style={styles.actText}>{t}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  rivalName: { fontSize: 20, fontWeight: '900', color: colors.tealBright },
  threatBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  threatHigh: { borderColor: 'rgba(251,113,133,0.5)' },
  threatMed: { borderColor: 'rgba(252,211,77,0.5)' },
  threatLow: { borderColor: 'rgba(52,211,153,0.5)' },
  threatText: { fontSize: 10, fontWeight: '700' },

  miniRow: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  mini: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  miniValue: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  actRow: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  act: {
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingVertical: spacing.sm,
  },
  actText: { fontSize: 11, fontWeight: '600', color: colors.foreground },

  list: { gap: spacing.sm },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    padding: spacing.md,
  },
  feedDot: { marginTop: 5, width: 8, height: 8, borderRadius: radius.full },
  feedText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
});
