import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Line as SvgLine, Rect, Text as SvgText } from 'react-native-svg';
import { colors, statColors } from '../../theme';

export type BarSeries = {
  key: string;
  color: string;
  label: string;
};

type Props = {
  data: Array<Record<string, number | string>>;
  xKey: string;
  series: BarSeries[]; // stacked bottom → top
  width: number;
  height?: number;
};

// ── layout ───────────────────────────────────────────────────────────────────
const Y_AXIS_W   = 52;
const LEGEND_H   = 22;
const PAD_TOP    = 10;
const PAD_BOTTOM = 28;  // room for 2-line x-axis labels (year months)
const BAR_W      = 16;
const BAR_GAP    = 10;  // gap between bars
const BAR_STEP   = BAR_W + BAR_GAP;

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtY(v: number): string {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)}M`;
  if (Math.abs(v) >= 1_000)         return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}

function niceTicks(maxV: number, count = 4): number[] {
  if (maxV <= 0) return [0, 1, 2, 3];
  const raw  = maxV / (count - 1);
  const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = Math.ceil(raw / mag) * mag;
  return Array.from({ length: count }, (_, i) => step * i);
}

// ── component ─────────────────────────────────────────────────────────────────

export function BarChart({ data, xKey, series, width, height = 220 }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const chartAreaH = height - LEGEND_H;
  const innerH     = Math.max(chartAreaH - PAD_TOP - PAD_BOTTOM, 10);

  // Max stacked total across all data points
  const maxTotal = Math.max(
    ...data.map(d => series.reduce((s, ser) => s + (Number(d[ser.key]) || 0), 0)),
    1,
  );

  const ticks   = niceTicks(maxTotal, 4);
  const tickMax = ticks[ticks.length - 1] || maxTotal;

  const scrollW  = Math.max(width - Y_AXIS_W, 1);
  // Extra half-step padding on each side so first/last bars aren't clipped
  const contentW = Math.max(scrollW, data.length * BAR_STEP + BAR_STEP);

  /** Centre x of the bar for data index i */
  const xPos = (i: number) => BAR_STEP / 2 + i * BAR_STEP;

  /** SVG y for a given value (0 = chart bottom, tickMax = chart top) */
  const yPos = (v: number) => PAD_TOP + innerH - (Math.min(v, tickMax) / tickMax) * innerH;

  /** Pixel height for a given value */
  const pxH = (v: number) => (Math.min(v, tickMax) / tickMax) * innerH;

  // Scroll to latest (rightmost) whenever data grows
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 60);
    return () => clearTimeout(t);
  }, [data.length]);

  return (
    <View style={{ width, height }}>

      {/* ── Fixed Y-axis ──────────────────────────────────────────────── */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: Y_AXIS_W, height: chartAreaH }}>
        <Svg width={Y_AXIS_W} height={chartAreaH}>
          {ticks.map((t, i) => (
            <SvgText
              key={i}
              x={Y_AXIS_W - 6}
              y={yPos(t) + 4}
              fill={colors.mutedForeground}
              fontSize={9}
              fontWeight="600"
              textAnchor="end">
              {fmtY(t)}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* ── Horizontally scrollable chart ─────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: 'absolute', left: Y_AXIS_W, right: 0, top: 0, height: chartAreaH }}
        contentContainerStyle={{ width: contentW }}>
        <Svg width={contentW} height={chartAreaH}>

          {/* Grid lines */}
          {ticks.map((t, i) => (
            <SvgLine
              key={`g${i}`}
              x1={0}       y1={yPos(t)}
              x2={contentW} y2={yPos(t)}
              stroke={i === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={1}
              strokeDasharray={i === 0 ? '' : '3 4'}
            />
          ))}

          {/* Stacked bars */}
          {data.map((d, i) => {
            let cumulative = 0;
            const cx = xPos(i);
            return series.map(ser => {
              const v = Number(d[ser.key]) || 0;
              cumulative += v;
              const rectH = pxH(v);
              if (rectH < 0.5) return null; // skip near-zero segments
              const rectY = yPos(cumulative);
              const isTop = ser === series[series.length - 1] ||
                series.slice(series.indexOf(ser) + 1).every(s => (Number(d[s.key]) || 0) === 0);
              return (
                <Rect
                  key={`${i}-${ser.key}`}
                  x={cx - BAR_W / 2}
                  y={rectY}
                  width={BAR_W}
                  height={rectH}
                  fill={ser.color}
                  opacity={0.88}
                  rx={isTop ? 3 : 0}
                  ry={isTop ? 3 : 0}
                />
              );
            });
          })}

          {/* X-axis labels — every label since data is already monthly */}
          {data.map((d, i) => {
            const label     = String(d[xKey]);
            const prevLabel = i > 0 ? String(data[i - 1][xKey]) : null;
            const isFirst   = i === 0;
            const isLast    = i === data.length - 1;
            if (!isFirst && !isLast && label === prevLabel) return null;

            const cx      = xPos(i);
            const accent  = isLast ? colors.tealBright : colors.mutedForeground;
            const fsize   = isLast ? 9 : 8;
            const fweight = isLast ? '700' : '400';

            // "2026 Jan" → two lines: "Jan" then "2026" below
            const parts = label.split(' ');
            if (parts.length === 2) {
              return (
                <React.Fragment key={`x${i}`}>
                  <SvgText x={cx} y={chartAreaH - 14} fill={accent} fontSize={fsize} fontWeight={fweight} textAnchor="middle">
                    {parts[1]}
                  </SvgText>
                  <SvgText x={cx} y={chartAreaH - 3} fill={accent} fontSize={8} fontWeight="400" textAnchor="middle">
                    {parts[0]}
                  </SvgText>
                </React.Fragment>
              );
            }
            return (
              <SvgText key={`x${i}`} x={cx} y={chartAreaH - 4} fill={accent} fontSize={fsize} fontWeight={fweight} textAnchor="middle">
                {label}
              </SvgText>
            );
          })}

        </Svg>
      </ScrollView>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: Y_AXIS_W,
          right: 0,
          height: LEGEND_H,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}>
        {series.map(s => (
          <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color }} />
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.mutedForeground }}>{s.label}</Text>
          </View>
        ))}
      </View>

    </View>
  );
}

export const barColors = {
  group: colors.teal,
  solo:  statColors.stamina,
  merch: colors.violet,
};
