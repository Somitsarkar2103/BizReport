import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  KpiMetric,
  LedgerEntry,
  PeriodRange,
  ScenarioType,
  ScreenId,
  TrajectoryPoint,
} from '../types/finance';
import { Sparkline } from '../components/Sparkline';
import { TrajectoryChart } from '../components/TrajectoryChart';

interface OverviewScreenProps {
  kpis: KpiMetric[];
  trajectory: TrajectoryPoint[];
  ledgerEntries: LedgerEntry[];
  period: PeriodRange;
  scenario: ScenarioType;
  onSelectLedger: (entry: LedgerEntry) => void;
  onNavigate: (screen: ScreenId) => void;
}

const UNIT_ECONOMICS = [
  { label: 'LTV / CAC Ratio', value: '5.8x', benchmark: 'Target > 4.0x' },
  { label: 'CAC Payback Period', value: '11.4 mo', benchmark: '-1.2 mo QoQ' },
  { label: 'SaaS Gross Margin', value: '81.2%', benchmark: '+1.4 pts YoY' },
  { label: 'SaaS Magic Number', value: '1.34', benchmark: 'Top quartile' },
  { label: 'Rule of 40 Index', value: '46%', benchmark: '44% growth · 2% margin' },
];

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  kpis,
  trajectory,
  ledgerEntries,
  period,
  scenario,
  onSelectLedger,
  onNavigate,
}) => {
  const [showPlan, setShowPlan] = useState(true);
  const [showBurn, setShowBurn] = useState(true);

  const recentLedger = ledgerEntries.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Metric Row */}
      <section aria-label="Key Financial Metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="obsidian-card rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-[#94A3B8] tracking-[0.01em]">
                {kpi.label}
              </span>
              <span
                className={`font-mono text-xs tabular-nums font-medium ${
                  kpi.deltaDirection === 'positive'
                    ? 'text-[#23C8B5]'
                    : kpi.deltaDirection === 'negative'
                    ? 'text-[#F43F5E]'
                    : 'text-[#C9C4D8]'
                }`}
              >
                {kpi.delta}
              </span>
            </div>

            <div className="font-display text-[30px] leading-[36px] font-bold tracking-[-0.03em] text-[#F8FAFC] tabular-nums">
              {kpi.value}
            </div>

            <div className="flex items-end justify-between gap-3 pt-1">
              <span className="text-xs text-[#94A3B8] truncate">{kpi.context}</span>
              <Sparkline data={kpi.sparkline} color={kpi.accentColor} id={kpi.id} />
            </div>
          </div>
        ))}
      </section>

      {/* Primary Focal Anchor: Revenue & Burn Trajectory */}
      <section className="obsidian-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#23314E]">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-[-0.015em] text-[#F8FAFC]">
              Revenue & Burn Trajectory
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              {scenario} model · {period} horizon · Hover any month for exact figures
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPlan((p) => !p)}
              className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                showPlan
                  ? 'bg-[#1E2C4A] border-[#33466E] text-[#F8FAFC]'
                  : 'bg-transparent border-[#23314E] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Plan Target
            </button>
            <button
              type="button"
              onClick={() => setShowBurn((b) => !b)}
              className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                showBurn
                  ? 'bg-[#23C8B5]/15 border-[#23C8B5]/40 text-[#23C8B5]'
                  : 'bg-transparent border-[#23314E] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Monthly Burn
            </button>
          </div>
        </div>

        <div className="pt-5">
          <TrajectoryChart data={trajectory} showPlan={showPlan} showBurn={showBurn} />
        </div>
      </section>

      {/* Secondary Analytical Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Unit Economics (Clean hairline dividers, no nested cards) */}
        <div className="lg:col-span-4 obsidian-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23314E]">
              <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                Unit Economics
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('revenue')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#cabeff] hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
              >
                <span>Cohorts</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#1A253F]">
              {UNIT_ECONOMICS.map((item) => (
                <div
                  key={item.label}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm text-[#d4e4fa]">{item.label}</div>
                    <div className="text-xs text-[#94A3B8]">{item.benchmark}</div>
                  </div>
                  <div className="font-mono text-base font-semibold tabular-nums text-[#F8FAFC]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#23314E] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Board target attainment</span>
            <span className="font-mono text-[#23C8B5] font-medium tabular-nums">103.6%</span>
          </div>
        </div>

        {/* Recent Ledger & Variance Queue */}
        <div className="lg:col-span-8 obsidian-card rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#23314E]">
            <div>
              <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                Recent Ledger & Variance Queue
              </h2>
              <p className="mt-0.5 text-xs text-[#94A3B8]">
                Click any row to inspect variance details or update reconciliation status
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('treasury')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#cabeff] hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Full ledger</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111A2E] border-b border-[#23314E] text-[11px] font-semibold tracking-[0.04em] text-[#94A3B8]">
                  <th className="py-3 pl-6 pr-3">Vendor</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Variance</th>
                  <th className="py-3 pl-3 pr-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A253F] text-sm">
                {recentLedger.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => onSelectLedger(entry)}
                    className="h-[52px] hover:bg-white/[0.025] cursor-pointer transition-colors"
                  >
                    <td className="pl-6 pr-3">
                      <div className="font-medium text-[#F8FAFC]">{entry.vendor}</div>
                      <div className="text-xs text-[#94A3B8] font-mono tabular-nums">
                        {entry.date}
                      </div>
                    </td>
                    <td className="px-3 text-[#C9C4D8] whitespace-nowrap">{entry.category}</td>
                    <td className="px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          entry.status === 'Reconciled'
                            ? 'text-[#23C8B5]'
                            : entry.status === 'Pending'
                            ? 'text-[#F59E0B]'
                            : 'text-[#F43F5E]'
                        }`}
                      >
                        {entry.status === 'Reconciled' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {entry.status === 'Pending' && <AlertTriangle className="h-3.5 w-3.5" />}
                        {entry.status === 'Flagged' && <AlertCircle className="h-3.5 w-3.5" />}
                        <span>{entry.status}</span>
                      </span>
                    </td>
                    <td
                      className={`px-3 text-right font-mono tabular-nums ${
                        entry.variancePercent > 5
                          ? 'text-[#F43F5E]'
                          : entry.variancePercent < 0
                          ? 'text-[#23C8B5]'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {entry.variancePercent > 0 ? '+' : ''}
                      {entry.variancePercent.toFixed(1)}%
                    </td>
                    <td className="pl-3 pr-6 text-right font-mono font-medium tabular-nums text-[#F8FAFC]">
                      ${entry.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
