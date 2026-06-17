import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CalendarDays,
  ChevronRight,
  Crown,
  Dumbbell,
  Globe2,
  Home,
  Music2,
  Settings as SettingsIcon,
  Star,
  Swords,
  Users,
  Wallet,
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { ReactNode } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCityByName } from '../features/cities';
import { selectTopBarMetrics } from '../features/economy';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing, statusColor } from '../theme';
import { fmt } from '../utils/format';
import { AgencyLogoMark } from './ui/AgencyLogoMark';
import { Gradient } from './ui/Gradient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type NavItem = {
  to: keyof RootStackParamList;
  label: string;
  Icon: typeof Star;
};

const nav: NavItem[] = [
  { to: 'AgencyDashboard', label: 'Agency', Icon: Home },
  { to: 'Idols', label: 'Idols', Icon: Users },
  { to: 'Groups', label: 'Groups', Icon: Music2 },
  { to: 'Training', label: 'Training', Icon: Dumbbell },
  { to: 'Schedule', label: 'Schedule', Icon: CalendarDays },
  { to: 'Market', label: 'Market', Icon: Globe2 },
  { to: 'Rivals', label: 'Rivals', Icon: Swords },
  { to: 'Finance', label: 'Finance', Icon: Wallet },
  { to: 'Settings', label: 'Settings', Icon: SettingsIcon },
];

const primary = nav.slice(0, 5);
const more = nav.slice(5);

function AgencyLogoBadge({ logo }: { logo: ReturnType<typeof useGame>['agency']['logo'] }) {
  if (logo.kind === 'custom') {
    return (
      <View style={styles.logo}>
        <Image source={{ uri: logo.uri }} resizeMode="cover" style={styles.customLogoImage} />
      </View>
    );
  }

  return (
    <View style={styles.logo}>
      <AgencyLogoMark preset={logo.kind === 'preset' ? logo.preset : 'NEON_STAR'} size={38} />
    </View>
  );
}

export function TopBar() {
  const { agency, idols, groups, cities, transactions, currentWeek } = useGame();
  const cityProfile = getCityByName(cities, agency.city);
  const { weeklyNet: netWeekly, fanbaseLabel } = selectTopBarMetrics(
    agency,
    cityProfile,
    idols,
    groups,
    transactions,
    currentWeek,
  );
  const weeklyNetLabel = `${netWeekly >= 0 ? '+' : ''}${fmt(netWeekly)}`;

  return (
    <View style={styles.topBar}>
      <View style={styles.topBarRow}>
        <AgencyLogoBadge logo={agency.logo} />
        <View style={styles.flex1}>
          <View style={styles.rowCenter}>
            <Text style={styles.agencyName} numberOfLines={1}>
              {agency.name}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.topStats}>
        <Text style={styles.statMoney}>{fmt(agency.money)}</Text>
        <View style={styles.rowCenterSm}>
          <Users size={12} color={colors.violetBright} />
          <Text style={styles.statViolet}> {fanbaseLabel}</Text>
        </View>
        <View style={styles.rowCenterSm}>
          <Wallet size={12} color={colors.mint} />
          <Text style={styles.statMint}>
            {' '}
            {weeklyNetLabel} / week
          </Text>
        </View>
        <Text style={styles.muted}>Global #{agency.ranking}</Text>
      </View>
    </View>
  );
}

export function BottomNav() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomNavWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bottomNav}>
        {primary.map(({ to, label, Icon }) => {
          const active = route.name === to;
          return (
            <TouchableOpacity
              key={to}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => navigation.navigate(to as never)}
              activeOpacity={0.7}>
              <Icon size={20} color={active ? colors.tealBright : colors.mutedForeground} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function MoreNavRow() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.moreRow}>
      {more.map(({ to, label, Icon }) => {
        const active = route.name === to;
        return (
          <TouchableOpacity
            key={to}
            onPress={() => navigation.navigate(to as never)}
            style={[styles.morePill, active ? styles.morePillActive : styles.morePillIdle]}
            activeOpacity={0.7}>
            <Icon size={14} color={active ? colors.tealBright : colors.mutedForeground} />
            <Text style={[styles.morePillText, active && styles.morePillTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.flex1}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Gradient colors={[colors.bgTop, colors.bgBottom]} direction="to-b" style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <TopBar />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {title ? <PageHeader title={title} subtitle={subtitle} action={action} /> : null}
        <MoreNavRow />
        {children}
      </ScrollView>
      <BottomNav />
    </Gradient>
  );
}

export function Card({
  children,
  glow = 'none',
  style,
}: {
  children: ReactNode;
  glow?: 'teal' | 'violet' | 'none';
  style?: object;
}) {
  const glowStyle =
    glow === 'teal' ? styles.glowTeal : glow === 'violet' ? styles.glowViolet : styles.cardBorder;
  return <View style={[styles.card, glowStyle, style]}>{children}</View>;
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ?? <ChevronRight size={16} color={colors.mutedForeground} />}
    </View>
  );
}

export function SkillBar({
  label,
  value,
  color = 'teal',
}: {
  label: string;
  value: number;
  color?: 'teal' | 'violet' | 'mint';
}) {
  const grad =
    color === 'teal'
      ? [colors.teal, colors.violet]
      : color === 'violet'
        ? [colors.violet, '#8B5CF6']
        : [colors.mint, colors.teal];
  return (
    <View style={styles.skillBar}>
      <View style={styles.rowBetween}>
        <Text style={styles.skillLabel}>{label}</Text>
        <Text style={styles.skillValue}>
          {value}
          <Text style={styles.muted}>/100</Text>
        </Text>
      </View>
      <View style={styles.skillTrack}>
        <Gradient
          colors={grad}
          direction="to-r"
          style={[styles.skillFill, { width: `${value}%` }]}
        />
      </View>
    </View>
  );
}

export function Avatar({
  name,
  gradient,
  image,
  size = 48,
  ring = false,
}: {
  name: string;
  gradient: string[];
  image?: number;
  size?: number;
  ring?: boolean;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <Gradient
      colors={gradient}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius.lg },
        ring && styles.avatarRing,
      ]}>
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{initials}</Text>
      )}
    </Gradient>
  );
}

export function StatusDot({ status }: { status: string }) {
  const c = statusColor[status] ?? 'rgba(255,255,255,0.4)';
  return <View style={[styles.statusDot, { backgroundColor: c, shadowColor: c }]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowCenterSm: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  topBar: {
    backgroundColor: 'rgba(16,19,29,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    overflow: 'hidden',
  },
  customLogoImage: { width: '100%', height: '100%' },
  agencyName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    flexShrink: 1,
  },
  topStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  statMoney: { color: colors.foreground, fontSize: 11, fontWeight: '600' },
  statViolet: { color: colors.violetBright, fontSize: 11 },
  statMint: { color: colors.mint, fontSize: 11 },
  muted: { color: colors.mutedForeground, fontSize: 11 },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.xl,
  },

  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(20,23,34,0.96)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  navItemActive: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.mutedForeground },
  navLabelActive: { color: colors.tealBright },

  moreRow: { gap: spacing.sm, paddingVertical: 2 },
  morePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
  },
  morePillIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  morePillActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  morePillText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  morePillTextActive: { color: colors.tealBright },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  pageTitle: {
    color: colors.tealBright,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pageSubtitle: { marginTop: 2, fontSize: 12, color: colors.mutedForeground },

  card: {
    backgroundColor: 'rgba(28,32,48,0.7)',
    borderRadius: radius['2xl'],
    padding: spacing.lg,
  },
  cardBorder: { borderWidth: 1, borderColor: colors.border },
  glowTeal: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  glowViolet: {
    borderWidth: 1,
    borderColor: 'rgba(217,70,239,0.6)',
    backgroundColor: 'rgba(217,70,239,0.06)',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: 'rgba(244,246,250,0.9)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },

  skillBar: { gap: 4 },
  skillLabel: { color: colors.mutedForeground, fontSize: 11 },
  skillValue: { color: colors.foreground, fontSize: 11, fontWeight: '600' },
  skillTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.whiteA10,
    overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: radius.full },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarRing: { borderWidth: 2, borderColor: 'rgba(103,232,249,0.6)' },
  avatarText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
});
