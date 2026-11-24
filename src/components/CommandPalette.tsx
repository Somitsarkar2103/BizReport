import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Landmark,
  FileText,
  Plus,
  Download,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { AccountRecord, ScenarioType, ScreenId } from '../types/finance';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountRecord[];
  onNavigate: (screen: ScreenId) => void;
  onSelectScenario: (scenario: ScenarioType) => void;
  onSelectAccount: (account: AccountRecord) => void;
  onOpenLogModal: () => void;
  onExportCsv: () => void;
}

interface CommandItem {
  id: string;
  group: string;
  label: string;
  meta: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  accounts,
  onNavigate,
  onSelectScenario,
  onSelectAccount,
  onOpenLogModal,
  onExportCsv,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const items = useMemo<CommandItem[]>(() => {
    const base: CommandItem[] = [
      {
        id: 'nav-overview',
        group: 'Screens',
        label: 'Executive Overview',
        meta: 'KPIs & Trajectory',
        icon: LayoutDashboard,
        action: () => onNavigate('overview'),
      },
      {
        id: 'nav-revenue',
        group: 'Screens',
        label: 'Revenue & Cohorts',
        meta: 'MRR Movement & NDR Matrix',
        icon: TrendingUp,
        action: () => onNavigate('revenue'),
      },
      {
        id: 'nav-treasury',
        group: 'Screens',
        label: 'Cash & Treasury',
        meta: 'Runway Stress Test & Ledger',
        icon: Landmark,
        action: () => onNavigate('treasury'),
      },
      {
        id: 'nav-reports',
        group: 'Screens',
        label: 'Automated Reports',
        meta: 'Board & Close Synthesizer',
        icon: FileText,
        action: () => onNavigate('reports'),
      },
      {
        id: 'act-log',
        group: 'Quick Actions',
        label: 'Log Operating Ledger Entry',
        meta: 'Treasury',
        icon: Plus,
        action: onOpenLogModal,
      },
      {
        id: 'act-csv',
        group: 'Quick Actions',
        label: 'Export Financial Ledger CSV',
        meta: 'Download',
        icon: Download,
        action: onExportCsv,
      },
      ...(['Base Case', 'Upside', 'Conservative'] as ScenarioType[]).map((sc) => ({
        id: `sc-${sc}`,
        group: 'Forecast Scenarios',
        label: `Switch to ${sc} Model`,
        meta: 'Scenario',
        icon: SlidersHorizontal,
        action: () => onSelectScenario(sc),
      })),
      ...accounts.map((acc) => ({
        id: `acc-${acc.id}`,
        group: 'Accounts',
        label: acc.name,
        meta: `${acc.segment} · $${(acc.currentArr / 1000).toFixed(0)}K ARR`,
        icon: ArrowRight,
        action: () => {
          onNavigate('revenue');
          onSelectAccount(acc);
        },
      })),
    ];

    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [accounts, onExportCsv, onNavigate, onOpenLogModal, onSelectAccount, onSelectScenario, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault();
      items[activeIndex].action();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="fixed inset-0 bg-[#010f1f]/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-xl rounded-2xl obsidian-glass overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-[#23314E]">
          <Search className="h-4 w-4 text-[#7C5CFC] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to screen, account, scenario, or action..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
          />
          <kbd className="font-mono text-[11px] text-[#94A3B8] shrink-0">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#94A3B8]">
              No matching commands or accounts for “{query}”.
            </div>
          ) : (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-[#7C5CFC]/20 text-[#F8FAFC]' : 'text-[#C9C4D8] hover:bg-[#162038]/80'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-[#cabeff]" />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </span>
                  <span className="text-xs text-[#94A3B8] font-mono ml-4 shrink-0">
                    {item.meta}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
