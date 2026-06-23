import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../../theme';
import { Trainee } from '../../types';
import { ScoutCardDetail } from './ScoutCardDetail';
import { ScoutCardMain } from './ScoutCardMain';
import { ScoutCardSide } from './ScoutCardSide';

type Props = {
  trainee: Trainee;
  expanded: boolean;
  canAfford: boolean;
  onToggle: () => void;
  onRecruit: () => void;
};

export function ScoutCard({ trainee, expanded, canAfford, onToggle, onRecruit }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, expanded && styles.cardExpanded]}
      onPress={onToggle}
      activeOpacity={0.90}>

      {/* Collapsed row: portrait thumbnail (left) + info (right) */}
      <View style={styles.row}>
        <ScoutCardSide
          image={trainee.image}
          name={trainee.name}
          potential={trainee.potential}
        />
        <ScoutCardMain
          trainee={trainee}
          canAfford={canAfford}
          expanded={expanded}
        />
      </View>

      {/* Expanded detail drawer */}
      {expanded && (
        <ScoutCardDetail
          trainee={trainee}
          canAfford={canAfford}
          onRecruit={onRecruit}
        />
      )}

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(20,23,34,0.92)',
  },
  cardExpanded: {
    borderColor: 'rgba(34,211,238,0.35)',
  },
  row: {
    flexDirection: 'row',
    minHeight: 110,
  },
});
