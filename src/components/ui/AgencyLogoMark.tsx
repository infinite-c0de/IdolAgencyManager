import React from 'react';
import { Image, View } from 'react-native';
import { LOGO_IMAGES } from '../../data/gameData';
import type { AgencyLogoPreset } from '../../types';

type AgencyLogoMarkProps = {
  preset: AgencyLogoPreset;
  size?: number;
};

export function AgencyLogoMark({ preset, size = 54 }: AgencyLogoMarkProps) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden' }}>
      <Image
        source={LOGO_IMAGES[preset] ?? LOGO_IMAGES[1]}
        resizeMode="cover"
        style={{ width: size, height: size }}
      />
    </View>
  );
}
