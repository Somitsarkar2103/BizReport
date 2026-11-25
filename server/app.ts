import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_ACCOUNTS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_REPORTS,
  MRR_MOVEMENT_DATA,
  COHORT_RETENTION_DATA,
  getKpisForContext,
  getTrajectoryData,
} from '../src/data/financeData';
import {
  AccountRecord,
  LedgerEntry,
  ReportSnapshot,
  PeriodRange,
  ScenarioType,
} from '../src/types/finance';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// In-memory cache & fallback store
let memoryAccounts: AccountRecord[] = [...INITIAL_ACCOUNTS];
let memoryLedger: LedgerEntry[] = [...INITIAL_LEDGER_ENTRIES];
let memoryReports: ReportSnapshot[] = [...INITIAL_REPORTS];

// Helper: map db account row to frontend AccountRecord
function mapDbAccount(row: any): AccountRecord {
  return {
    id: row.id,
    name: row.name,
    segment: row.segment,
    currentArr: Number(row.current_arr ?? row.currentArr ?? 0),
    expansionDelta: Number(row.expansion_delta ?? row.expansionDelta ?? 0),
    ndrPercent: Number(row.ndr_percent ?? row.ndrPercent ?? 100),
    renewalDate: row.renewal_date ?? row.renewalDate,
    owner: row.owner,
    health: row.health,
    notes: row.notes ?? '',
  };
}

// Helper: map frontend AccountRecord to db row
function mapAccountToDb(acc: Partial<AccountRecord>) {
  const dbObj: Record<string, any> = {};
  if (acc.id !== undefined) dbObj.id = acc.id;
  if (acc.name !== undefined) dbObj.name = acc.name;
  if (acc.segment !== undefined) dbObj.segment = acc.segment;
  if (acc.currentArr !== undefined) dbObj.current_arr = acc.currentArr;
  if (acc.expansionDelta !== undefined) dbObj.expansion_delta = acc.expansionDelta;
  if (acc.ndrPercent !== undefined) dbObj.ndr_percent = acc.ndrPercent;
  if (acc.renewalDate !== undefined) dbObj.renewal_date = acc.renewalDate;
  if (acc.owner !== undefined) dbObj.owner = acc.owner;
  if (acc.health !== undefined) dbObj.health = acc.health;
  if (acc.notes !== undefined) dbObj.notes = acc.notes;
  return dbObj;
}

// Helper: map db ledger row to frontend LedgerEntry
function mapDbLedger(row: any): LedgerEntry {
  return {
    id: row.id,
    date: row.date,
    vendor: row.vendor,
    description: row.description ?? '',
    category: row.category,
    amount: Number(row.amount ?? 0),
    variancePercent: Number(row.variance_percent ?? row.variancePercent ?? 0),
    status: row.status,
    analystNote: row.analyst_note ?? row.analystNote ?? '',
  };
}

// Helper: map frontend LedgerEntry to db row
function mapLedgerToDb(entry: Partial<LedgerEntry>) {
  const dbObj: Record<string, any> = {};
  if (entry.id !== undefined) dbObj.id = entry.id;
  if (entry.date !== undefined) dbObj.date = entry.date;
  if (entry.vendor !== undefined) dbObj.vendor = entry.vendor;
  if (entry.description !== undefined) dbObj.description = entry.description;
  if (entry.category !== undefined) dbObj.category = entry.category;
  if (entry.amount !== undefined) dbObj.amount = entry.amount;
  if (entry.variancePercent !== undefined) dbObj.variance_percent = entry.variancePercent;
  if (entry.status !== undefined) dbObj.status = entry.status;
  if (entry.analystNote !== undefined) dbObj.analyst_note = entry.analystNote;
  return dbObj;
}

// Helper: map db report to ReportSnapshot
function mapDbReport(row: any): ReportSnapshot {
  return {
    id: row.id,
    title: row.title,
    audience: row.audience,
    generatedAt: row.generated_at ?? row.generatedAt,
    period: row.period,
    scenario: row.scenario,
    executiveSummary: row.executive_summary ?? row.executiveSummary ?? '',
    revenueBlock: row.revenue_block ?? row.revenueBlock ?? '',
    treasuryBlock: row.treasury_block ?? row.treasuryBlock ?? '',
    actionItems: Array.isArray(row.action_items) ? row.action_items : (row.actionItems ?? []),
  };
}

function mapReportToDb(report: Partial<ReportSnapshot>) {
  const dbObj: Record<string, any> = {};
  if (report.id !== undefined) dbObj.id = report.id;
  if (report.title !== undefined) dbObj.title = report.title;
  if (report.audience !== undefined) dbObj.audience = report.audience;
  if (report.generatedAt !== undefined) dbObj.generated_at = report.generatedAt;
  if (report.period !== undefined) dbObj.period = report.period;
  if (report.scenario !== undefined) dbObj.scenario = report.scenario;
  if (report.executiveSummary !== undefined) dbObj.executive_summary = report.executiveSummary;
  if (report.revenueBlock !== undefined) dbObj.revenue_block = report.revenueBlock;
  if (report.treasuryBlock !== undefined) dbObj.treasury_block = report.treasuryBlock;
  if (report.actionItems !== undefined) dbObj.action_items = report.actionItems;
  return dbObj;
}

// ---------------------- ROUTES ----------------------

// 1. Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured,
    service: 'BizReport Financial API',
  });
});

// 2. Accounts API
app.get('/api/accounts', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('current_arr', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return res.json(data.map(mapDbAccount));
      }
    }
    res.json(memoryAccounts);
  } catch (err: any) {
    console.error('Error fetching accounts:', err.message);
    res.json(memoryAccounts);
  }
});

app.post('/api/accounts', async (req: Request, res: Response) => {
  try {
    const newAcc: AccountRecord = {
      ...req.body,
      id: req.body.id || `acc-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapAccountToDb(newAcc);
      const { data, error } = await supabase.from('accounts').insert(dbPayload).select().single();
      if (error) throw error;
      return res.status(201).json(mapDbAccount(data));
    }

    memoryAccounts.unshift(newAcc);
    res.status(201).json(newAcc);
  } catch (err: any) {
    console.error('Error inserting account:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/accounts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapAccountToDb(updates);
      dbPayload.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('accounts')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json(mapDbAccount(data));
    }

    memoryAccounts = memoryAccounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    const found = memoryAccounts.find((a) => a.id === id);
    res.json(found);
  } catch (err: any) {
    console.error('Error updating account:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Ledger Entries API
app.get('/api/ledger', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ledger_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return res.json(data.map(mapDbLedger));
      }
    }
    res.json(memoryLedger);
  } catch (err: any) {
    console.error('Error fetching ledger:', err.message);
    res.json(memoryLedger);
  }
});

app.post('/api/ledger', async (req: Request, res: Response) => {
  try {
    const newEntry: LedgerEntry = {
      ...req.body,
      id: req.body.id || `led-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapLedgerToDb(newEntry);
      const { data, error } = await supabase.from('ledger_entries').insert(dbPayload).select().single();
      if (error) throw error;
      return res.status(201).json(mapDbLedger(data));
    }

    memoryLedger.unshift(newEntry);
    res.status(201).json(newEntry);
  } catch (err: any) {
    console.error('Error creating ledger entry:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/ledger/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapLedgerToDb(updates);
      dbPayload.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('ledger_entries')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json(mapDbLedger(data));
    }

    memoryLedger = memoryLedger.map((e) => (e.id === id ? { ...e, ...updates } : e));
    const found = memoryLedger.find((e) => e.id === id);
    res.json(found);
  } catch (err: any) {
    console.error('Error updating ledger entry:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ledger/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('ledger_entries').delete().eq('id', id);
      if (error) throw error;
    }
    memoryLedger = memoryLedger.filter((e) => e.id !== id);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting ledger entry:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Reports API
app.get('/api/reports', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return res.json(data.map(mapDbReport));
      }
    }
    res.json(memoryReports);
  } catch (err: any) {
    console.error('Error fetching reports:', err.message);
    res.json(memoryReports);
  }
});

app.post('/api/reports', async (req: Request, res: Response) => {
  try {
    const report: ReportSnapshot = {
      ...req.body,
      id: req.body.id || `rep-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapReportToDb(report);
      const { data, error } = await supabase.from('reports').insert(dbPayload).select().single();
      if (error) throw error;
      return res.status(201).json(mapDbReport(data));
    }

    memoryReports.unshift(report);
    res.status(201).json(report);
  } catch (err: any) {
    console.error('Error saving report:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. Analytics & Projections
app.get('/api/analytics', (req: Request, res: Response) => {
  const period = (req.query.period as PeriodRange) || '30D';
  const scenario = (req.query.scenario as ScenarioType) || 'Base Case';

  const kpis = getKpisForContext(period, scenario);
  const trajectory = getTrajectoryData(period, scenario);

  res.json({
    kpis,
    trajectory,
    mrrMovements: MRR_MOVEMENT_DATA,
    cohortRetention: COHORT_RETENTION_DATA,
  });
});

// 6. Seed Data API to populate Supabase directly from backend
app.post('/api/seed', async (req: Request, res: Response) => {
  if (!isSupabaseConfigured || !supabase) {
    return res.status(400).json({
      error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env first.',
    });
  }

  try {
    // Seed Accounts
    const accRows = INITIAL_ACCOUNTS.map(mapAccountToDb);
    await supabase.from('accounts').upsert(accRows, { onConflict: 'id' });

    // Seed Ledger
    const ledgerRows = INITIAL_LEDGER_ENTRIES.map(mapLedgerToDb);
    await supabase.from('ledger_entries').upsert(ledgerRows, { onConflict: 'id' });

    // Seed Reports
    const reportRows = INITIAL_REPORTS.map(mapReportToDb);
    await supabase.from('reports').upsert(reportRows, { onConflict: 'id' });

    res.json({
      success: true,
      message: 'Supabase database successfully seeded with initial accounts, ledger, and reports!',
    });
  } catch (err: any) {
    console.error('Error seeding Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default app;
