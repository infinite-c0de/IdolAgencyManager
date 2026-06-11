import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';

type Props = {
  height: number;
  children: (width: number) => React.ReactNode;
};

/** Measures available width (like recharts ResponsiveContainer) and renders children with it. */
export function ResponsiveChart({ height, children }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== width) {
      setWidth(w);
    }
  };
  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 ? children(width) : null}
    </View>
  );
}
