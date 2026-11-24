import React, { useState } from 'react';
import { MrrMovementPoint } from '../types/finance';

interface MrrWaterfallChartProps {
  data: MrrMovementPoint[];
}

export const MrrWaterfallChart: React.FC<MrrWaterfallChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 760;
  const height = 250;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxPositive = 500;
  const maxNegative = -100;
  const totalRange = maxPositive - maxNegative;

  const zeroY = padTop + (maxPositive / totalRange) * plotH;
  const scaleY = (val: number) => (Math.abs(val) / totalRange) * plotH;

  const bandW = plotW / data.length;
  const barW = Math.min(44, bandW * 0.48);

  const ticks = [450, 300, 150, 0, -75];

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Monthly MRR movement breakdown"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {ticks.map((tick) => {
          const y = padTop + ((maxPositive - tick) / totalRange) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={tick === 0 ? '#33466E' : '#23314E'}
                strokeWidth={tick === 0 ? 1.25 : 1}
                strokeDasharray={tick === 0 ? undefined : '3 4'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#94A3B8] text-[11px] font-mono tabular-nums"
              >
                {tick === 0 ? '$0' : tick > 0 ? `$${tick}K` : `-$${Math.abs(tick)}K`}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const cx = padLeft + bandW * i + bandW / 2;
          const x = cx - barW / 2;
          const newH = scaleY(d.newBusiness);
          const expH = scaleY(d.expansion);
          const contH = scaleY(d.contraction);
          const churnH = scaleY(d.churn);

          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.month}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            >
              {isHovered && (
                <rect
                  x={cx - bandW * 0.36}
                  y={padTop}
                  width={bandW * 0.72}
                  height={plotH}
                  rx={8}
                  fill="rgba(124, 92, 252, 0.08)"
                />
              )}

              {/* New Business */}
              <rect
                x={x}
                y={zeroY - newH}
                width={barW}
                height={newH}
                rx={2}
                fill="#7C5CFC"
                opacity={hoveredIdx === null || isHovered ? 0.95 : 0.45}
              />

              {/* Expansion stacked above New */}
              <rect
                x={x}
                y={zeroY - newH - expH - 2}
                width={barW}
                height={expH}
                rx={3}
                fill="#23C8B5"
                opacity={hoveredIdx === null || isHovered ? 0.95 : 0.45}
              />

              {/* Contraction below zero */}
              <rect
                x={x}
                y={zeroY + 2}
                width={barW}
                height={contH}
                rx={2}
                fill="#F59E0B"
                opacity={hoveredIdx === null || isHovered ? 0.9 : 0.45}
              />

              {/* Churn stacked below contraction */}
              <rect
                x={x}
                y={zeroY + contH + 4}
                width={barW}
                height={churnH}
                rx={2}
                fill="#F43F5E"
                opacity={hoveredIdx === null || isHovered ? 0.9 : 0.45}
              />

              {/* Net New marker */}
              <text
                x={cx}
                y={zeroY - newH - expH - 9}
                textAnchor="middle"
                className="fill-[#F8FAFC] text-[10px] font-mono tabular-nums font-medium"
              >
                +${d.netNew}K
              </text>

              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                className={`text-[11px] font-mono ${
                  isHovered ? 'fill-[#F8FAFC] font-semibold' : 'fill-[#94A3B8]'
                }`}
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIdx !== null && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[#23314E] pt-3 text-xs font-mono tabular-nums">
          <span className="font-display font-semibold text-[#F8FAFC]">
            {data[hoveredIdx].month} 2026 Breakdown
          </span>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-[#cabeff]">New: +${data[hoveredIdx].newBusiness}K</span>
            <span className="text-[#23C8B5]">Expansion: +${data[hoveredIdx].expansion}K</span>
            <span className="text-[#F59E0B]">Contraction: -${Math.abs(data[hoveredIdx].contraction)}K</span>
            <span className="text-[#F43F5E]">Churn: -${Math.abs(data[hoveredIdx].churn)}K</span>
            <span className="text-[#F8FAFC] font-semibold">Net New: +${data[hoveredIdx].netNew}K</span>
          </div>
        </div>
      )}
    </div>
  );
};
