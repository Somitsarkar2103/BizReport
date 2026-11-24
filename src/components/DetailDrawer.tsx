import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import {
  AccountRecord,
  HealthStatus,
  LedgerEntry,
  ReconciliationStatus,
} from '../types/finance';

interface DetailDrawerProps {
  selectedLedger: LedgerEntry | null;
  selectedAccount: AccountRecord | null;
  onClose: () => void;
  onUpdateLedger: (id: string, status: ReconciliationStatus, note: string) => void;
  onUpdateAccount: (id: string, health: HealthStatus, notes: string) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  selectedLedger,
  selectedAccount,
  onClose,
  onUpdateLedger,
  onUpdateAccount,
}) => {
  const [ledgerStatus, setLedgerStatus] = useState<ReconciliationStatus>('Pending');
  const [ledgerNote, setLedgerNote] = useState('');
  const [accountHealth, setAccountHealth] = useState<HealthStatus>('Healthy');
  const [accountNote, setAccountNote] = useState('');

  useEffect(() => {
    if (selectedLedger) {
      setLedgerStatus(selectedLedger.status);
      setLedgerNote(selectedLedger.analystNote);
    }
  }, [selectedLedger]);

  useEffect(() => {
    if (selectedAccount) {
      setAccountHealth(selectedAccount.health);
      setAccountNote(selectedAccount.notes);
    }
  }, [selectedAccount]);

  if (!selectedLedger && !selectedAccount) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Detail inspector"
    >
      <div
        className="fixed inset-0 bg-[#010f1f]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md h-full obsidian-glass border-l border-[#23314E] p-6 flex flex-col justify-between overflow-y-auto">
        {selectedLedger && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#23314E] pb-4">
              <div>
                <div className="text-xs text-[#94A3B8]">
                  {selectedLedger.category} · {selectedLedger.date}
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold text-[#F8FAFC]">
                  {selectedLedger.vendor}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]"
                aria-label="Close detail drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-[#23314E] pb-5">
              <div>
                <div className="text-xs text-[#94A3B8]">Amount</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#F8FAFC]">
                  ${selectedLedger.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#94A3B8]">Budget Variance</div>
                <div
                  className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                    selectedLedger.variancePercent > 5
                      ? 'text-[#F43F5E]'
                      : selectedLedger.variancePercent < 0
                      ? 'text-[#23C8B5]'
                      : 'text-[#F8FAFC]'
                  }`}
                >
                  {selectedLedger.variancePercent > 0 ? '+' : ''}
                  {selectedLedger.variancePercent.toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#94A3B8] mb-1.5">Line Item Description</div>
              <p className="text-sm text-[#d4e4fa] leading-relaxed">
                {selectedLedger.description}
              </p>
            </div>

            <div>
              <div className="text-xs text-[#94A3B8] mb-2">Reconciliation Status</div>
              <div className="grid grid-cols-3 gap-2">
                {(['Reconciled', 'Pending', 'Flagged'] as ReconciliationStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLedgerStatus(st)}
                    className={`h-10 rounded-lg text-xs font-medium border transition-colors ${
                      ledgerStatus === st
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#F8FAFC]'
                        : 'bg-[#111A2E] border-[#23314E] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="ledger-analyst-note"
                className="block text-xs text-[#94A3B8] mb-2"
              >
                Analyst Reconciliation Note
              </label>
              <textarea
                id="ledger-analyst-note"
                rows={4}
                value={ledgerNote}
                onChange={(e) => setLedgerNote(e.target.value)}
                className="w-full rounded-lg bg-[#111A2E] border border-[#23314E] p-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/25"
              />
            </div>
          </div>
        )}

        {selectedAccount && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#23314E] pb-4">
              <div>
                <div className="text-xs text-[#94A3B8]">
                  {selectedAccount.segment} · Owner: {selectedAccount.owner}
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold text-[#F8FAFC]">
                  {selectedAccount.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]"
                aria-label="Close detail drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-[#23314E] pb-5">
              <div>
                <div className="text-xs text-[#94A3B8]">Current ARR</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#F8FAFC]">
                  ${(selectedAccount.currentArr / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-xs text-[#94A3B8]">Net Retention</div>
                <div
                  className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                    selectedAccount.ndrPercent >= 110
                      ? 'text-[#23C8B5]'
                      : selectedAccount.ndrPercent < 100
                      ? 'text-[#F43F5E]'
                      : 'text-[#F8FAFC]'
                  }`}
                >
                  {selectedAccount.ndrPercent}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-b border-[#23314E] pb-4">
              <span className="text-[#94A3B8]">Renewal Date</span>
              <span className="font-mono tabular-nums text-[#F8FAFC]">
                {selectedAccount.renewalDate}
              </span>
            </div>

            <div>
              <div className="text-xs text-[#94A3B8] mb-2">Account Health</div>
              <div className="grid grid-cols-3 gap-2">
                {(['Healthy', 'Warning', 'Critical'] as HealthStatus[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setAccountHealth(h)}
                    className={`flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-medium border transition-colors ${
                      accountHealth === h
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#F8FAFC]'
                        : 'bg-[#111A2E] border-[#23314E] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {h === 'Healthy' && <CheckCircle2 className="h-3.5 w-3.5 text-[#23C8B5]" />}
                    {h === 'Warning' && <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />}
                    {h === 'Critical' && <AlertCircle className="h-3.5 w-3.5 text-[#F43F5E]" />}
                    <span>{h}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="account-renewal-note"
                className="block text-xs text-[#94A3B8] mb-2"
              >
                Renewal & Expansion Notes
              </label>
              <textarea
                id="account-renewal-note"
                rows={4}
                value={accountNote}
                onChange={(e) => setAccountNote(e.target.value)}
                className="w-full rounded-lg bg-[#111A2E] border border-[#23314E] p-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/25"
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#23314E] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[#23314E] text-sm font-medium text-[#F8FAFC] hover:bg-[#162038]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedLedger) {
                onUpdateLedger(selectedLedger.id, ledgerStatus, ledgerNote);
              } else if (selectedAccount) {
                onUpdateAccount(selectedAccount.id, accountHealth, accountNote);
              }
              onClose();
            }}
            className="h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-sm font-medium text-[#F8FAFC] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
