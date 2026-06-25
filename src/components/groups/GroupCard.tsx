import React from 'react';
import { StyleSheet, View } from 'react-native';
import { buildGroupReadiness } from '../../features/groups';
import { colors, radius } from '../../theme';
import type { Group, Idol } from '../../types';
import { GroupCardHeader } from './GroupCardHeader';
import { GroupMemberRow } from './GroupMemberRow';
import { GroupReadinessBar } from './GroupReadinessBar';
import { GroupStatStrip } from './GroupStatStrip';

const BORDER: Record<string, string> = {
  Active:    'rgba(34,211,238,0.45)',
  'Pre-debut': 'rgba(217,70,239,0.45)',
  Disbanded: colors.border,
};

const SHADOW: Record<string, string | undefined> = {
  Active:    colors.teal,
  'Pre-debut': colors.violet,
  Disbanded: undefined,
};

type Props = {
  group: Group;
  members: Idol[];
  onPress: () => void;
};

export function GroupCard({ group, members, onPress }: Props) {
  const readiness = buildGroupReadiness(members, group);
  const borderColor = BORDER[group.status] ?? colors.border;
  const shadowColor = SHADOW[group.status];
  const isPreDebut = group.status === 'Pre-debut';

  return (
    // Outer shadow wrapper — must NOT have overflow:hidden so shadows render
    <View
      style={[
        styles.shadow,
        shadowColor && { shadowColor, shadowOpacity: 0.25, shadowRadius: 10 },
      ]}>
      {/* Inner card clips to border radius */}
      <View style={[styles.card, { borderColor }]}>

        <GroupCardHeader
          name={group.name}
          fanName={group.fanName}
          concept={group.concept}
          logo={group.logo}
          status={group.status}
          memberCount={members.length}
          gradient={group.gradient}
          onViewPress={onPress}
        />
        <GroupStatStrip
          popularity={group.popularity}
          monthlyRevenue={group.monthlyRevenue}
          synergy={group.synergy}
        />

        {/* Free-scrolling member row — NOT inside TouchableOpacity */}
        <GroupMemberRow members={members} />

        {isPreDebut && (
          <GroupReadinessBar
            checks={readiness.checks}
            ready={readiness.ready}
          />
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.xl,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(20,23,34,0.92)',
  },
});
