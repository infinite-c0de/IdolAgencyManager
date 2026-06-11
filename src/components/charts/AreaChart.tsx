import React from 'react';
import Svg, {
  Defs,
  Line as SvgLine,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '../../theme';

type Props = {
  data: Array<Record<string, number | string>>;
  xKey: string;
  yKey: string;
  width: number;
  height?: number;
  color?: string;
};

/** Single-series area chart replacement for the web recharts AreaChart. */
export function AreaChart({
  data,
  xKey,
  yKey,
  width,
  height = 176,
  color = colors.teal,
}: Props) {
  const padLeft = 28;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 22;
  const innerW = Math.max(width - padLeft - padRight, 10);
  const innerH = Math.max(height - padTop - padBottom, 10);

  const values = data.map(d => Number(d[yKey]) || 0);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);
  const range = maxV - minV || 1;

  const x = (i: number) => padLeft + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - ((v - minV) / range) * innerH;

  const linePoints = data.map((d, i) => `${x(i)},${y(Number(d[yKey]) || 0)}`).join(' ');
  const baseY = padTop + innerH;
  const areaPath = `M ${x(0)},${baseY} ${data
    .map((d, i) => `L ${x(i)},${y(Number(d[yKey]) || 0)}`)
    .join(' ')} L ${x(data.length - 1)},${baseY} Z`;

  const yTicks = [minV, minV + range / 2, maxV];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.7} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>

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

      <Path d={areaPath} fill="url(#areaFill)" />
      <Polyline points={linePoints} fill="none" stroke={color} strokeWidth={2.5} />

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
