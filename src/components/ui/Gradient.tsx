import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Direction = 'to-br' | 'to-r' | 'to-t' | 'to-b';

const dirs: Record<Direction, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  'to-br': { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  'to-r': { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
  'to-t': { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
  'to-b': { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
};

type Props = {
  colors: readonly string[];
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function Gradient({ colors, direction = 'to-br', style, children }: Props) {
  const d = dirs[direction];
  return (
    <LinearGradient colors={colors as string[]} start={d.start} end={d.end} style={style}>
      {children}
    </LinearGradient>
  );
}
