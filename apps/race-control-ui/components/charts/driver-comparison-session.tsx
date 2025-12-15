'use client';

import React from 'react';
import {
  CartesianGrid,
  Legend,
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

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const fmt = (ms: unknown) => {
  const n = num(ms);
  return n == null ? '—' : `${(n / 1000).toFixed(3)}s`;
};

function LapsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

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
        Runde {p.x} · {fmt(p.realY ?? p.y)} {p.isCapped ? '(Ausreißer)' : ''}
      </div>
    </div>
  );
}

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

function ChartKeyRow({
  sessionP90,
  cap,
}: {
  sessionP90: number | null;
  cap: number | null;
}) {
  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground'>
      <span className='inline-flex items-center gap-2'>
        <span className='h-2 w-2 rounded-full bg-muted-foreground' />
        Runde
      </span>

      <span className='inline-flex items-center gap-2'>
        <span className='inline-block h-0 w-0 border-x-[6px] border-x-transparent border-b-[10px] border-b-muted-foreground' />
        Ausreißer (gecappt)
      </span>

      <span className='inline-flex items-center gap-2'>
        <span
          className='h-[2px] w-8 bg-muted-foreground opacity-60'
          style={{ borderTop: '2px dashed' }}
        />
        Session P90
      </span>

      <span className='ml-auto inline-flex items-center gap-3'>
        <span>
          P90:{' '}
          <span className='font-mono text-foreground'>{fmt(sessionP90)}</span>
        </span>
        <span>
          Cap: <span className='font-mono text-foreground'>{fmt(cap)}</span>
        </span>
      </span>
    </div>
  );
}

function CustomLegend({
  seriesMeta,
  sessionP90,
  cap,
}: {
  seriesMeta: Array<{
    name: string;
    color: string;
    avg: number | null;
    tb: number | null;
    p90: number | null;
    std: number | null;
  }>;
  sessionP90: number | null;
  cap: number | null;
}) {
  return (
    <div className='space-y-2  pb-10'>
      <ChartKeyRow sessionP90={sessionP90} cap={cap} />

      <div className='flex flex-col gap-1'>
        {seriesMeta.map((m) => (
          <div
            key={m.name}
            className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'
          >
            <span className='inline-flex items-center gap-2'>
              <span
                className='h-2.5 w-2.5 rounded-full'
                style={{ background: m.color }}
              />
              <span className='font-medium'>{m.name}</span>
            </span>

            <span className='text-muted-foreground'>
              AVG{' '}
              <span className='font-mono text-foreground'>{fmt(m.avg)}</span>
            </span>

            <span className='text-muted-foreground'>
              TB <span className='font-mono text-foreground'>{fmt(m.tb)}</span>
            </span>

            <span className='text-muted-foreground'>
              P90{' '}
              <span className='font-mono text-foreground'>{fmt(m.p90)}</span>
            </span>

            <span className='text-muted-foreground'>
              σ{' '}
              <span className='font-mono text-foreground'>
                {m.std != null ? `${(m.std / 1000).toFixed(3)}s` : '—'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionLapsScatterChart({ data, sessionName }: Props) {
  const sessionP90 = num(data.sessionStats?.p90_lap_ms);
  const cap = sessionP90 != null ? Math.ceil(sessionP90 * 1.15) : null;

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
          const yReal = l.lap_duration_ms;
          const isCapped = cap != null && yReal > cap;
          return {
            x: l.lap_number,
            y: isCapped ? cap : yReal,
            realY: yReal,
            isCapped,
            driverName,
            driverColor,
          };
        }),
    };
  });

  const seriesMeta = series.map((s) => ({
    name: s.name,
    color: s.color,
    avg: num(s.stats?.avg_lap_ms),
    tb: num(s.stats?.theoretical_best_ms),
    p90: num(s.stats?.p90_lap_ms),
    std:
      typeof s.stats?.stddev_lap_ms === 'number' ? s.stats.stddev_lap_ms : null,
  }));

  // ReferenceLines: erst sammeln, dann rendern (ohne Fragment)
  const lineSessionP90 =
    sessionP90 != null ? (
      <ReferenceLine
        key='line_session_p90'
        xAxisId={X_ID}
        yAxisId={Y_ID}
        y={sessionP90}
        stroke='var(--muted-foreground)'
        strokeDasharray='10 10'
        strokeWidth={2}
        isFront
        label={{
          value: 'P90',
          position: 'left',
          fill: 'var(--muted-foreground)',
          fontSize: 11,
        }}
      />
    ) : null;

  const avgLines = series
    .map((s) => {
      const y = num(s.stats?.avg_lap_ms);
      if (y == null) return null;
      return (
        <ReferenceLine
          key={`line_${s.key}_avg`}
          xAxisId={X_ID}
          yAxisId={Y_ID}
          y={y}
          stroke={s.color}
          strokeDasharray='12 12'
          strokeWidth={2}
          strokeOpacity={0.95}
          isFront
          label={{
            value: 'AVG',
            position: 'left',
            fill: s.color,
            fontSize: 11,
          }}
        />
      );
    })
    .filter(Boolean);

  const tbLines = series
    .map((s) => {
      const y = num(s.stats?.theoretical_best_ms);
      if (y == null) return null;
      return (
        <ReferenceLine
          key={`line_${s.key}_tb`}
          xAxisId={X_ID}
          yAxisId={Y_ID}
          y={y}
          stroke={s.color}
          strokeWidth={3}
          strokeOpacity={0.85}
          isFront
          label={{
            value: 'TB',
            position: 'left',
            fill: s.color,
            fontSize: 11,
          }}
        />
      );
    })
    .filter(Boolean);

  const refLines = [lineSessionP90, ...avgLines, ...tbLines].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rundenvergleich</CardTitle>
        <CardDescription>
          {sessionName ?? 'Session'} — Linien: AVG/TB (Fahrerfarbe), grau:
          Session P90
        </CardDescription>
      </CardHeader>

      <CardContent className='h-[650px]'>
        <ChartContainer config={chartConfig} className='h-full w-full'>
          <ScatterChart margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
            <Legend
              verticalAlign='top'
              content={
                <CustomLegend
                  seriesMeta={seriesMeta}
                  sessionP90={sessionP90}
                  cap={cap}
                />
              }
            />

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

            {/* Linien oben drüber */}
            {refLines}
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
