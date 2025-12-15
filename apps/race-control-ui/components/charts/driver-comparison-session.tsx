'use client';

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';

import type { LapsComparisonResponse } from '@/lib/types';

const X_ID = 'laps';
const Y_ID = 'laptime';

type Props = {
  data: LapsComparisonResponse;
  sessionName?: string;
};

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(3)} s`;
}

function hoverLineData(y: number, xMax: number, label: string, color: string) {
  return [
    { x: 0, y, __type: 'refline', label, color },
    { x: xMax, y, __type: 'refline', label, color },
  ];
}

// Tooltip: kann Punkte UND Linien
function LapsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const p = payload[0]?.payload;
  if (!p) return null;

  // Hover auf Referenzlinie (AVG/TB/P90)
  if (p.__type === 'refline') {
    return (
      <div className='rounded-lg border bg-background px-3 py-2 shadow-sm'>
        <div className='flex items-center gap-2 font-medium'>
          <span
            className='h-2.5 w-2.5 rounded-full'
            style={{ background: p.color }}
          />
          <span>{p.label}</span>
        </div>
        <div className='mt-1 text-xs text-muted-foreground'>
          {formatSeconds(p.y)}
        </div>
      </div>
    );
  }

  // normaler Punkt
  return (
    <div className='rounded-lg border bg-background px-3 py-2 shadow-sm'>
      <div className='flex items-center gap-2 font-medium'>
        <span
          className='h-2.5 w-2.5 rounded-full'
          style={{ background: p.driverColor }}
        />
        <span>{p.driverName}</span>
      </div>
      <div className='mt-1 text-xs text-muted-foreground'>
        Runde {p.x} · {formatSeconds(p.realY ?? p.y)}{' '}
        {p.isCapped ? '(Ausreißer)' : ''}
      </div>
    </div>
  );
}

// Punktform: Outlier = Dreieck, sonst Kreis
const PointShape = (props: any) => {
  const { cx, cy, payload, fill } = props;
  if (cx == null || cy == null) return null;

  if (payload?.isCapped) {
    return (
      <path
        d={`M ${cx} ${cy - 6} L ${cx - 6} ${cy + 6} L ${cx + 6} ${cy + 6} Z`}
        fill={fill}
      />
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill={fill} />;
};

export function SessionLapsScatterChart({ data, sessionName }: Props) {
  const cap =
    data.sessionStats?.p90_lap_ms != null
      ? Math.ceil(data.sessionStats.p90_lap_ms * 1.15)
      : undefined;

  const chartConfig: ChartConfig = Object.fromEntries(
    data.drivers.map((d) => [
      `driver_${d.driver.id}`,
      {
        label: `${d.driver.code ?? ''} ${d.driver.last_name}`.trim(),
        color: d.driver.color ?? 'var(--chart-1)',
      },
    ])
  );

  const series = data.drivers.map((d) => {
    const driverName = `${d.driver.code ?? ''} ${d.driver.last_name}`.trim();
    const driverColor = d.driver.color ?? 'var(--chart-1)';

    return {
      key: `driver_${d.driver.id}`,
      name: driverName,
      color: driverColor,
      stats: d.stats,
      points: d.laps
        .filter((l) => l.is_valid)
        .map((l) => {
          const y = l.lap_duration_ms;
          const isCapped = cap != null && y > cap;
          return {
            x: l.lap_number,
            y: isCapped ? cap : y,
            realY: y,
            isCapped,
            driverName,
            driverColor,
          };
        }),
    };
  });

  // xMax für Hover-Linien (damit sie über die ganze Chart-Breite gehen)
  const xMax = useMemo(() => {
    let max = 0;
    for (const s of series) {
      for (const p of s.points) {
        if (p.x > max) max = p.x;
      }
    }
    return Math.max(1, max);
  }, [series]);

  // Hover-Lines (unsichtbar, aber dicke Hover-Zone)
  const hoverLines = [
    // Session P90
    ...(data.sessionStats?.p90_lap_ms != null
      ? [
          {
            key: 'hover_p90',
            y: Number(data.sessionStats.p90_lap_ms),
            label: 'Session P90',
            color: 'var(--muted-foreground)',
          },
        ]
      : []),

    // pro Fahrer AVG/TB
    ...series.flatMap((s) => {
      const avg = toNum(s.stats?.avg_lap_ms);
      const tb = toNum(s.stats?.theoretical_best_ms);
      const out: Array<{
        key: string;
        y: number;
        label: string;
        color: string;
      }> = [];
      if (avg != null)
        out.push({
          key: `${s.key}_avg`,
          y: avg,
          label: `${s.name} AVG`,
          color: s.color,
        });
      if (tb != null)
        out.push({
          key: `${s.key}_tb`,
          y: tb,
          label: `${s.name} TB`,
          color: s.color,
        });
      return out;
    }),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rundenvergleich</CardTitle>
        <CardDescription>
          {sessionName ?? 'Session'} — jede Runde als Punkt (AVG/TB/P90
          hoverbar)
        </CardDescription>
      </CardHeader>

      <CardContent className='h-[650px]'>
        <ChartContainer config={chartConfig} className='h-full w-full'>
          <ScatterChart margin={{ left: 12, right: 24, top: 8, bottom: 8 }}>
            <Legend />
            <CartesianGrid />

            <XAxis
              xAxisId={X_ID}
              type='number'
              dataKey='x'
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId={Y_ID}
              type='number'
              dataKey='y'
              width={72}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)} s`}
              domain={cap != null ? [0, cap] : ['auto', 'auto']}
            />

            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={<LapsTooltip />}
            />

            {/* Punkte */}
            {series.map((s) => (
              <Scatter
                key={s.key}
                xAxisId={X_ID}
                yAxisId={Y_ID}
                name={s.name}
                data={s.points}
                fill={s.color}
                shape={<PointShape />}
              />
            ))}

            {/* Sichtbare Linien */}
            {data.sessionStats?.p90_lap_ms != null && (
              <ReferenceLine
                key='session_p90'
                xAxisId={X_ID}
                yAxisId={Y_ID}
                y={Number(data.sessionStats.p90_lap_ms)}
                stroke='var(--muted-foreground)'
                strokeDasharray='10 10'
                strokeWidth={2}
                isFront
                label={{
                  value: 'Session P90',
                  position: 'right',
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
            )}

            {series.map((s) => {
              const avg = toNum(s.stats?.avg_lap_ms);
              const tb = toNum(s.stats?.theoretical_best_ms);

              return (
                <React.Fragment key={`${s.key}_ref`}>
                  {avg != null && (
                    <ReferenceLine
                      xAxisId={X_ID}
                      yAxisId={Y_ID}
                      y={avg}
                      stroke={s.color}
                      strokeDasharray='12 12'
                      strokeWidth={2}
                      isFront
                      label={{
                        value: `${s.name} AVG`,
                        position: 'right',
                        fill: s.color,
                        fontSize: 11,
                      }}
                    />
                  )}

                  {tb != null && (
                    <ReferenceLine
                      xAxisId={X_ID}
                      yAxisId={Y_ID}
                      y={tb}
                      stroke={s.color}
                      strokeWidth={3}
                      strokeOpacity={0.85}
                      isFront
                      label={{
                        value: `${s.name} TB`,
                        position: 'right',
                        fill: s.color,
                        fontSize: 11,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Unsichtbare Hover-Linien (für Tooltip) */}
            {hoverLines.map((hl) => (
              <Line
                key={hl.key}
                xAxisId={X_ID}
                yAxisId={Y_ID}
                data={hoverLineData(hl.y, xMax, hl.label, hl.color)}
                dataKey='y'
                stroke='transparent'
                strokeWidth={14} // Hover-Zone
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                // wichtig: damit das Element oben liegt und Events bekommt
              />
            ))}
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
