import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LedgerCategory, LedgerEntry } from '../types/finance';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (entry: LedgerEntry) => void;
}

const CATEGORIES: LedgerCategory[] = ['Cloud & Infra', 'Payroll', 'GTM & Sales', 'G&A'];

export const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  onAddEntry,
}) => {
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LedgerCategory>('Cloud & Infra');
  const [amount, setAmount] = useState('');
  const [variance, setVariance] = useState('0.0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!vendor.trim() || !numericAmount || numericAmount <= 0) return;

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: '2026-11-24',
      vendor: vendor.trim(),
      description: description.trim() || `${category} operating expense`,
      category,
      amount: Math.round(numericAmount),
      variancePercent: Number(variance) || 0,
      status: Math.abs(Number(variance)) > 10 ? 'Flagged' : 'Pending',
      analystNote: 'Logged manually via Treasury ledger workspace.',
    };

    onAddEntry(newEntry);
    setVendor('');
    setDescription('');
    setAmount('');
    setVariance('0.0');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Log operating ledger entry"
    >
      <div
        className="fixed inset-0 bg-[#010f1f]/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl obsidian-glass p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#23314E] pb-4">
          <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">
            Log Ledger Entry
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#162038]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="entry-vendor" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Vendor / Counterparty
            </label>
            <input
              id="entry-vendor"
              type="text"
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g., Datadog Observability"
              className="w-full h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="entry-category" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Category
              </label>
              <select
                id="entry-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as LedgerCategory)}
                className="w-full h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7C5CFC]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="entry-amount" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Amount (USD)
              </label>
              <input
                id="entry-amount"
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="12500"
                className="w-full h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 font-mono text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="entry-variance" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Variance vs Budget (%)
            </label>
            <input
              id="entry-variance"
              type="number"
              step="0.1"
              value={variance}
              onChange={(e) => setVariance(e.target.value)}
              className="w-full h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 font-mono text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <div>
            <label htmlFor="entry-desc" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Description
            </label>
            <input
              id="entry-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Monthly APM & log ingestion tier"
              className="w-full h-10 rounded-lg bg-[#111A2E] border border-[#23314E] px-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#23314E]">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[#23314E] text-sm font-medium text-[#F8FAFC] hover:bg-[#162038]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-sm font-medium text-[#F8FAFC] transition-colors"
          >
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};
