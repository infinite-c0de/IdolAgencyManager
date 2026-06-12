import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import type { AgencyLogoPreset } from '../../types';

type AgencyLogoMarkProps = {
  preset: AgencyLogoPreset;
  size?: number;
};

const shapes: Record<AgencyLogoPreset, number> = {
  NEON_STAR: 0,
  AURORA_CROWN: 1,
  LUNAR_SPOTLIGHT: 2,
  NOVA_COMPASS: 3,
  CRYSTAL_WINGS: 4,
  PRISM_DIAMOND: 5,
  STAGE_LIGHTS: 6,
  HEART_ORBIT: 7,
  SOUNDWAVE: 8,
  STAR_RING: 9,
  LOTUS_IDOL: 10,
  OCEAN_WAVE: 11,
  ORBIT_STAR: 12,
  NEON_CHEVRON: 13,
  WINGED_STAR: 14,
  CRYSTAL_CITY: 15,
};

export function AgencyLogoMark({ preset, size = 54 }: AgencyLogoMarkProps) {
  const shape = shapes[preset];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#67E8F9" />
          <Stop offset="0.48" stopColor="#A78BFA" />
          <Stop offset="1" stopColor="#E879F9" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="92" height="92" rx="22" fill="rgba(255,255,255,0.04)" />
      <Circle cx="50" cy="50" r="36" fill="none" stroke="rgba(103,232,249,0.22)" strokeWidth="2" />
      <G stroke="url(#logoGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {shape === 0 && <Path d="M50 15 L59 41 L86 50 L59 59 L50 85 L41 59 L14 50 L41 41 Z" fill="rgba(167,139,250,0.22)" />}
        {shape === 1 && <Path d="M20 66 L30 35 L45 56 L50 23 L55 56 L70 35 L80 66 Z" fill="rgba(232,121,249,0.18)" />}
        {shape === 2 && <Path d="M70 20 A34 34 0 1 0 70 80 A25 25 0 1 1 70 20 Z" fill="rgba(103,232,249,0.12)" />}
        {shape === 3 && (
          <>
            <Line x1="50" y1="12" x2="50" y2="88" />
            <Line x1="12" y1="50" x2="88" y2="50" />
            <Polygon points="50,20 60,50 50,80 40,50" fill="rgba(232,121,249,0.16)" />
          </>
        )}
        {shape === 4 && <Path d="M50 25 L62 52 L88 34 L66 72 L50 60 L34 72 L12 34 L38 52 Z" fill="rgba(103,232,249,0.14)" />}
        {shape === 5 && <Polygon points="50,16 78,38 68,78 32,78 22,38" fill="rgba(232,121,249,0.16)" />}
        {shape === 6 && (
          <>
            <Path d="M28 76 L42 28 L50 64 L58 28 L72 76" />
            <Ellipse cx="50" cy="76" rx="31" ry="8" />
          </>
        )}
        {shape === 7 && <Path d="M50 80 C20 60 16 36 34 29 C43 25 49 31 50 38 C51 31 57 25 66 29 C84 36 80 60 50 80 Z" fill="rgba(232,121,249,0.12)" />}
        {shape === 8 && (
          <>
            {[20,30,40,50,60,70,80].map((x, index) => (
              <Line key={x} x1={x} y1={50 - (index % 4) * 8} x2={x} y2={50 + (index % 4) * 8} />
            ))}
          </>
        )}
        {shape === 9 && <Path d="M50 18 L59 42 L84 42 L64 57 L72 80 L50 66 L28 80 L36 57 L16 42 L41 42 Z" fill="rgba(167,139,250,0.15)" />}
        {shape === 10 && <Path d="M50 20 C62 42 78 50 82 74 C66 66 58 73 50 84 C42 73 34 66 18 74 C22 50 38 42 50 20 Z" fill="rgba(103,232,249,0.13)" />}
        {shape === 11 && <Path d="M20 62 C32 28 66 22 82 42 C60 38 55 55 72 64 C48 78 30 74 20 62 Z" fill="rgba(103,232,249,0.12)" />}
        {shape === 12 && (
          <>
            <Ellipse cx="50" cy="50" rx="38" ry="15" transform="rotate(-18 50 50)" />
            <Path d="M50 24 L58 50 L50 76 L42 50 Z" fill="rgba(232,121,249,0.15)" />
          </>
        )}
        {shape === 13 && <Path d="M25 76 L50 24 L75 76 M35 76 L50 46 L65 76" />}
        {shape === 14 && <Path d="M50 28 L61 55 L88 38 L66 76 L50 63 L34 76 L12 38 L39 55 Z" fill="rgba(232,121,249,0.15)" />}
        {shape === 15 && (
          <>
            <Path d="M20 76 L32 42 L44 76 M38 76 L50 24 L62 76 M56 76 L68 42 L80 76" />
            <Line x1="18" y1="78" x2="82" y2="78" />
          </>
        )}
      </G>
    </Svg>
  );
}
