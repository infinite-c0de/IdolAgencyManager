import React from 'react';
import Svg, { Line as SvgLine, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme';

export type LineSeries = {
  key: string;
  color: string;
  label: string;
};

type Props = {
  data: Array<Record<string, number | string>>;
  xKey: string;
  series: LineSeries[];
  width: number;
  height?: number;
};

/** Multi-line chart replacement for the web recharts LineChart. */
export function LineChart({ data, xKey, series, width, height = 180 }: Props) {
  const padLeft = 28;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 22;
  const innerW = Math.max(width - padLeft - padRight, 10);
  const innerH = Math.max(height - padTop - padBottom, 10);

  const allValues = data.flatMap(d => series.map(s => Number(d[s.key]) || 0));
  const maxV = Math.max(...allValues, 1);
  const minV = Math.min(...allValues, 0);
  const range = maxV - minV || 1;

  const x = (i: number) => padLeft + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - ((v - minV) / range) * innerH;

  const yTicks = [minV, minV + range / 2, maxV];

  return (
    <Svg width={width} height={height}>
      {yTicks.map((t, i) => (
        <SvgText
          key={i}
          x={padLeft - 4}
          y={y(t) + 3}
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          textAnchor="end">
          {Math.round(t)}
        </SvgText>
      ))}

      {yTicks.map((t, i) => (
        <SvgLine
          key={`g${i}`}
          x1={padLeft}
          y1={y(t)}
          x2={width - padRight}
          y2={y(t)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {series.map(s => (
        <Polyline
          key={s.key}
          points={data.map((d, i) => `${x(i)},${y(Number(d[s.key]) || 0)}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth={2.5}
        />
      ))}

      {data.map((d, i) => (
        <SvgText
          key={`x${i}`}
          x={x(i)}
          y={height - 6}
          fill="rgba(255,255,255,0.5)"
          fontSize={9}
          textAnchor="middle">
          {String(d[xKey])}
        </SvgText>
      ))}
    </Svg>
  );
}

export const lineColors = {
  group: colors.teal,
  solo: '#818CF8',
  merch: colors.violet,
};
