import React from 'react';
import Svg, { Circle, Line as SvgLine, Polyline, Text as SvgText } from 'react-native-svg';
import { colors, statColors } from '../../theme';

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

/** Multi-line chart — month labels + series legend both live inside the SVG canvas. */
export function LineChart({ data, xKey, series, width, height = 200 }: Props) {
  const padLeft = 28;
  const padRight = 8;
  const padTop = 8;
  // reserve: 14px months row + 4px gap + 14px legend row + 4px bottom margin = 36
  const padBottom = 36;
  const innerW = Math.max(width - padLeft - padRight, 10);
  const innerH = Math.max(height - padTop - padBottom, 10);

  const allValues = data.flatMap(d => series.map(s => Number(d[s.key]) || 0));
  const maxV = Math.max(...allValues, 1);
  const minV = Math.min(...allValues, 0);
  const range = maxV - minV || 1;

  const x = (i: number) => padLeft + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - ((v - minV) / range) * innerH;

  const yTicks = [minV, minV + range / 2, maxV];

  // month labels sit 24px above SVG bottom; legend sits 8px above SVG bottom
  const yMonths = height - 22;
  const yLegend = height - 6;

  // legend items spaced evenly across chart width
  const legendSlotW = innerW / series.length;

  return (
    <Svg width={width} height={height}>
      {/* y-axis tick labels */}
      {yTicks.map((t, i) => (
        <SvgText
          key={i}
          x={padLeft - 4}
          y={y(t) + 3}
          fill={colors.mutedForeground}
          fontSize={10}
          textAnchor="end">
          {Math.round(t)}
        </SvgText>
      ))}

      {/* horizontal grid lines */}
      {yTicks.map((t, i) => (
        <SvgLine
          key={`g${i}`}
          x1={padLeft}
          y1={y(t)}
          x2={width - padRight}
          y2={y(t)}
          stroke={colors.whiteA05}
          strokeWidth={1}
        />
      ))}

      {/* series polylines */}
      {series.map(s => (
        <Polyline
          key={s.key}
          points={data.map((d, i) => `${x(i)},${y(Number(d[s.key]) || 0)}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth={2.5}
        />
      ))}

      {/* x-axis month labels */}
      {data.map((d, i) => (
        <SvgText
          key={`x${i}`}
          x={x(i)}
          y={yMonths}
          fill={colors.mutedForeground}
          fontSize={9}
          textAnchor="middle">
          {String(d[xKey])}
        </SvgText>
      ))}

      {/* series legend — centered row inside SVG, below month labels */}
      {series.map((s, i) => {
        const cx = padLeft + legendSlotW * i + legendSlotW / 2;
        return (
          <React.Fragment key={`leg${i}`}>
            <Circle cx={cx - 20} cy={yLegend - 3} r={3} fill={s.color} />
            <SvgText
              x={cx - 14}
              y={yLegend}
              fill={colors.mutedForeground}
              fontSize={9}
              textAnchor="start">
              {s.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export const lineColors = {
  group: colors.teal,
  solo: statColors.stamina,
  merch: colors.violet,
};
