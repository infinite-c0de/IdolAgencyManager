import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Defs, Line as SvgLine, LinearGradient, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';
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

// ── layout constants ────────────────────────────────────────────────────────
const Y_AXIS_W   = 52;   // fixed left panel for y-labels
const LEGEND_H   = 22;   // legend strip height at bottom
const POINT_PX   = 36;   // pixels per data point (controls scroll density)
const PAD_TOP    = 10;
const PAD_BOTTOM = 20;   // space for x-axis labels inside the scrollable SVG

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtY(v: number): string {
  const abs = Math.abs(v);
  if (abs === 0) return '0';
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000)         return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}

/** Compute nice round tick values for a y-range. */
function yTicks(minV: number, maxV: number, count = 4): number[] {
  const range = maxV - minV || 1;
  const raw   = range / (count - 1);
  const mag   = Math.pow(10, Math.floor(Math.log10(raw)));
  const step  = Math.ceil(raw / mag) * mag;
  const start = Math.floor(minV / step) * step;
  return Array.from({ length: count }, (_, i) => start + step * i);
}

// ── component ─────────────────────────────────────────────────────────────────

export function LineChart({ data, xKey, series, width, height = 220 }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const chartAreaH = height - LEGEND_H;            // height used for y-axis + grid + lines
  const innerH     = chartAreaH - PAD_TOP - PAD_BOTTOM;

  const allValues = data.flatMap(d => series.map(s => Number(d[s.key]) || 0));
  const rawMax    = Math.max(...allValues, 1);
  const rawMin    = Math.min(...allValues, 0);

  const ticks   = yTicks(rawMin, rawMax, 4);
  const minV    = ticks[0];
  const maxV    = ticks[ticks.length - 1];
  const range   = maxV - minV || 1;

  // Content width: at least fill container, at most expand to show all points
  const scrollW   = Math.max(width - Y_AXIS_W, 1);
  const contentW  = Math.max(scrollW, data.length * POINT_PX);

  const xPad = contentW > scrollW ? POINT_PX / 2 : 0;
  const xSpan = contentW - xPad * 2;

  const xPos = (i: number) =>
    data.length <= 1
      ? contentW / 2
      : xPad + (i / (data.length - 1)) * xSpan;

  const yPos = (v: number) =>
    PAD_TOP + innerH - ((Math.min(Math.max(v, minV), maxV) - minV) / range) * innerH;

  // How many x labels to show without crowding (aim for ~10 labels)
  const labelStep = Math.max(1, Math.ceil(data.length / 10));

  // Auto-scroll to rightmost (latest) data on mount and when data grows
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 60);
    return () => clearTimeout(t);
  }, [data.length]);

  return (
    <View style={{ width, height }}>

      {/* ── Fixed Y-axis panel ─────────────────────────────────────────── */}
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

      {/* ── Horizontally scrollable chart ──────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: 'absolute', left: Y_AXIS_W, right: 0, top: 0, height: chartAreaH }}
        contentContainerStyle={{ width: contentW }}>
        <Svg width={contentW} height={chartAreaH}>
          <Defs>
            {/* Fade-out mask on right edge to hint at scrollability */}
            <LinearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0.88" stopColor="transparent" stopOpacity="0" />
              <Stop offset="1"    stopColor={colors.card}  stopOpacity="0.6" />
            </LinearGradient>
          </Defs>

          {/* Horizontal grid lines */}
          {ticks.map((t, i) => (
            <SvgLine
              key={`g${i}`}
              x1={0}
              y1={yPos(t)}
              x2={contentW}
              y2={yPos(t)}
              stroke={i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={1}
              strokeDasharray={i === 0 ? '' : '4 4'}
            />
          ))}

          {/* Series polylines */}
          {series.map(s => {
            const pts = data.map((d, i) => `${xPos(i).toFixed(1)},${yPos(Number(d[s.key]) || 0).toFixed(1)}`).join(' ');
            return (
              <Polyline
                key={s.key}
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const isLast  = i === data.length - 1;
            const isFirst = i === 0;
            if (!isFirst && !isLast && i % labelStep !== 0) return null;
            return (
              <SvgText
                key={`x${i}`}
                x={xPos(i)}
                y={chartAreaH - 4}
                fill={isLast ? colors.tealBright : colors.mutedForeground}
                fontSize={isLast ? 9 : 8}
                fontWeight={isLast ? '700' : '400'}
                textAnchor="middle">
                {String(d[xKey])}
              </SvgText>
            );
          })}

          {/* Scrollability hint — right-edge fade */}
          {contentW > scrollW && (
            <Rect x={contentW - 24} y={0} width={24} height={chartAreaH} fill="url(#fade)" />
          )}
        </Svg>
      </ScrollView>

      {/* ── Legend strip ───────────────────────────────────────────────── */}
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
            <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: s.color }} />
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.mutedForeground }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const lineColors = {
  group: colors.teal,
  solo:  statColors.stamina,
  merch: colors.violet,
};
