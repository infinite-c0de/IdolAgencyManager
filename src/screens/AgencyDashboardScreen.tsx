import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { BarChart, ResponsiveChart, barColors } from '../components/charts';
import { DashboardAgendaStrip } from '../components/dashboard/DashboardAgendaStrip';
import { DashboardBanner } from '../components/dashboard/DashboardBanner';
import { DashboardGroupsStrip } from '../components/dashboard/DashboardGroupsStrip';
import { DashboardPulseStrip } from '../components/dashboard/DashboardPulseStrip';
import { DashboardRosterStrip } from '../components/dashboard/DashboardRosterStrip';
import { DashboardWeekBlock } from '../components/dashboard/DashboardWeekBlock';
import { Gradient } from '../components/ui/Gradient';
import { SESSION_COST, selectDynamicSchedule } from '../features/simulation';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';
import { fmt, aggregateMonthlyRevenue } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;


export function AgencyDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const {
    agency, idols, groups,
    revenueHistory, currentWeek, advanceWeek,
    trainingPlans,
  } = useGame();

  const schedule = selectDynamicSchedule(idols, groups);

  // Weekly training cost + session count
  const { weeklyCost, sessionCount } = useMemo(() => {
    let cost = 0;
    let sessions = 0;
    const groupIdByName = new Map(groups.map(g => [g.name, g.id]));
    for (const idol of idols) {
      const key = idol.group ? groupIdByName.get(idol.group) ?? idol.group : undefined;
      const plan = key
        ? trainingPlans[key] ?? trainingPlans[idol.group ?? ''] ?? trainingPlans.SOLO_DEFAULT ?? {}
        : trainingPlans.SOLO_DEFAULT ?? {};
      for (const typeId of Object.values(plan)) {
        if (typeId) {
          cost += SESSION_COST[typeId] ?? 0;
          sessions += 1;
        }
      }
    }
    return { weeklyCost: cost, sessionCount: sessions };
  }, [trainingPlans, idols, groups]);

  const canAfford = agency.money >= weeklyCost;

  const monthlyHistory = useMemo(() => aggregateMonthlyRevenue(revenueHistory), [revenueHistory]);

  const totalRevenue = revenueHistory.reduce((sum, p) => sum + p.group + p.solo + p.merch, 0);
  const revRangeLabel = monthlyHistory.length >= 2
    ? `${monthlyHistory[0].m} – ${monthlyHistory[monthlyHistory.length - 1].m}`
    : monthlyHistory.length === 1 ? monthlyHistory[0].m : null;

  const handleAdvance = () => {
    Alert.alert(
      'Advance to Next Week?',
      weeklyCost > 0
        ? `Training costs ${fmt(weeklyCost)} will be deducted. This cannot be undone.`
        : 'No training sessions are planned. Advance anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Advance', style: 'default', onPress: advanceWeek },
      ],
    );
  };

  return (
    <AppShell>
    {/* <AppShell title="Agency" subtitle={agency.name}> */}

      {/* Agency identity banner */}
      <DashboardBanner agency={agency} />

      {/* 4-cell vitals strip */}
      <DashboardPulseStrip
        money={agency.money}
        reputation={agency.reputation}
        idolCount={idols.length}
        groupCount={groups.length}
      />

      {/* Week advance block */}
      <DashboardWeekBlock
        currentWeek={currentWeek}
        weeklyCost={weeklyCost}
        sessionCount={sessionCount}
        canAfford={canAfford}
        onAdvance={handleAdvance}
      />

      {/* This week's agenda */}
      <DashboardAgendaStrip
        schedule={schedule}
        onPress={() => navigation.navigate('Schedule')}
      />

      {/* Roster filmstrip with morale bars */}
      {idols.length === 0 ? (
        <Card>
          <View style={styles.ctaBox}>
            <Gradient colors={[colors.teal, colors.violet]} style={styles.ctaIcon}>
              <Sparkles size={18} color={colors.slate900} />
            </Gradient>
            <View style={styles.flex1}>
              <Text style={styles.ctaTitle}>Start by recruiting your first idol</Text>
              <Text style={styles.ctaBody}>
                Scout candidates, build your roster, then form groups to grow your agency.
              </Text>
            </View>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Recruit')} activeOpacity={0.8}>
              <Text style={styles.ctaBtnText}>Scout</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <DashboardRosterStrip
          idols={idols}
          onIdolPress={id => navigation.navigate('IdolProfile', { id })}
          onSeeAll={() => navigation.navigate('Idols')}
        />
      )}

      {/* Groups strip */}
      <DashboardGroupsStrip
        groups={groups}
        idols={idols}
        onGroupPress={groupId => navigation.navigate('GroupProfile', { groupId })}
        onManage={() => navigation.navigate('Groups')}
      />

      {/* Revenue chart */}
      {revenueHistory.length > 0 && (
        <Card>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueLabel}>REVENUE</Text>
              <Text style={styles.revenueTotal}>{fmt(totalRevenue)}</Text>
            </View>
            {revRangeLabel && (
              <Text style={styles.revRange}>{revRangeLabel}</Text>
            )}
          </View>
          <ResponsiveChart height={200}>
            {width => (
              <BarChart
                width={width}
                data={monthlyHistory}
                xKey="m"
                series={[
                  { key: 'group', color: barColors.group, label: 'Group' },
                  { key: 'solo',  color: barColors.solo,  label: 'Solo' },
                  { key: 'merch', color: barColors.merch, label: 'Merch' },
                ]}
              />
            )}
          </ResponsiveChart>
        </Card>
      )}

    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },

  // CTA
  ctaBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  ctaBody:  { marginTop: 2, fontSize: 11, color: colors.mutedForeground, lineHeight: 16 },
  ctaBtn: {
    borderRadius: radius.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },
  ctaBtnText: { fontSize: 11, fontWeight: '800', color: colors.slate900 },

  // Revenue
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  revenueLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  revenueTotal: { fontSize: 22, fontWeight: '900', color: colors.tealBright },
  revRange: { fontSize: 11, color: colors.mutedForeground, marginBottom: 3 },

});
