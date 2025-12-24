'use client';

import React from 'react';
import {
  CartesianGrid,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Drivers, Laps } from '@/lib/types';
import { safeMin } from '@/lib/utils';

const Y_MIN_MS = 5000;

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmt = (ms: unknown) => {
  const n = num(ms);
  return n == null ? '—' : `${(n / 1000).toFixed(3)}s`;
};

// nearest-rank p90 (stabil, reicht fürs UI)
function p90(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  // nearest rank: ceil(0.9*n) - 1
  const idx = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil(0.9 * sorted.length) - 1)
  );
  return sorted[idx] ?? null;
}

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

function ChartKeyRow({ cap }: { cap: number | null }) {
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

      <span className='ml-auto inline-flex items-center gap-3'>
        <span>
          Cap: <span className='font-mono text-foreground'>{fmt(cap)}</span>
        </span>
      </span>
    </div>
  );
}

function CustomLegend({
  driverName,
  driverColor,

  cap,
}: {
  driverName: string;
  driverColor: string;
  cap: number | null;
}) {
  return (
    <div className='space-y-2 pb-6'>
      <ChartKeyRow cap={cap} />

      <div className='flex flex-col gap-1'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
          <span className='inline-flex items-center gap-2'>
            <span
              className='h-2.5 w-2.5 rounded-full'
              style={{ background: driverColor }}
            />
            <span className='font-medium'>{driverName}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function LapsScatterChart({
  laps,
  driver,
  title = 'Rundenzeiten',
}: {
  laps: Laps[];
  driver: Drivers;
  title?: string;
}) {
  const driverName =
    `${driver.code ?? ''} ${driver.last_name ?? driver.first_name ?? ''}`.trim() ||
    'Driver';
  const driverColor = driver.color ?? 'var(--chart-1)';

  const valid = (laps ?? [])
    .filter((l) => l.is_valid)
    .map((l) => ({ lap: l.lap_number, ms: l.lap_duration_ms }))
    .filter((x) => Number.isFinite(x.lap) && Number.isFinite(x.ms));

  const bestS1Ms = safeMin(laps.map((l) => l.duration_sector1));
  const bestS2Ms = safeMin(laps.map((l) => l.duration_sector2));
  const theoretically = bestS1Ms! + bestS2Ms!;

  console.log(bestS1Ms, bestS2Ms);
  console.log(theoretically);

  const sessionP90 = p90(valid.map((v) => v.ms));
  const cap = sessionP90 != null ? Math.ceil(sessionP90 * 1.1) : null;

  const points = valid.map((l) => {
    const isCapped = cap != null && l.ms > cap;
    return {
      x: l.lap,
      y: isCapped ? cap : l.ms,
      realY: l.ms,
      isCapped,
      driverName,
      driverColor,
    };
  });

  // ... valid bleibt gleich

  const times = valid.map((v) => v.ms);
  const bestLapMs = times.length ? Math.min(...times) : null;
  const avgLapMs = times.length
    ? Math.round(times.reduce((s, v) => s + v, 0) / times.length)
    : null;

  // domain: nicht bei 0 starten, sonst sieht es immer "leer" aus
  const yMin = bestLapMs != null ? Math.floor(bestLapMs * 0.98) : 'auto';
  const yMax = cap != null ? cap : Math.max(...times, 0) * 1.05 || 'auto'; // kleiner Puffer

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className='h-[520px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <ScatterChart margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
            <Legend
              verticalAlign='top'
              content={
                <CustomLegend
                  driverName={driverName}
                  driverColor={driverColor}
                  cap={cap}
                />
              }
            />

            <XAxis
              type='number'
              dataKey='x'
              name='Runde'
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />

            <YAxis
              type='number'
              dataKey='y'
              name='Rundenzeit'
              width={40}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)} s`}
              domain={[Y_MIN_MS, yMax]}
            />
            <CartesianGrid strokeDasharray='3 3' />

            {bestLapMs != null && (
              <ReferenceLine
                y={bestLapMs}
                strokeDasharray='2 4'
                stroke='var(--best-lap)'
                name='Beste Runde'
                label={{
                  value: `Beste ${fmt(bestLapMs)}`,
                  position: 'insideTopLeft',
                  fill: 'var(--best-lap)',
                }}
              />
            )}

            <ReferenceLine
              y={theoretically}
              stroke='var(--theoretically-best)'
              strokeDasharray='4 4'
              label={{
                value: `TB ${fmt(theoretically)}`,
                position: 'insideTopRight',
                fill: 'var(--theoretically-best)',
              }}
            />

            {avgLapMs != null && (
              <ReferenceLine
                y={avgLapMs}
                strokeDasharray='6 6'
                name='Durchschnitt'
                label={{
                  value: `Ø ${fmt(avgLapMs)}`,
                  position: 'insideTopLeft',
                }}
              />
            )}

            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={<LapsTooltip />}
            />

            <Scatter
              name={driverName}
              data={points}
              fill={driverColor}
              shape={<PointShape />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
