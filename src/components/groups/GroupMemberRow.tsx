import { Crown } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ROLE_COLOR } from '../roster/rosterConstants';
import { colors, radius, spacing } from '../../theme';
import type { Idol } from '../../types';

type Props = {
  members: Idol[];
};

function MemberCell({ member }: { member: Idol }) {
  const isLeader = member.role.includes('Leader');
  const roleColor = ROLE_COLOR[member.role] ?? colors.mutedForeground;

  return (
    <View style={styles.cell}>
      <View style={[styles.avatarWrap, isLeader && styles.avatarLeader]}>
        {member.image ? (
          <Image source={member.image} resizeMode="cover" style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{member.stageName.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        {isLeader && (
          <View style={styles.crownBadge}>
            <Crown size={7} color={colors.amber} />
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{member.stageName}</Text>
      <Text style={[styles.role, { color: roleColor }]} numberOfLines={1}>{member.role}</Text>
    </View>
  );
}

export function GroupMemberRow({ members }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled
      nestedScrollEnabled
      contentContainerStyle={styles.row}>
      {members.map(m => (
        <MemberCell key={m.id} member={m} />
      ))}
    </ScrollView>
  );
}

const AVATAR = 45;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cell: {
    alignItems: 'center',
    gap: 3,
    width: AVATAR + 6,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    position: 'relative',
  },
  avatarLeader: {
    borderColor: colors.amber + '66',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.4)',
    letterSpacing: 1,
  },
  crownBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
  },
  role: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
