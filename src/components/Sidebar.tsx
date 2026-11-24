import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Landmark,
  FileText,
  X,
  Command,
} from 'lucide-react';
import { ScenarioType, ScreenId } from '../types/finance';

interface SidebarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  scenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  flaggedCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCommandPalette: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'revenue', label: 'Revenue & Cohorts', icon: TrendingUp },
  { id: 'treasury', label: 'Cash & Treasury', icon: Landmark },
  { id: 'reports', label: 'Automated Reports', icon: FileText },
];

const SCENARIOS: ScenarioType[] = ['Base Case', 'Upside', 'Conservative'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  scenario,
  onSelectScenario,
  flaggedCount,
  mobileOpen,
  onCloseMobile,
  onOpenCommandPalette,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  const renderContent = (isCompactTablet: boolean) => (
    <div className="flex h-full flex-col justify-between bg-[#111A2E] border-r border-[#23314E] select-none">
      <div>
        {/* Brand Header */}
        <div
          className={`flex items-center ${
            isCompactTablet ? 'justify-center px-2' : 'justify-between px-5'
          } h-16 border-b border-[#23314E]`}
        >
          <button
            type="button"
            onClick={() => onSelectScreen('overview')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] rounded-lg"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7C5CFC] text-[#F8FAFC] font-display font-bold text-sm">
              K
            </span>
            {!isCompactTablet && (
              <span className="font-display text-[17px] font-semibold tracking-tight text-[#F8FAFC] whitespace-nowrap">
                Kestrel
              </span>
            )}
          </button>

          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-5 space-y-1" aria-label="Primary Navigation">
          {!isCompactTablet && (
            <div className="px-3 pb-2 text-[11px] font-medium tracking-[0.04em] text-[#94A3B8]">
              Workspace
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectScreen(item.id);
                  onCloseMobile();
                }}
                title={isCompactTablet ? item.label : undefined}
                className={`group flex w-full items-center ${
                  isCompactTablet ? 'justify-center px-0' : 'justify-between px-3'
                } h-10 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] ${
                  isActive
                    ? 'bg-[#7C5CFC]/15 text-[#F8FAFC] border border-[#7C5CFC]/35'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038] border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[#cabeff]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                    }`}
                  />
                  {!isCompactTablet && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </span>

                {!isCompactTablet && item.id === 'treasury' && flaggedCount > 0 && (
                  <span className="font-mono text-[11px] tabular-nums text-[#F59E0B]">
                    {flaggedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Scenario Model Switcher */}
        {!isCompactTablet && (
          <div className="mx-3 mt-2 pt-5 border-t border-[#23314E]">
            <div className="px-3 pb-2.5 text-[11px] font-medium tracking-[0.04em] text-[#94A3B8]">
              Forecast Model
            </div>
            <div className="space-y-1">
              {SCENARIOS.map((sc) => {
                const selected = scenario === sc;
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => onSelectScenario(sc)}
                    className={`flex w-full items-center justify-between px-3 h-9 rounded-lg text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] ${
                      selected
                        ? 'bg-[#162038] text-[#F8FAFC] border border-[#23314E]'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]/60 border border-transparent'
                    }`}
                  >
                    <span className="whitespace-nowrap">{sc}</span>
                    {selected && (
                      <span className="text-[11px] font-mono text-[#23C8B5]">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile & Quick Command */}
      <div className="p-3 border-t border-[#23314E] space-y-2.5">
        {!isCompactTablet && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full items-center justify-between px-3 h-9 rounded-lg bg-[#0B1020]/70 border border-[#23314E] text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#7C5CFC]/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Command className="h-3.5 w-3.5 text-[#7C5CFC]" />
              <span>Command palette</span>
            </span>
            <kbd className="font-mono text-[11px] text-[#94A3B8]">⌘K</kbd>
          </button>
        )}

        <div
          className={`flex items-center ${
            isCompactTablet ? 'justify-center' : 'gap-3 px-2 py-1.5'
          }`}
        >
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#23314E] bg-[#162038] flex items-center justify-center">
            {!avatarError ? (
              <img
                src="/src/assets/images/avatar_finance_lead_1795511879993.jpg"
                alt="Elena Vance, VP of Finance"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-xs font-semibold text-[#cabeff]">EV</span>
            )}
          </div>
          {!isCompactTablet && (
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#F8FAFC] truncate">Elena Vance</div>
              <div className="text-xs text-[#94A3B8] truncate">VP Finance · Series B</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop 256px Fixed Sidebar */}
      <aside className="hidden xl:block w-64 shrink-0 sticky top-0 h-screen">
        {renderContent(false)}
      </aside>

      {/* Tablet 64px Slim Icon Rail */}
      <aside className="hidden md:block xl:hidden w-16 shrink-0 sticky top-0 h-screen">
        {renderContent(true)}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#010f1f]/75 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] h-full">
            {renderContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};
