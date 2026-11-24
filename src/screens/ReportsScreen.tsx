import React, { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Printer,
  BookmarkPlus,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  AccountRecord,
  KpiMetric,
  LedgerEntry,
  PeriodRange,
  ReportSnapshot,
  ScenarioType,
} from '../types/finance';

interface ReportsScreenProps {
  reports: ReportSnapshot[];
  activeReportId: string;
  onSelectReport: (id: string) => void;
  onSaveReport: (snapshot: ReportSnapshot) => void;
  kpis: KpiMetric[];
  accounts: AccountRecord[];
  ledgerEntries: LedgerEntry[];
  period: PeriodRange;
  scenario: ScenarioType;
  onNotify: (msg: string) => void;
}

type AudienceType = ReportSnapshot['audience'];

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  reports,
  activeReportId,
  onSelectReport,
  onSaveReport,
  kpis,
  accounts,
  ledgerEntries,
  period,
  scenario,
  onNotify,
}) => {
  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];
  const [audience, setAudience] = useState<AudienceType>(activeReport.audience);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const [draftSummary, setDraftSummary] = useState<string | null>(null);

  const arrKpi = kpis.find((k) => k.id === 'arr')?.value ?? '$14.82M';
  const ndrKpi = kpis.find((k) => k.id === 'ndr')?.value ?? '124.6%';
  const burnKpi = kpis.find((k) => k.id === 'burn')?.value ?? '$184.2K';
  const runwayKpi = kpis.find((k) => k.id === 'runway')?.value ?? '34.2 mo';

  const flaggedItems = ledgerEntries.filter((e) => e.status === 'Flagged');
  const atRiskAccounts = accounts.filter((a) => a.health !== 'Healthy');

  const synthesizeFromLiveState = (targetAudience: AudienceType): ReportSnapshot => {
    const tonePrefix =
      targetAudience === 'Board Packet'
        ? `Under the ${scenario} operating model (${period} window), committed ARR stands at ${arrKpi} with ${ndrKpi} Net Dollar Retention.`
        : targetAudience === 'Monthly Close'
        ? `November close variance check (${scenario} baseline): ${flaggedItems.length} flagged expense items require controller sign-off prior to lock.`
        : `SaaS efficiency briefing (${period}): ARR reached ${arrKpi} alongside ${burnKpi} monthly net burn and ${runwayKpi} cash runway.`;

    return {
      id: `rep-${Date.now()}`,
      title: `${targetAudience} · ${scenario} (${period})`,
      audience: targetAudience,
      generatedAt: 'Generated just now',
      period,
      scenario,
      executiveSummary: `${tonePrefix} Capital efficiency improved as net burn compressed to ${burnKpi}, preserving ${runwayKpi} of zero-debt treasury runway.`,
      revenueBlock: `Enterprise and Mid-Market cohorts continue to drive compounding expansion (${ndrKpi} NDR). Currently ${atRiskAccounts.length} renewal account(s) (${atRiskAccounts
        .map((a) => a.name)
        .join(', ')}) carry proactive retention plans.`,
      treasuryBlock: `Active operating ledger contains ${ledgerEntries.length} tracked transactions with ${flaggedItems.length} flagged variance items (${flaggedItems
        .map((f) => f.vendor)
        .join(', ') || 'none'}).`,
      actionItems: [
        ...atRiskAccounts.map(
          (a) => `Review ${a.name} (${a.health}) ahead of ${a.renewalDate} renewal.`
        ),
        ...flaggedItems.map(
          (f) => `Resolve +${f.variancePercent.toFixed(1)}% budget variance on ${f.vendor}.`
        ),
      ],
    };
  };

  const handleRegenerate = () => {
    const fresh = synthesizeFromLiveState(audience);
    onSaveReport(fresh);
    setDraftSummary(null);
    setCheckedActions({});
    onNotify(`Synthesized ${audience} from live ${scenario} metrics`);
  };

  const handleCopyMarkdown = async () => {
    const summaryText = draftSummary ?? activeReport.executiveSummary;
    const md = [
      `# ${activeReport.title}`,
      `${activeReport.audience} · ${activeReport.generatedAt}`,
      '',
      '## Executive Summary',
      summaryText,
      '',
      '## Revenue & Cohort Retention',
      activeReport.revenueBlock,
      '',
      '## Cash & Treasury Variance',
      activeReport.treasuryBlock,
      '',
      '## Action Items',
      ...activeReport.actionItems.map((item, i) => `- [${checkedActions[i] ? 'x' : ' '}] ${item}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(md);
      onNotify('Copied report Markdown to clipboard');
    } catch {
      onNotify('Prepared Markdown summary');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Report Archive Rail */}
      <aside className="xl:col-span-4 space-y-4">
        <div className="obsidian-card rounded-2xl p-6">
          <div className="pb-4 border-b border-[#23314E]">
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              Synthesizer Controls
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Generate live narratives anchored to your {scenario} metrics
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-xs font-medium text-[#94A3B8]">Report Audience</div>
            <div className="grid grid-cols-1 gap-2">
              {(['Board Packet', 'Monthly Close', 'SaaS Metrics Memo'] as AudienceType[]).map(
                (aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setAudience(aud)}
                    className={`h-10 px-3.5 rounded-lg text-left text-sm font-medium border transition-colors ${
                      audience === aud
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#F8FAFC]'
                        : 'bg-[#111A2E] border-[#23314E] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {aud}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-sm font-medium text-[#F8FAFC] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Generate Live Snapshot</span>
            </button>
          </div>
        </div>

        <div className="obsidian-card rounded-2xl p-6">
          <h3 className="font-display text-sm font-semibold text-[#F8FAFC] pb-3 border-b border-[#23314E]">
            Saved Snapshots ({reports.length})
          </h3>
          <div className="mt-3 space-y-2">
            {reports.map((rep) => {
              const selected = rep.id === activeReport.id;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => {
                    onSelectReport(rep.id);
                    setAudience(rep.audience);
                    setDraftSummary(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selected
                      ? 'bg-[#1E2C4A]/70 border-[#7C5CFC]/50'
                      : 'bg-[#111A2E]/60 border-[#23314E] hover:border-[#33466E]'
                  }`}
                >
                  <div className="text-sm font-medium text-[#F8FAFC] truncate">
                    {rep.title}
                  </div>
                  <div className="mt-1 text-xs text-[#94A3B8]">
                    {rep.audience} · {rep.generatedAt}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Automated Report Block (Subtle Glass Surface) */}
      <article
        className="xl:col-span-8 rounded-2xl border border-[#23314E] p-6 md:p-8 space-y-6"
        style={{
          backgroundColor: 'rgba(22, 32, 56, 0.65)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#23314E]">
          <div>
            <div className="text-xs text-[#94A3B8]">
              {activeReport.audience} · {activeReport.scenario} · {activeReport.generatedAt}
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-[#F8FAFC]">
              {activeReport.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#23314E] text-xs font-medium text-[#F8FAFC] hover:bg-[#1E2C4A] transition-colors whitespace-nowrap"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#cabeff]" />
              <span>Regenerate</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#23314E] text-xs font-medium text-[#F8FAFC] hover:bg-[#1E2C4A] transition-colors whitespace-nowrap"
            >
              <Copy className="h-3.5 w-3.5 text-[#23C8B5]" />
              <span>Copy Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#23314E] text-xs font-medium text-[#F8FAFC] hover:bg-[#1E2C4A] transition-colors whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Snapshot Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#23314E]">
          {kpis.map((kpi) => (
            <div key={kpi.id}>
              <div className="text-xs text-[#94A3B8]">{kpi.label}</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-[#F8FAFC]">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Editable Executive Summary */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              Executive Summary
            </h2>
            <span className="text-xs text-[#94A3B8]">Editable narrative</span>
          </div>
          <textarea
            rows={3}
            value={draftSummary ?? activeReport.executiveSummary}
            onChange={(e) => setDraftSummary(e.target.value)}
            aria-label="Executive Summary Narrative"
            className="w-full rounded-xl bg-[#111A2E]/70 border border-[#23314E] p-4 text-sm leading-relaxed text-[#d4e4fa] focus:outline-none focus:border-[#7C5CFC]"
          />
        </section>

        {/* Revenue & Treasury Narratives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Revenue & Cohort Velocity
            </h3>
            <p className="text-sm leading-relaxed text-[#C9C4D8]">
              {activeReport.revenueBlock}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Cash & Operating Variance
            </h3>
            <p className="text-sm leading-relaxed text-[#C9C4D8]">
              {activeReport.treasuryBlock}
            </p>
          </section>
        </div>

        {/* Action Items Checklist */}
        <section className="pt-4 border-t border-[#23314E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Recommended Controller & GTM Actions
            </h3>
            {draftSummary !== null && (
              <button
                type="button"
                onClick={() => {
                  onSaveReport({
                    ...activeReport,
                    id: `rep-${Date.now()}`,
                    generatedAt: 'Edited just now',
                    executiveSummary: draftSummary,
                  });
                  setDraftSummary(null);
                  onNotify('Saved edited report snapshot');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#23C8B5] hover:text-[#F8FAFC]"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                <span>Save edited copy</span>
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {activeReport.actionItems.map((item, idx) => {
              const done = Boolean(checkedActions[idx]);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() =>
                      setCheckedActions((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="flex w-full items-start gap-3 text-left py-2 px-3 rounded-lg hover:bg-[#1E2C4A]/40 transition-colors"
                  >
                    {done ? (
                      <CheckSquare className="h-4 w-4 text-[#23C8B5] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-[#94A3B8] shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        done ? 'line-through text-[#94A3B8]' : 'text-[#d4e4fa]'
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </article>
    </div>
  );
};
