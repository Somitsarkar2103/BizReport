import React from 'react';

interface RunwayPoint {
  monthLabel: string;
  baselineCashM: number;
  simulatedCashM: number;
}

interface RunwayProjectionChartProps {
  points: RunwayPoint[];
}

export const RunwayProjectionChart: React.FC<RunwayProjectionChartProps> = ({ points }) => {
  const width = 720;
  const height = 220;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 32;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxCash = Math.max(
    7.5,
    ...points.map((p) => Math.max(p.baselineCashM, p.simulatedCashM))
  );

  const getX = (i: number) =>
    padLeft + (i / Math.max(points.length - 1, 1)) * plotW;
  const getY = (val: number) =>
    padTop + plotH - (Math.max(0, val) / maxCash) * plotH;

  const basePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.baselineCashM).toFixed(1)}`)
    .join(' ');

  const simPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.simulatedCashM).toFixed(1)}`)
    .join(' ');

  const simArea = `${simPath} L ${getX(points.length - 1).toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const yTicks = [0, 2, 4, 6];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label="Simulated treasury cash projection over 24 months"
    >
      <defs>
        <linearGradient id="runwaySimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23C8B5" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#23C8B5" stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {yTicks.map((val) => {
        const y = getY(val);
        return (
          <g key={val}>
            <line
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke={val === 0 ? '#33466E' : '#23314E'}
              strokeDasharray={val === 0 ? undefined : '3 4'}
            />
            <text
              x={padLeft - 10}
              y={y + 4}
              textAnchor="end"
              className="fill-[#94A3B8] text-[11px] font-mono tabular-nums"
            >
              ${val.toFixed(1)}M
            </text>
          </g>
        );
      })}

      {/* Baseline */}
      <path
        d={basePath}
        fill="none"
        stroke="#94A3B8"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />

      {/* Simulated */}
      <path d={simArea} fill="url(#runwaySimGrad)" />
      <path
        d={simPath}
        fill="none"
        stroke="#23C8B5"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((pt, idx) => {
        if (idx % 3 !== 0 && idx !== points.length - 1) return null;
        return (
          <text
            key={pt.monthLabel}
            x={getX(idx)}
            y={height - 10}
            textAnchor="middle"
            className="fill-[#94A3B8] text-[11px] font-mono"
          >
            {pt.monthLabel}
          </text>
        );
      })}
    </svg>
  );
};
