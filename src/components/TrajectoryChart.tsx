import React, { useState } from 'react';
import { TrajectoryPoint } from '../types/finance';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  showPlan: boolean;
  showBurn: boolean;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  data,
  showPlan,
  showBurn,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 820;
  const height = 280;
  const padLeft = 52;
  const padRight = 54;
  const padTop = 20;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const arrValues = data.flatMap((d) => (showPlan ? [d.arr, d.planTarget] : [d.arr]));
  const minArr = Math.floor(Math.min(...arrValues) * 0.92);
  const maxArr = Math.ceil(Math.max(...arrValues) * 1.05);
  const arrRange = maxArr - minArr || 1;

  const burnValues = data.map((d) => d.operatingBurn);
  const minBurn = Math.floor(Math.min(...burnValues) * 0.85);
  const maxBurn = Math.ceil(Math.max(...burnValues) * 1.15);
  const burnRange = maxBurn - minBurn || 1;

  const getX = (idx: number) =>
    padLeft + (data.length === 1 ? plotW / 2 : (idx / (data.length - 1)) * plotW);

  const getYArr = (val: number) =>
    padTop + plotH - ((val - minArr) / arrRange) * plotH;

  const getYBurn = (val: number) =>
    padTop + plotH - ((val - minBurn) / burnRange) * plotH;

  const arrPath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYArr(pt.arr).toFixed(1)}`)
    .join(' ');

  const arrAreaPath = `${arrPath} L ${getX(data.length - 1).toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const planPath = data
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYArr(pt.planTarget).toFixed(1)}`
    )
    .join(' ');

  const burnPath = data
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYBurn(pt.operatingBurn).toFixed(1)}`
    )
    .join(' ');

  const yTicks = 4;
  const arrTickValues = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minArr + (arrRange * i) / yTicks;
    return { val, y: getYArr(val) };
  });

  const activePoint = hoverIdx !== null ? data[hoverIdx] : null;
  const activeX = hoverIdx !== null ? getX(hoverIdx) : 0;

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Committed ARR, operating plan target, and monthly burn trajectory"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="arrAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5CFC" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#7C5CFC" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {arrTickValues.map((t, idx) => (
          <g key={idx}>
            <line
              x1={padLeft}
              y1={t.y}
              x2={width - padRight}
              y2={t.y}
              stroke="#23314E"
              strokeWidth={1}
              strokeDasharray={idx === 0 ? undefined : '3 4'}
            />
            <text
              x={padLeft - 10}
              y={t.y + 4}
              textAnchor="end"
              className="fill-[#94A3B8] text-[11px] font-mono tabular-nums"
            >
              ${t.val.toFixed(1)}M
            </text>
          </g>
        ))}

        {/* Right axis labels for burn */}
        {showBurn && (
          <>
            <text
              x={width - padRight + 10}
              y={padTop + 4}
              textAnchor="start"
              className="fill-[#23C8B5] text-[11px] font-mono tabular-nums"
            >
              ${maxBurn}K
            </text>
            <text
              x={width - padRight + 10}
              y={padTop + plotH + 4}
              textAnchor="start"
              className="fill-[#23C8B5] text-[11px] font-mono tabular-nums"
            >
              ${minBurn}K
            </text>
          </>
        )}

        {/* Plan Target dashed line */}
        {showPlan && (
          <path
            d={planPath}
            fill="none"
            stroke="#94A3B8"
            strokeOpacity={0.65}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
        )}

        {/* Operating Burn line */}
        {showBurn && (
          <path
            d={burnPath}
            fill="none"
            stroke="#23C8B5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* ARR area + line */}
        <path d={arrAreaPath} fill="url(#arrAreaGrad)" />
        <path
          d={arrPath}
          fill="none"
          stroke="#7C5CFC"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover crosshair */}
        {hoverIdx !== null && activePoint && (
          <g>
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + plotH}
              stroke="#7C5CFC"
              strokeOpacity={0.45}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle
              cx={activeX}
              cy={getYArr(activePoint.arr)}
              r={5}
              fill="#7C5CFC"
              stroke="#0B1020"
              strokeWidth={2}
            />
            {showBurn && (
              <circle
                cx={activeX}
                cy={getYBurn(activePoint.operatingBurn)}
                r={4}
                fill="#23C8B5"
                stroke="#0B1020"
                strokeWidth={2}
              />
            )}
          </g>
        )}

        {/* X-axis month labels & invisible hit zones */}
        {data.map((pt, i) => {
          const x = getX(i);
          const colW = plotW / Math.max(data.length - 1, 1);
          return (
            <g key={pt.month}>
              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className={`text-[11px] font-mono ${
                  hoverIdx === i ? 'fill-[#F8FAFC] font-semibold' : 'fill-[#94A3B8]'
                }`}
              >
                {pt.month}
              </text>
              <rect
                x={x - colW / 2}
                y={padTop}
                width={colW}
                height={plotH + 24}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIdx(i)}
              />
            </g>
          );
        })}
      </svg>

      {/* Glass Tooltip */}
      {hoverIdx !== null && activePoint && (
        <div
          className="pointer-events-none absolute top-3 z-20 rounded-xl px-3.5 py-2.5 obsidian-glass text-xs"
          style={{
            left: `min(calc(${((activeX / width) * 100).toFixed(1)}% + 12px), calc(100% - 196px))`,
          }}
        >
          <div className="font-display font-semibold text-[#F8FAFC] mb-1.5">
            {activePoint.month} 2026
          </div>
          <div className="space-y-1 font-mono tabular-nums">
            <div className="flex items-center justify-between gap-5">
              <span className="text-[#94A3B8]">Committed ARR</span>
              <span className="text-[#F8FAFC] font-medium">${activePoint.arr.toFixed(2)}M</span>
            </div>
            {showPlan && (
              <div className="flex items-center justify-between gap-5">
                <span className="text-[#94A3B8]">Plan Target</span>
                <span className="text-[#C9C4D8]">${activePoint.planTarget.toFixed(2)}M</span>
              </div>
            )}
            {showBurn && (
              <div className="flex items-center justify-between gap-5">
                <span className="text-[#94A3B8]">Monthly Burn</span>
                <span className="text-[#23C8B5] font-medium">${activePoint.operatingBurn}K</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
