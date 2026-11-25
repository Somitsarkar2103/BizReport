-- BizReport / Kestrel Executive Financial Intelligence Schema for Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT NOT NULL CHECK (segment IN ('Enterprise', 'Mid-Market', 'Self-Serve')),
  current_arr NUMERIC NOT NULL DEFAULT 0,
  expansion_delta NUMERIC NOT NULL DEFAULT 0,
  ndr_percent NUMERIC NOT NULL DEFAULT 100,
  renewal_date DATE NOT NULL,
  owner TEXT NOT NULL,
  health TEXT NOT NULL CHECK (health IN ('Healthy', 'Warning', 'Critical')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEDGER ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  vendor TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Payroll', 'Cloud & Infra', 'GTM & Sales', 'G&A')),
  amount NUMERIC NOT NULL DEFAULT 0,
  variance_percent NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Reconciled', 'Pending', 'Flagged')),
  analyst_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('Board Packet', 'Monthly Close', 'SaaS Metrics Memo')),
  generated_at TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('30D', '90D', '12M', 'YTD')),
  scenario TEXT NOT NULL CHECK (scenario IN ('Base Case', 'Upside', 'Conservative')),
  executive_summary TEXT DEFAULT '',
  revenue_block TEXT DEFAULT '',
  treasury_block TEXT DEFAULT '',
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MRR MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.mrr_movements (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  new_business NUMERIC NOT NULL DEFAULT 0,
  expansion NUMERIC NOT NULL DEFAULT 0,
  contraction NUMERIC NOT NULL DEFAULT 0,
  churn NUMERIC NOT NULL DEFAULT 0,
  net_new NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COHORT RETENTION TABLE
CREATE TABLE IF NOT EXISTS public.cohort_retentions (
  id SERIAL PRIMARY KEY,
  cohort TEXT NOT NULL,
  starting_arr NUMERIC NOT NULL DEFAULT 0,
  customers INTEGER NOT NULL DEFAULT 0,
  retention JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrr_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_retentions ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated access policies for BizReport workspace
DROP POLICY IF EXISTS "Public accounts access" ON public.accounts;
CREATE POLICY "Public accounts access" ON public.accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public ledger access" ON public.ledger_entries;
CREATE POLICY "Public ledger access" ON public.ledger_entries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reports access" ON public.reports;
CREATE POLICY "Public reports access" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public mrr access" ON public.mrr_movements;
CREATE POLICY "Public mrr access" ON public.mrr_movements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public cohort access" ON public.cohort_retentions;
CREATE POLICY "Public cohort access" ON public.cohort_retentions FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ledger_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

-- Initial Seed Data
INSERT INTO public.accounts (id, name, segment, current_arr, expansion_delta, ndr_percent, renewal_date, owner, health, notes)
VALUES
  ('acc-1', 'Northstar BioLabs', 'Enterprise', 480000, 96000, 125, '2027-01-18', 'Maya Lin', 'Healthy', 'Multi-year genomics pipeline add-on approved by procurement; legal redlines complete.'),
  ('acc-2', 'Helios Freight Systems', 'Enterprise', 410000, 65000, 118, '2026-12-14', 'David Okafor', 'Healthy', 'Added 400 fleet telemetry seats in Q4; executive sponsor check-in scheduled.'),
  ('acc-3', 'Vanguard Grid Energy', 'Enterprise', 360000, -42000, 88, '2026-12-09', 'Maya Lin', 'Critical', 'Division reorganization reducing regional workspace licenses; retention offer sent.'),
  ('acc-4', 'Cobalt Robotics', 'Mid-Market', 245000, 52000, 127, '2027-02-04', 'Claire Dubois', 'Healthy', 'Warehouse analytics module piloted across 3 facilities with 94% weekly active rate.'),
  ('acc-5', 'Strata Financial Group', 'Enterprise', 520000, 88000, 120, '2027-03-11', 'David Okafor', 'Healthy', 'SOC-2 audit archive tier upgraded; annual prepay invoice scheduled.'),
  ('acc-6', 'Aether Maritime', 'Mid-Market', 185000, -14000, 92, '2026-12-22', 'Claire Dubois', 'Warning', 'Seat utilization dipped to 61% after seasonal shipping slowdown; onboarding session booked.'),
  ('acc-7', 'Kinetix Semiconductor', 'Enterprise', 390000, 74000, 123, '2027-01-29', 'Maya Lin', 'Healthy', 'Expanding cleanroom telemetry feeds to Austin fabrication site.'),
  ('acc-8', 'Lumen Civic Cloud', 'Self-Serve', 94000, 18000, 124, '2027-01-06', 'Automated Ops', 'Healthy', 'Converted 4 municipal sub-teams from monthly usage plan to annual contract.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ledger_entries (id, date, vendor, description, category, amount, variance_percent, status, analyst_note)
VALUES
  ('led-101', '2026-11-22', 'AWS Infrastructure', 'Production GPU cluster & multi-region RDS compute', 'Cloud & Infra', 46800, 14.2, 'Flagged', 'Spike driven by unscheduled batch backfill on Nov 14; reserved instance coverage review open.'),
  ('led-102', '2026-11-20', 'Rippling Payroll', 'Bi-weekly engineering & GTM payroll cycle', 'Payroll', 112400, 0.4, 'Reconciled', 'Matches approved Q4 headcount plan across 44 FTEs.'),
  ('led-103', '2026-11-19', 'Snowflake Data Cloud', 'Warehouse analytics credits & cross-cloud replication', 'Cloud & Infra', 18950, 8.6, 'Pending', 'Awaiting engineering sign-off on auto-suspend policy change.'),
  ('led-104', '2026-11-17', 'LinkedIn Enterprise Ads', 'Q4 CFO & VP Finance demand generation campaign', 'GTM & Sales', 24500, -3.1, 'Reconciled', 'Under budget with 42 qualified enterprise demos attributed.'),
  ('led-105', '2026-11-15', 'Anthropic & AI Compute', 'Batch inference API usage for document reconciliation', 'Cloud & Infra', 9420, 19.5, 'Flagged', 'Higher token volume during month-end close automation pilot.'),
  ('led-106', '2026-11-12', 'Wilson Sonsini Counsel', 'Enterprise MSA & SOC-2 compliance advisory', 'G&A', 14200, 2.0, 'Reconciled', 'Standard monthly retainer plus Northstar BioLabs redlines.'),
  ('led-107', '2026-11-09', 'Gong Revenue Intelligence', 'Annual seat renewal for 16 AE & CSM seats', 'GTM & Sales', 19200, 0.0, 'Reconciled', 'Prepaid 12-month contract amortized monthly.'),
  ('led-108', '2026-11-06', 'Cloudflare Enterprise', 'Zero-trust edge routing & DDoS mitigation', 'Cloud & Infra', 6150, -1.8, 'Pending', 'Invoice matched to PO #CF-8841; scheduled for Friday ACH run.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reports (id, title, audience, generated_at, period, scenario, executive_summary, revenue_block, treasury_block, action_items)
VALUES
  ('rep-1', 'November 2026 Board Financial Packet', 'Board Packet', 'Nov 23, 2026 · 09:40 PST', '30D', 'Base Case',
   'Committed ARR reached $14.82M (+18.4% MoM annualized pace), outperforming the Q4 operating plan by $520K. Net Dollar Retention expanded to 124.6% on the strength of Enterprise multi-facility expansions.',
   'Net New MRR hit a record $412K in November, led by $278K in new enterprise logos and $174K in seat and module expansion. Gross churn remained tightly contained at 0.9% annualized.',
   'Monthly net burn compressed to $184.2K (-11.5% improvement), extending zero-debt cash runway to 34.2 months on $6.30M in liquid treasury reserves.',
   '["Finalize Vanguard Grid Energy retention package ahead of Dec 9 renewal.", "Convert 35% of AWS GPU cluster workloads to 1-year reserved capacity to recover $6.4K/mo.", "Approve Q1 AE hiring requisition (2 enterprise reps) contingent on December collections."]'::jsonb),
  ('rep-2', 'October Close Variance Memorandum', 'Monthly Close', 'Nov 05, 2026 · 17:15 PST', '90D', 'Base Case',
   'October closed 1.8% favorable to operating expense budget due to deferred GTM contractor spend and lower SaaS seat overlap.',
   'Expansion MRR accounted for 43.5% of total Net New MRR, validating the Q3 pricing tier migration across Mid-Market accounts.',
   'Ending cash stood at $6.48M with 98.4% of billed receivables collected within 30 days.',
   '["Audit Snowflake warehouse auto-suspend thresholds with data platform lead.", "Close out remaining two pending cloud infrastructure invoices before Nov 10."]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mrr_movements (month, new_business, expansion, contraction, churn, net_new)
VALUES
  ('Jun', 185, 96, -22, -34, 225),
  ('Jul', 210, 112, -18, -29, 275),
  ('Aug', 194, 128, -26, -31, 265),
  ('Sep', 238, 142, -19, -25, 336),
  ('Oct', 254, 158, -21, -28, 363),
  ('Nov', 278, 174, -16, -24, 412);

INSERT INTO public.cohort_retentions (cohort, starting_arr, customers, retention)
VALUES
  ('May 2026', 640, 18, '[100, 102, 105, 111, 116, 121, 125]'::jsonb),
  ('Jun 2026', 710, 21, '[100, 101, 106, 112, 118, 123, null]'::jsonb),
  ('Jul 2026', 790, 24, '[100, 103, 108, 114, 119, null, null]'::jsonb),
  ('Aug 2026', 845, 22, '[100, 102, 107, 113, null, null, null]'::jsonb),
  ('Sep 2026', 920, 26, '[100, 104, 110, null, null, null, null]'::jsonb),
  ('Oct 2026', 985, 29, '[100, 103, null, null, null, null, null]'::jsonb);
