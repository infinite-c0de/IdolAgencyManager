import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '../../theme';

export type RadarDatum = { skill: string; v: number };

type Props = {
  data: RadarDatum[];
  size?: number;
  max?: number;
  fillStops?: [string, string];
};

function pointAt(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/** Lightweight radar/spider chart replacement for the web recharts RadarChart. */
export function RadarChart({
  data,
  size = 200,
  max = 100,
  fillStops = [colors.teal, colors.violet],
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 26;
  const n = data.length;
  const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / n;

  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = data
    .map((d, i) => {
      const r = (Math.max(0, Math.min(d.v, max)) / max) * radius;
      const p = pointAt(cx, cy, r, angle(i));
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <View>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={fillStops[0]} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={fillStops[1]} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>

        {rings.map((ring, idx) => {
          const pts = data
            .map((_, i) => {
              const p = pointAt(cx, cy, radius * ring, angle(i));
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <Polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          );
        })}

        {data.map((_, i) => {
          const p = pointAt(cx, cy, radius, angle(i));
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={dataPoints}
          fill="url(#radarFill)"
          stroke={colors.teal}
          strokeWidth={2}
        />

        {data.map((d, i) => {
          const p = pointAt(cx, cy, radius + 14, angle(i));
          return (
            <SvgText
              key={d.skill}
              x={p.x}
              y={p.y + 3}
              fill="rgba(255,255,255,0.7)"
              fontSize={9}
              fontWeight="600"
              textAnchor="middle">
              {d.skill}
            </SvgText>
          );
        })}

        {data.map((d, i) => {
          const r = (Math.max(0, Math.min(d.v, max)) / max) * radius;
          const p = pointAt(cx, cy, r, angle(i));
          return <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={colors.tealBright} />;
        })}
      </Svg>
    </View>
  );
}
