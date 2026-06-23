import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { radius } from '../../theme';
import { Idol } from '../../types';
import { CardPortrait } from './CardPortrait';
import { CardWelfareStrip } from './CardWelfareStrip';
import { STATUS_STYLE } from './rosterConstants';

type Props = {
  idol: Idol;
  groupLogoPreset?: number;
  onPress: () => void;
};

export function RosterIdolCard({ idol, groupLogoPreset, onPress }: Props) {
  const statusStyle = STATUS_STYLE[idol.status] ?? STATUS_STYLE.Trainee;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderColor: statusStyle.borderColor,
          shadowColor: statusStyle.shadowColor,
          shadowOpacity: statusStyle.shadowOpacity ?? 0,
          shadowRadius: statusStyle.shadowRadius ?? 0,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}>
      <CardPortrait
        image={idol.image}
        stageName={idol.stageName}
        role={idol.role}
        status={idol.status}
        flag={idol.flag}
        group={idol.group}
        groupLogoPreset={groupLogoPreset}
      />
      <CardWelfareStrip
        morale={idol.morale}
        energy={idol.energy}
        stats={idol.stats}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(20,23,34,0.92)',
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
