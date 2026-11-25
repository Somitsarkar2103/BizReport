import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Search, Plus, Database } from 'lucide-react';
import { api } from './services/api';
import { isSupabaseConfigured } from './services/supabase';
import {
  INITIAL_ACCOUNTS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_REPORTS,
  PERIOD_LABELS,
  getKpisForContext,
  getTrajectoryData,
} from './data/financeData';
import {
  AccountRecord,
  HealthStatus,
  LedgerEntry,
  PeriodRange,
  ReconciliationStatus,
  ReportSnapshot,
  ScenarioType,
  ScreenId,
} from './types/finance';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { DetailDrawer } from './components/DetailDrawer';
import { LogEntryModal } from './components/LogEntryModal';
import { ToastBanner } from './components/ToastBanner';
import { OverviewScreen } from './screens/OverviewScreen';
import { RevenueScreen } from './screens/RevenueScreen';
import { TreasuryScreen } from './screens/TreasuryScreen';
import { ReportsScreen } from './screens/ReportsScreen';

const SCREEN_TITLES: Record<ScreenId, string> = {
  overview: 'Executive Overview',
  revenue: 'Revenue & Cohorts',
  treasury: 'Cash & Treasury',
  reports: 'Automated Reports',
};

const PERIODS: PeriodRange[] = ['30D', '90D', '12M', 'YTD'];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [period, setPeriod] = useState<PeriodRange>('30D');
  const [scenario, setScenario] = useState<ScenarioType>('Base Case');

  const [accounts, setAccounts] = useState<AccountRecord[]>(INITIAL_ACCOUNTS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [reports, setReports] = useState<ReportSnapshot[]>(INITIAL_REPORTS);
  const [activeReportId, setActiveReportId] = useState<string>(INITIAL_REPORTS[0].id);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Load initial state from backend / Supabase
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [accs, ledger, reps] = await Promise.all([
          api.getAccounts(),
          api.getLedgerEntries(),
          api.getReports(),
        ]);
        if (mounted) {
          if (accs.length) setAccounts(accs);
          if (ledger.length) setLedgerEntries(ledger);
          if (reps.length) {
            setReports(reps);
            setActiveReportId(reps[0].id);
          }
          setIsBackendConnected(true);
        }
      } catch (e) {
        console.warn('Backend loading error:', e);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<LedgerEntry | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const extraMonthlyBurnK = useMemo(() => {
    const baseCount = INITIAL_LEDGER_ENTRIES.length;
    if (ledgerEntries.length <= baseCount) return 0;
    const added = ledgerEntries.slice(0, ledgerEntries.length - baseCount);
    return added.reduce((sum, item) => sum + item.amount / 1000, 0);
  }, [ledgerEntries]);

  const kpis = useMemo(
    () => getKpisForContext(period, scenario, extraMonthlyBurnK),
    [extraMonthlyBurnK, period, scenario]
  );

  const trajectory = useMemo(
    () => getTrajectoryData(period, scenario),
    [period, scenario]
  );

  const flaggedCount = useMemo(
    () => ledgerEntries.filter((e) => e.status === 'Flagged').length,
    [ledgerEntries]
  );

  const handleUpdateLedger = async (id: string, status: ReconciliationStatus, note: string) => {
    setLedgerEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, analystNote: note } : item
      )
    );
    notify(`Updated ledger status to ${status}`);
    await api.updateLedgerEntry(id, status, note);
  };

  const handleUpdateAccount = async (id: string, health: HealthStatus, notes: string) => {
    setAccounts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, health, notes } : item))
    );
    notify(`Saved account notes (${health})`);
    await api.updateAccount(id, health, notes);
  };

  const handleAddLedgerEntry = async (entry: LedgerEntry) => {
    setLedgerEntries((prev) => [entry, ...prev]);
    notify(`Logged $${entry.amount.toLocaleString()} for ${entry.vendor}`);
    await api.addLedgerEntry(entry);
  };

  const handleSaveReport = async (snapshot: ReportSnapshot) => {
    setReports((prev) => [snapshot, ...prev]);
    setActiveReportId(snapshot.id);
    await api.saveReport(snapshot);
  };

  const handleExportCsv = useCallback(() => {
    const headers = ['Date', 'Vendor', 'Category', 'Status', 'VariancePct', 'AmountUSD'];
    const rows = ledgerEntries.map((e) => [
      e.date,
      `"${e.vendor.replace(/"/g, '""')}"`,
      e.category,
      e.status,
      e.variancePercent.toFixed(1),
      String(e.amount),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kestrel-operating-ledger.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Exported operating ledger CSV');
  }, [ledgerEntries, notify]);

  return (
    <div className="min-h-screen flex bg-[#0B1020] text-[#F8FAFC] relative">
      {/* Subtle Ambient Aura behind top-level summaries */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px] rounded-full opacity-60 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        scenario={scenario}
        onSelectScenario={(sc) => {
          setScenario(sc);
          notify(`Switched forecast model to ${sc}`);
        }}
        flaggedCount={flaggedCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenCommandPalette={() => setCommandOpen(true)}
      />

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top Bar Contract: Breadcrumb on left, Command bar + 1 primary action on right */}
        <header className="sticky top-0 z-30 h-16 px-4 md:px-8 border-b border-[#23314E] bg-[#0B1020]/85 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-[#94A3B8] whitespace-nowrap">Workspace</span>
              <span className="text-[#484555]" aria-hidden="true">/</span>
              <span className="font-display font-semibold text-[#F8FAFC] whitespace-nowrap truncate">
                {SCREEN_TITLES[activeScreen]}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111A2E] border border-[#23314E] text-[11px] text-[#94A3B8]">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-[#23C8B5] shadow-[0_0_8px_#23C8B5]' : 'bg-[#F59E0B]'}`} />
              <span>{isSupabaseConfigured ? 'Supabase Live' : isBackendConnected ? 'Backend Connected' : 'Local Cache'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center justify-between gap-6 h-10 px-3.5 rounded-lg bg-[#162038]/85 border border-[#23314E] text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#7C5CFC]/50 transition-colors"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Search className="h-3.5 w-3.5 text-[#7C5CFC]" />
                <span>Jump to metric or account...</span>
              </span>
              <kbd className="font-mono text-[11px] text-[#94A3B8]">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-xs font-medium text-[#F8FAFC] transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Log Entry</span>
            </button>
          </div>
        </header>

        {/* Main Analytical Workspace */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 xl:px-8 py-6 md:py-8 space-y-6">
          {/* Workspace Toolbar: Title + Period Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-[32px] md:leading-[40px] font-semibold tracking-[-0.025em] text-[#F8FAFC]">
                {SCREEN_TITLES[activeScreen]}
              </h1>
              <p className="mt-1 text-sm text-[#94A3B8]">
                {PERIOD_LABELS[period]} · {scenario} forecast · All figures USD
              </p>
            </div>

            <div
              role="group"
              aria-label="Time horizon"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#111A2E] border border-[#23314E] self-start sm:self-auto"
            >
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`h-8 px-3 rounded-md font-mono text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    period === p
                      ? 'bg-[#1E2C4A] text-[#F8FAFC] border border-[#33466E]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active Screen */}
          {activeScreen === 'overview' && (
            <OverviewScreen
              kpis={kpis}
              trajectory={trajectory}
              ledgerEntries={ledgerEntries}
              period={period}
              scenario={scenario}
              onSelectLedger={setSelectedLedger}
              onNavigate={setActiveScreen}
            />
          )}

          {activeScreen === 'revenue' && (
            <RevenueScreen
              accounts={accounts}
              onSelectAccount={setSelectedAccount}
            />
          )}

          {activeScreen === 'treasury' && (
            <TreasuryScreen
              ledgerEntries={ledgerEntries}
              onSelectLedger={setSelectedLedger}
              onOpenLogModal={() => setLogModalOpen(true)}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeScreen === 'reports' && (
            <ReportsScreen
              reports={reports}
              activeReportId={activeReportId}
              onSelectReport={setActiveReportId}
              onSaveReport={handleSaveReport}
              kpis={kpis}
              accounts={accounts}
              ledgerEntries={ledgerEntries}
              period={period}
              scenario={scenario}
              onNotify={notify}
            />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        accounts={accounts}
        onNavigate={setActiveScreen}
        onSelectScenario={(sc) => {
          setScenario(sc);
          notify(`Switched forecast model to ${sc}`);
        }}
        onSelectAccount={setSelectedAccount}
        onOpenLogModal={() => setLogModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      <DetailDrawer
        selectedLedger={selectedLedger}
        selectedAccount={selectedAccount}
        onClose={() => {
          setSelectedLedger(null);
          setSelectedAccount(null);
        }}
        onUpdateLedger={handleUpdateLedger}
        onUpdateAccount={handleUpdateAccount}
      />

      <LogEntryModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onAddEntry={handleAddLedgerEntry}
      />

      <ToastBanner message={toastMessage} />
    </div>
  );
}
