export type ScreenId = 'overview' | 'revenue' | 'treasury' | 'reports';

export type PeriodRange = '30D' | '90D' | '12M' | 'YTD';

export type ScenarioType = 'Base Case' | 'Upside' | 'Conservative';

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

export type ReconciliationStatus = 'Reconciled' | 'Pending' | 'Flagged';

export type AccountSegment = 'Enterprise' | 'Mid-Market' | 'Self-Serve';

export type LedgerCategory = 'Payroll' | 'Cloud & Infra' | 'GTM & Sales' | 'G&A';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDirection: 'positive' | 'negative' | 'neutral';
  context: string;
  sparkline: number[];
  accentColor: string;
}

export interface TrajectoryPoint {
  month: string;
  arr: number; // in $M
  planTarget: number; // in $M
  operatingBurn: number; // in $K
}

export interface MrrMovementPoint {
  month: string;
  newBusiness: number; // $K
  expansion: number; // $K
  contraction: number; // negative $K
  churn: number; // negative $K
  netNew: number; // $K
}

export interface CohortRow {
  cohort: string;
  startingArr: number; // $K
  customers: number;
  retention: (number | null)[]; // Month 0 to Month 6 (%)
}

export interface AccountRecord {
  id: string;
  name: string;
  segment: AccountSegment;
  currentArr: number;
  expansionDelta: number;
  ndrPercent: number;
  renewalDate: string;
  owner: string;
  health: HealthStatus;
  notes: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  vendor: string;
  description: string;
  category: LedgerCategory;
  amount: number; // positive = expense outflow, negative = credit/refund
  variancePercent: number;
  status: ReconciliationStatus;
  analystNote: string;
}

export interface ReportSnapshot {
  id: string;
  title: string;
  audience: 'Board Packet' | 'Monthly Close' | 'SaaS Metrics Memo';
  generatedAt: string;
  period: PeriodRange;
  scenario: ScenarioType;
  executiveSummary: string;
  revenueBlock: string;
  treasuryBlock: string;
  actionItems: string[];
}
