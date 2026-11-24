import React, { useMemo, useState } from 'react';
import {
  Plus,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import {
  LedgerCategory,
  LedgerEntry,
  ReconciliationStatus,
} from '../types/finance';
import { RunwayProjectionChart } from '../components/RunwayProjectionChart';

interface TreasuryScreenProps {
  ledgerEntries: LedgerEntry[];
  onSelectLedger: (entry: LedgerEntry) => void;
  onOpenLogModal: () => void;
  onExportCsv: () => void;
}

type CategoryFilter = 'All' | LedgerCategory;
type StatusFilter = 'All' | ReconciliationStatus;

export const TreasuryScreen: React.FC<TreasuryScreenProps> = ({
  ledgerEntries,
  onSelectLedger,
  onOpenLogModal,
  onExportCsv,
}) => {
  // Interactive Runway Stress-Test parameters
  const [hiringPace, setHiringPace] = useState(2); // new FTEs/quarter
  const [revenueGrowthPct, setRevenueGrowthPct] = useState(18); // annualized %
  const [cloudSavingsPct, setCloudSavingsPct] = useState(10); // % saved

  // Ledger filters
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const { projectionPoints, simulatedRunwayMonths, effectiveMonthlyBurnK } = useMemo(() => {
    const startingCashM = 6.3;
    const baseMonthlyBurnK = 184.2;
    const fteCostPerMonthK = 14.5;
    const cloudBaseK = 72;

    const addedPayrollK = hiringPace * fteCostPerMonthK;
    const savedCloudK = (cloudBaseK * cloudSavingsPct) / 100;
    const revOffsetK = ((revenueGrowthPct - 18) / 100) * 95;

    const netBurnK = Math.max(45, baseMonthlyBurnK + addedPayrollK - savedCloudK - revOffsetK);
    const months = ['Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec 27', 'Feb 28', 'Apr 28'];

    const points = months.map((label, idx) => {
      const m = idx * 3;
      const baselineCashM = Number(Math.max(0, startingCashM - (baseMonthlyBurnK * m) / 1000).toFixed(2));
      const simulatedCashM = Number(Math.max(0, startingCashM - (netBurnK * m) / 1000).toFixed(2));
      return {
        monthLabel: label,
        baselineCashM,
        simulatedCashM,
      };
    });

    return {
      projectionPoints: points,
      simulatedRunwayMonths: Number(((startingCashM * 1000) / netBurnK).toFixed(1)),
      effectiveMonthlyBurnK: Number(netBurnK.toFixed(1)),
    };
  }, [cloudSavingsPct, hiringPace, revenueGrowthPct]);

  const filteredLedger = useMemo(() => {
    return ledgerEntries
      .filter((e) => (categoryFilter === 'All' ? true : e.category === categoryFilter))
      .filter((e) => (statusFilter === 'All' ? true : e.status === statusFilter));
  }, [categoryFilter, ledgerEntries, statusFilter]);

  const totalShownSpend = useMemo(
    () => filteredLedger.reduce((acc, item) => acc + item.amount, 0),
    [filteredLedger]
  );

  return (
    <div className="space-y-6">
      {/* Runway & Hiring Stress Test */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 obsidian-card rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23314E]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
                  Runway Stress Test
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Model hiring & efficiency impact on $6.30M cash
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHiringPace(2);
                  setRevenueGrowthPct(18);
                  setCloudSavingsPct(10);
                }}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111A2E]"
                title="Reset sliders"
                aria-label="Reset stress test parameters"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor="slider-hiring" className="text-[#d4e4fa]">
                    Quarterly Hiring Pace
                  </label>
                  <span className="font-mono tabular-nums text-[#cabeff]">
                    +{hiringPace} FTEs
                  </span>
                </div>
                <input
                  id="slider-hiring"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={hiringPace}
                  onChange={(e) => setHiringPace(Number(e.target.value))}
                  className="w-full accent-[#7C5CFC] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor="slider-growth" className="text-[#d4e4fa]">
                    Net ARR Growth Rate
                  </label>
                  <span className="font-mono tabular-nums text-[#23C8B5]">
                    {revenueGrowthPct}%
                  </span>
                </div>
                <input
                  id="slider-growth"
                  type="range"
                  min={-5}
                  max={35}
                  step={1}
                  value={revenueGrowthPct}
                  onChange={(e) => setRevenueGrowthPct(Number(e.target.value))}
                  className="w-full accent-[#23C8B5] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor="slider-cloud" className="text-[#d4e4fa]">
                    Cloud Infra Optimization
                  </label>
                  <span className="font-mono tabular-nums text-[#23C8B5]">
                    {cloudSavingsPct}% saved
                  </span>
                </div>
                <input
                  id="slider-cloud"
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={cloudSavingsPct}
                  onChange={(e) => setCloudSavingsPct(Number(e.target.value))}
                  className="w-full accent-[#23C8B5] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#23314E] grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#94A3B8]">Simulated Runway</div>
              <div
                className={`mt-1 font-display text-2xl font-bold tabular-nums ${
                  simulatedRunwayMonths >= 24
                    ? 'text-[#23C8B5]'
                    : simulatedRunwayMonths >= 15
                    ? 'text-[#F59E0B]'
                    : 'text-[#F43F5E]'
                }`}
              >
                {simulatedRunwayMonths} mo
              </div>
            </div>
            <div>
              <div className="text-xs text-[#94A3B8]">Projected Net Burn</div>
              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#F8FAFC]">
                ${effectiveMonthlyBurnK}K
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 obsidian-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#23314E]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
                24-Month Treasury Cash Projection
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Simulated cash balance (solid) vs. current operating baseline (dashed)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#23C8B5]">Simulated</span>
              <span className="text-[#94A3B8]">Baseline</span>
            </div>
          </div>

          <div className="pt-5">
            <RunwayProjectionChart points={projectionPoints} />
          </div>
        </div>
      </section>

      {/* Operating Ledger & Expense Reconciliation */}
      <section className="obsidian-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#23314E] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Operating Ledger & Reconciliations
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {filteredLedger.length} transactions · Total ${totalShownSpend.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#111A2E] border border-[#23314E] overflow-x-auto">
              {(['All', 'Cloud & Infra', 'Payroll', 'GTM & Sales', 'G&A'] as CategoryFilter[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-[#7C5CFC] text-[#F8FAFC]'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter by reconciliation status"
              className="h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 text-xs font-medium text-[#F8FAFC] focus:outline-none focus:border-[#7C5CFC]"
            >
              <option value="All">All Statuses</option>
              <option value="Flagged">Flagged</option>
              <option value="Pending">Pending</option>
              <option value="Reconciled">Reconciled</option>
            </select>

            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#23314E] text-xs font-medium text-[#F8FAFC] hover:bg-[#1E2C4A]/60 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-xs font-medium text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Entry</span>
            </button>
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="font-display text-base font-medium text-[#F8FAFC]">
              No ledger entries match the current filters
            </div>
            <p className="text-sm text-[#94A3B8]">
              Reset filters or log a new operating expense entry.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('All');
                setStatusFilter('All');
              }}
              className="h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-sm font-medium text-[#F8FAFC]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111A2E] border-b border-[#23314E] text-[11px] font-semibold tracking-[0.04em] text-[#94A3B8]">
                  <th className="py-3 pl-6 pr-3">Date</th>
                  <th className="py-3 px-3">Vendor & Memo</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Variance</th>
                  <th className="py-3 pl-3 pr-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A253F] text-sm">
                {filteredLedger.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => onSelectLedger(entry)}
                    className="h-[52px] hover:bg-white/[0.025] cursor-pointer transition-colors"
                  >
                    <td className="pl-6 pr-3 font-mono text-xs tabular-nums text-[#94A3B8] whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-3">
                      <div className="font-medium text-[#F8FAFC]">{entry.vendor}</div>
                      <div className="text-xs text-[#94A3B8] truncate max-w-md">
                        {entry.description}
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
        )}
      </section>
    </div>
  );
};
