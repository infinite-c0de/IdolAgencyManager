import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../theme';
import { Trainee } from '../../types';
import { CardArtPanel } from './CardArtPanel';
import { CardDetailPanel } from './CardDetailPanel';
import { CardStatStrip } from './CardStatStrip';

type Props = {
  trainee: Trainee;
  expanded: boolean;
  onToggle: () => void;
  onRecruit: () => void;
  canAfford: boolean;
};

export function CandidateCard({ trainee, expanded, onToggle, onRecruit, canAfford }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onToggle}
      activeOpacity={0.93}>
      <CardArtPanel
        image={trainee.image}
        name={trainee.name}
        nationality={trainee.nationality}
        flag={trainee.flag}
        age={trainee.age}
        skill={trainee.skill}
        potential={trainee.potential}
        cost={trainee.cost}
        canAfford={canAfford}
      />
      <CardStatStrip
        trainee={trainee}
        expanded={expanded}
      />
      {expanded && (
        <CardDetailPanel
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
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(20,23,34,0.9)',
  },
});
