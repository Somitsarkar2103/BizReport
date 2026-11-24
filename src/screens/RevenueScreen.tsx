import React, { useMemo, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import {
  COHORT_RETENTION_DATA,
  MRR_MOVEMENT_DATA,
} from '../data/financeData';
import { AccountRecord, AccountSegment } from '../types/finance';
import { MrrWaterfallChart } from '../components/MrrWaterfallChart';

interface RevenueScreenProps {
  accounts: AccountRecord[];
  onSelectAccount: (account: AccountRecord) => void;
}

type SegmentFilter = 'All' | AccountSegment;
type SortField = 'name' | 'currentArr' | 'expansionDelta' | 'ndrPercent';

export const RevenueScreen: React.FC<RevenueScreenProps> = ({
  accounts,
  onSelectAccount,
}) => {
  const [segment, setSegment] = useState<SegmentFilter>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('currentArr');
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredCohort, setHoveredCohort] = useState<{
    cohort: string;
    monthIdx: number;
    pct: number;
    retainedArrK: number;
  } | null>(null);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts
      .filter((a) => (segment === 'All' ? true : a.segment === segment))
      .filter(
        (a) =>
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.owner.toLowerCase().includes(q) ||
          a.segment.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [accounts, search, segment, sortAsc, sortField]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getCellStyle = (val: number | null) => {
    if (val === null) return 'bg-[#0B1020]/40 text-[#484555]';
    if (val >= 115) return 'bg-[#23C8B5]/20 text-[#68f9e4]';
    if (val >= 105) return 'bg-[#23C8B5]/10 text-[#23C8B5]';
    if (val >= 100) return 'bg-[#7C5CFC]/15 text-[#cabeff]';
    return 'bg-[#F59E0B]/15 text-[#ffb95f]';
  };

  return (
    <div className="space-y-6">
      {/* Top Analytical Split: MRR Movement + Cohort Retention Matrix */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 obsidian-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#23314E]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
                Monthly MRR Movement
              </h2>
              <p className="text-xs text-[#94A3B8]">
                New business, expansion, contraction, and gross churn ($K)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <span className="text-[#cabeff]">New</span>
              <span className="text-[#23C8B5]">Expansion</span>
              <span className="text-[#F43F5E]">Churn</span>
            </div>
          </div>

          <div className="pt-5">
            <MrrWaterfallChart data={MRR_MOVEMENT_DATA} />
          </div>
        </div>

        {/* Net Dollar Retention Cohort Matrix */}
        <div className="xl:col-span-6 obsidian-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#23314E]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
                  Net Dollar Retention Cohorts
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Cohort revenue expansion by month since contract start
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#23C8B5]">
                Avg M6: 125%
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-1">
                <thead>
                  <tr className="text-[11px] font-medium text-[#94A3B8]">
                    <th className="text-left py-1.5 pr-2 font-medium">Cohort</th>
                    <th className="text-right py-1.5 px-2 font-medium">Base</th>
                    {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((m) => (
                      <th key={m} className="py-1.5 px-1 font-mono font-medium">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs font-mono tabular-nums">
                  {COHORT_RETENTION_DATA.map((row) => (
                    <tr key={row.cohort}>
                      <td className="text-left py-1.5 pr-2 font-sans text-[#d4e4fa] whitespace-nowrap">
                        {row.cohort}
                      </td>
                      <td className="text-right py-1.5 px-2 text-[#94A3B8] whitespace-nowrap">
                        ${row.startingArr}K
                      </td>
                      {row.retention.map((pct, mIdx) => (
                        <td key={mIdx}>
                          <button
                            type="button"
                            disabled={pct === null}
                            onMouseEnter={() => {
                              if (pct !== null) {
                                setHoveredCohort({
                                  cohort: row.cohort,
                                  monthIdx: mIdx,
                                  pct,
                                  retainedArrK: Math.round((row.startingArr * pct) / 100),
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredCohort(null)}
                            className={`w-full h-8 rounded-md flex items-center justify-center transition-transform ${getCellStyle(
                              pct
                            )} ${pct !== null ? 'hover:ring-1 hover:ring-[#cabeff]' : 'cursor-default'}`}
                          >
                            {pct !== null ? `${pct}%` : '—'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#23314E] text-xs text-[#94A3B8] flex items-center justify-between min-h-[28px]">
            {hoveredCohort ? (
              <>
                <span className="text-[#F8FAFC] font-medium">
                  {hoveredCohort.cohort} · Month {hoveredCohort.monthIdx}
                </span>
                <span className="font-mono tabular-nums text-[#23C8B5]">
                  {hoveredCohort.pct}% retained (${hoveredCohort.retainedArrK}K ARR)
                </span>
              </>
            ) : (
              <>
                <span>Hover any cohort cell to inspect retained ARR</span>
                <span className="font-mono text-[#C9C4D8]">6 active cohorts</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Account Expansion & Renewal Pipeline */}
      <section className="obsidian-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#23314E] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Account Expansion & Renewal Pipeline
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {filteredAccounts.length} accounts shown · Click a row to update renewal notes or health
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segment Filter Controls */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#111A2E] border border-[#23314E]">
              {(['All', 'Enterprise', 'Mid-Market', 'Self-Serve'] as SegmentFilter[]).map(
                (seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setSegment(seg)}
                    className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      segment === seg
                        ? 'bg-[#7C5CFC] text-[#F8FAFC]'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {seg}
                  </button>
                )
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter accounts or owners..."
                aria-label="Filter accounts"
                className="h-10 w-60 rounded-lg bg-[#111A2E] border border-[#23314E] pl-9 pr-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="font-display text-base font-medium text-[#F8FAFC]">
              No matching accounts found
            </div>
            <p className="text-sm text-[#94A3B8]">
              Adjust your segment filter or search query to view active enterprise renewals.
            </p>
            <button
              type="button"
              onClick={() => {
                setSegment('All');
                setSearch('');
              }}
              className="mt-2 h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-sm font-medium text-[#F8FAFC] transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111A2E] border-b border-[#23314E] text-[11px] font-semibold tracking-[0.04em] text-[#94A3B8]">
                  <th className="py-3 pl-6 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC]"
                    >
                      <span>Account</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3">Segment</th>
                  <th className="py-3 px-3">Health</th>
                  <th className="py-3 px-3">Renewal</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('ndrPercent')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] ml-auto"
                    >
                      <span>NDR</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('expansionDelta')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] ml-auto"
                    >
                      <span>Net Expansion</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3 pl-3 pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('currentArr')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] ml-auto"
                    >
                      <span>Current ARR</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A253F] text-sm">
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    onClick={() => onSelectAccount(acc)}
                    className="h-[52px] hover:bg-white/[0.025] cursor-pointer transition-colors"
                  >
                    <td className="pl-6 pr-3">
                      <div className="font-medium text-[#F8FAFC]">{acc.name}</div>
                      <div className="text-xs text-[#94A3B8]">Owner: {acc.owner}</div>
                    </td>
                    <td className="px-3 text-[#C9C4D8] whitespace-nowrap">{acc.segment}</td>
                    <td className="px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          acc.health === 'Healthy'
                            ? 'text-[#23C8B5]'
                            : acc.health === 'Warning'
                            ? 'text-[#F59E0B]'
                            : 'text-[#F43F5E]'
                        }`}
                      >
                        {acc.health === 'Healthy' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {acc.health === 'Warning' && <AlertTriangle className="h-3.5 w-3.5" />}
                        {acc.health === 'Critical' && <AlertCircle className="h-3.5 w-3.5" />}
                        <span>{acc.health}</span>
                      </span>
                    </td>
                    <td className="px-3 font-mono text-xs tabular-nums text-[#94A3B8] whitespace-nowrap">
                      {acc.renewalDate}
                    </td>
                    <td
                      className={`px-3 text-right font-mono tabular-nums ${
                        acc.ndrPercent >= 115
                          ? 'text-[#23C8B5]'
                          : acc.ndrPercent < 100
                          ? 'text-[#F43F5E]'
                          : 'text-[#F8FAFC]'
                      }`}
                    >
                      {acc.ndrPercent}%
                    </td>
                    <td
                      className={`px-3 text-right font-mono tabular-nums ${
                        acc.expansionDelta >= 0 ? 'text-[#23C8B5]' : 'text-[#F43F5E]'
                      }`}
                    >
                      {acc.expansionDelta >= 0 ? '+' : '-'}$
                      {Math.abs(acc.expansionDelta / 1000).toFixed(0)}K
                    </td>
                    <td className="pl-3 pr-6 text-right font-mono font-medium tabular-nums text-[#F8FAFC]">
                      ${(acc.currentArr / 1000).toFixed(0)}K
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
