import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { Idol } from '../../types';

function moraleColor(morale: number): string {
  if (morale < 40) return colors.hot;
  if (morale < 65) return colors.amber;
  return colors.mint;
}

function PortraitCell({ idol, onPress }: { idol: Idol; onPress: () => void }) {
  const mColor = moraleColor(idol.morale);

  return (
    <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.84}>
      {/* Portrait */}
      <View style={styles.portrait}>
        {idol.image ? (
          <Image source={idol.image} resizeMode="cover" style={styles.photo} />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.initials}>{idol.stageName.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        {/* Bottom shade */}
        <View style={styles.shade} />
        <Text style={styles.name} numberOfLines={1}>{idol.stageName}</Text>
      </View>
    </TouchableOpacity>
  );
}

type Props = {
  idols: Idol[];
  onIdolPress: (id: string) => void;
  onSeeAll: () => void;
};

export function DashboardRosterStrip({ idols, onIdolPress, onSeeAll }: Props) {
  if (idols.length === 0) return null;

  const visible = idols.slice(0, 8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>ROSTER</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.headerLink}>See all →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {visible.map(idol => (
          <PortraitCell
            key={idol.id}
            idol={idol}
            onPress={() => onIdolPress(idol.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.mutedForeground,
  },
  headerLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealBright,
  },
  scroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 2,
  },

  cell: {
    width: 78,
    gap: 4,
  },
  portrait: {
    height: 108,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: '#080B12',
    justifyContent: 'flex-end',
  },
  photo: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealActiveBg,
  },
  initials: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(103,232,249,0.3)',
    letterSpacing: 2,
  },
  shade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 26,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  name: {
    paddingHorizontal: 4,
    paddingBottom: 5,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.foreground,
    textAlign: 'center',
  },
});
