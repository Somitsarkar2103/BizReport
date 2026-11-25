import { AccountRecord, HealthStatus, LedgerEntry, ReconciliationStatus, ReportSnapshot } from '../types/finance';
import { INITIAL_ACCOUNTS, INITIAL_LEDGER_ENTRIES, INITIAL_REPORTS } from '../data/financeData';
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`[BizReport API] Request failed for ${url}:`, err);
    return null;
  }
}

export const api = {
  // Accounts
  async getAccounts(): Promise<AccountRecord[]> {
    const data = await safeFetch<AccountRecord[]>(`${API_BASE}/api/accounts`);
    if (data && data.length > 0) return data;

    if (isSupabaseConfigured && supabase) {
      const { data: supaData } = await supabase.from('accounts').select('*').order('current_arr', { ascending: false });
      if (supaData && supaData.length > 0) {
        return supaData.map((row: any) => ({
          id: row.id,
          name: row.name,
          segment: row.segment,
          currentArr: Number(row.current_arr ?? 0),
          expansionDelta: Number(row.expansion_delta ?? 0),
          ndrPercent: Number(row.ndr_percent ?? 100),
          renewalDate: row.renewal_date,
          owner: row.owner,
          health: row.health,
          notes: row.notes || '',
        }));
      }
    }

    return INITIAL_ACCOUNTS;
  },

  async updateAccount(id: string, health: HealthStatus, notes: string): Promise<AccountRecord | null> {
    const updated = await safeFetch<AccountRecord>(`${API_BASE}/api/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ health, notes }),
    });
    if (updated) return updated;

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('accounts')
        .update({ health, notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          segment: data.segment,
          currentArr: Number(data.current_arr ?? 0),
          expansionDelta: Number(data.expansion_delta ?? 0),
          ndrPercent: Number(data.ndr_percent ?? 100),
          renewalDate: data.renewal_date,
          owner: data.owner,
          health: data.health,
          notes: data.notes || '',
        };
      }
    }
    return null;
  },

  // Ledger Entries
  async getLedgerEntries(): Promise<LedgerEntry[]> {
    const data = await safeFetch<LedgerEntry[]>(`${API_BASE}/api/ledger`);
    if (data && data.length > 0) return data;

    if (isSupabaseConfigured && supabase) {
      const { data: supaData } = await supabase.from('ledger_entries').select('*').order('date', { ascending: false });
      if (supaData && supaData.length > 0) {
        return supaData.map((row: any) => ({
          id: row.id,
          date: row.date,
          vendor: row.vendor,
          description: row.description || '',
          category: row.category,
          amount: Number(row.amount || 0),
          variancePercent: Number(row.variance_percent || 0),
          status: row.status,
          analystNote: row.analyst_note || '',
        }));
      }
    }

    return INITIAL_LEDGER_ENTRIES;
  },

  async addLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry> {
    const created = await safeFetch<LedgerEntry>(`${API_BASE}/api/ledger`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    if (created) return created;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('ledger_entries').insert({
        id: entry.id,
        date: entry.date,
        vendor: entry.vendor,
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        variance_percent: entry.variancePercent,
        status: entry.status,
        analyst_note: entry.analystNote,
      });
    }

    return entry;
  },

  async updateLedgerEntry(id: string, status: ReconciliationStatus, note: string): Promise<LedgerEntry | null> {
    const updated = await safeFetch<LedgerEntry>(`${API_BASE}/api/ledger/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, analystNote: note }),
    });
    if (updated) return updated;

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('ledger_entries')
        .update({ status, analyst_note: note, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (data) {
        return {
          id: data.id,
          date: data.date,
          vendor: data.vendor,
          description: data.description || '',
          category: data.category,
          amount: Number(data.amount || 0),
          variancePercent: Number(data.variance_percent || 0),
          status: data.status,
          analystNote: data.analyst_note || '',
        };
      }
    }
    return null;
  },

  // Reports
  async getReports(): Promise<ReportSnapshot[]> {
    const data = await safeFetch<ReportSnapshot[]>(`${API_BASE}/api/reports`);
    if (data && data.length > 0) return data;

    if (isSupabaseConfigured && supabase) {
      const { data: supaData } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (supaData && supaData.length > 0) {
        return supaData.map((row: any) => ({
          id: row.id,
          title: row.title,
          audience: row.audience,
          generatedAt: row.generated_at,
          period: row.period,
          scenario: row.scenario,
          executiveSummary: row.executive_summary || '',
          revenueBlock: row.revenue_block || '',
          treasuryBlock: row.treasury_block || '',
          actionItems: Array.isArray(row.action_items) ? row.action_items : [],
        }));
      }
    }

    return INITIAL_REPORTS;
  },

  async saveReport(report: ReportSnapshot): Promise<ReportSnapshot> {
    const created = await safeFetch<ReportSnapshot>(`${API_BASE}/api/reports`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
    if (created) return created;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('reports').insert({
        id: report.id,
        title: report.title,
        audience: report.audience,
        generated_at: report.generatedAt,
        period: report.period,
        scenario: report.scenario,
        executive_summary: report.executiveSummary,
        revenue_block: report.revenueBlock,
        treasury_block: report.treasuryBlock,
        action_items: report.actionItems,
      });
    }

    return report;
  },
};
