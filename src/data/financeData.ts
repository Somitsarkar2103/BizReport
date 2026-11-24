import {
  AccountRecord,
  CohortRow,
  KpiMetric,
  LedgerEntry,
  MrrMovementPoint,
  PeriodRange,
  ReportSnapshot,
  ScenarioType,
  TrajectoryPoint,
} from '../types/finance';

export const SCENARIO_MULTIPLIERS: Record<
  ScenarioType,
  { arrFactor: number; burnFactor: number; ndrOffset: number }
> = {
  'Base Case': { arrFactor: 1, burnFactor: 1, ndrOffset: 0 },
  Upside: { arrFactor: 1.08, burnFactor: 0.94, ndrOffset: 4.2 },
  Conservative: { arrFactor: 0.92, burnFactor: 1.07, ndrOffset: -3.8 },
};

export const PERIOD_LABELS: Record<PeriodRange, string> = {
  '30D': 'Last 30 days',
  '90D': 'Last 90 days',
  '12M': 'Trailing 12 months',
  YTD: 'Year to date',
};

export function getKpisForContext(
  period: PeriodRange,
  scenario: ScenarioType,
  extraMonthlyBurnK = 0
): KpiMetric[] {
  const mult = SCENARIO_MULTIPLIERS[scenario];
  const baseArrByPeriod: Record<PeriodRange, number> = {
    '30D': 14.82,
    '90D': 14.38,
    '12M': 13.65,
    YTD: 14.54,
  };
  const baseNdrByPeriod: Record<PeriodRange, number> = {
    '30D': 124.6,
    '90D': 122.8,
    '12M': 119.4,
    YTD: 123.5,
  };
  const baseBurnByPeriod: Record<PeriodRange, number> = {
    '30D': 184.2,
    '90D': 192.6,
    '12M': 214.5,
    YTD: 189.0,
  };

  const arr = baseArrByPeriod[period] * mult.arrFactor;
  const ndr = baseNdrByPeriod[period] + mult.ndrOffset;
  const burn = baseBurnByPeriod[period] * mult.burnFactor + extraMonthlyBurnK;
  const cashBalanceM = 6.3;
  const runwayMonths = (cashBalanceM * 1000) / Math.max(burn, 40);

  const arrDeltaMap: Record<PeriodRange, string> = {
    '30D': '+18.4%',
    '90D': '+21.2%',
    '12M': '+44.8%',
    YTD: '+32.6%',
  };

  return [
    {
      id: 'arr',
      label: 'Committed ARR',
      value: `$${arr.toFixed(2)}M`,
      delta: arrDeltaMap[period],
      deltaDirection: 'positive',
      context: `vs prior ${period.toLowerCase()}`,
      sparkline: [11.2, 11.7, 12.1, 12.6, 13.2, 13.9, 14.3, Number(arr.toFixed(2))],
      accentColor: '#7C5CFC',
    },
    {
      id: 'ndr',
      label: 'Net Dollar Retention',
      value: `${ndr.toFixed(1)}%`,
      delta: ndr >= 120 ? '+3.2 pts' : '-1.4 pts',
      deltaDirection: ndr >= 120 ? 'positive' : 'negative',
      context: 'Enterprise + Mid-Market',
      sparkline: [116, 117.5, 118.2, 120.1, 121.4, 122.9, 123.8, Number(ndr.toFixed(1))],
      accentColor: '#23C8B5',
    },
    {
      id: 'burn',
      label: 'Monthly Net Burn',
      value: `$${burn.toFixed(1)}K`,
      delta: burn < 195 ? '-11.5%' : '+4.8%',
      deltaDirection: burn < 195 ? 'positive' : 'negative',
      context: 'Operating efficiency',
      sparkline: [242, 231, 224, 212, 204, 198, 190, Number(burn.toFixed(1))],
      accentColor: '#23C8B5',
    },
    {
      id: 'runway',
      label: 'Cash Runway',
      value: `${runwayMonths.toFixed(1)} mo`,
      delta: `$${cashBalanceM.toFixed(2)}M cash`,
      deltaDirection: runwayMonths >= 24 ? 'positive' : 'neutral',
      context: 'Zero-debt treasury',
      sparkline: [26.4, 27.8, 28.9, 30.1, 31.4, 32.5, 33.4, Number(runwayMonths.toFixed(1))],
      accentColor: '#7C5CFC',
    },
  ];
}

export function getTrajectoryData(
  period: PeriodRange,
  scenario: ScenarioType
): TrajectoryPoint[] {
  const mult = SCENARIO_MULTIPLIERS[scenario];
  const full12: TrajectoryPoint[] = [
    { month: 'Dec', arr: 10.24, planTarget: 10.1, operatingBurn: 248 },
    { month: 'Jan', arr: 10.68, planTarget: 10.5, operatingBurn: 242 },
    { month: 'Feb', arr: 11.12, planTarget: 10.9, operatingBurn: 236 },
    { month: 'Mar', arr: 11.58, planTarget: 11.3, operatingBurn: 228 },
    { month: 'Apr', arr: 11.96, planTarget: 11.7, operatingBurn: 221 },
    { month: 'May', arr: 12.42, planTarget: 12.1, operatingBurn: 215 },
    { month: 'Jun', arr: 12.89, planTarget: 12.5, operatingBurn: 209 },
    { month: 'Jul', arr: 13.34, planTarget: 12.9, operatingBurn: 202 },
    { month: 'Aug', arr: 13.78, planTarget: 13.3, operatingBurn: 197 },
    { month: 'Sep', arr: 14.18, planTarget: 13.7, operatingBurn: 192 },
    { month: 'Oct', arr: 14.52, planTarget: 14.0, operatingBurn: 188 },
    { month: 'Nov', arr: 14.82, planTarget: 14.3, operatingBurn: 184 },
  ];

  const sliced =
    period === '30D'
      ? full12.slice(-6)
      : period === '90D'
      ? full12.slice(-8)
      : period === 'YTD'
      ? full12.slice(1)
      : full12;

  return sliced.map((pt) => ({
    month: pt.month,
    arr: Number((pt.arr * mult.arrFactor).toFixed(2)),
    planTarget: pt.planTarget,
    operatingBurn: Math.round(pt.operatingBurn * mult.burnFactor),
  }));
}

export const MRR_MOVEMENT_DATA: MrrMovementPoint[] = [
  { month: 'Jun', newBusiness: 185, expansion: 96, contraction: -22, churn: -34, netNew: 225 },
  { month: 'Jul', newBusiness: 210, expansion: 112, contraction: -18, churn: -29, netNew: 275 },
  { month: 'Aug', newBusiness: 194, expansion: 128, contraction: -26, churn: -31, netNew: 265 },
  { month: 'Sep', newBusiness: 238, expansion: 142, contraction: -19, churn: -25, netNew: 336 },
  { month: 'Oct', newBusiness: 254, expansion: 158, contraction: -21, churn: -28, netNew: 363 },
  { month: 'Nov', newBusiness: 278, expansion: 174, contraction: -16, churn: -24, netNew: 412 },
];

export const COHORT_RETENTION_DATA: CohortRow[] = [
  { cohort: 'May 2026', startingArr: 640, customers: 18, retention: [100, 102, 105, 111, 116, 121, 125] },
  { cohort: 'Jun 2026', startingArr: 710, customers: 21, retention: [100, 101, 106, 112, 118, 123, null] },
  { cohort: 'Jul 2026', startingArr: 790, customers: 24, retention: [100, 103, 108, 114, 119, null, null] },
  { cohort: 'Aug 2026', startingArr: 845, customers: 22, retention: [100, 102, 107, 113, null, null, null] },
  { cohort: 'Sep 2026', startingArr: 920, customers: 26, retention: [100, 104, 110, null, null, null, null] },
  { cohort: 'Oct 2026', startingArr: 985, customers: 29, retention: [100, 103, null, null, null, null, null] },
];

export const INITIAL_ACCOUNTS: AccountRecord[] = [
  {
    id: 'acc-1',
    name: 'Northstar BioLabs',
    segment: 'Enterprise',
    currentArr: 480000,
    expansionDelta: 96000,
    ndrPercent: 125,
    renewalDate: '2027-01-18',
    owner: 'Maya Lin',
    health: 'Healthy',
    notes: 'Multi-year genomics pipeline add-on approved by procurement; legal redlines complete.',
  },
  {
    id: 'acc-2',
    name: 'Helios Freight Systems',
    segment: 'Enterprise',
    currentArr: 410000,
    expansionDelta: 65000,
    ndrPercent: 118,
    renewalDate: '2026-12-14',
    owner: 'David Okafor',
    health: 'Healthy',
    notes: 'Added 400 fleet telemetry seats in Q4; executive sponsor check-in scheduled.',
  },
  {
    id: 'acc-3',
    name: 'Vanguard Grid Energy',
    segment: 'Enterprise',
    currentArr: 360000,
    expansionDelta: -42000,
    ndrPercent: 88,
    renewalDate: '2026-12-09',
    owner: 'Maya Lin',
    health: 'Critical',
    notes: 'Division reorganization reducing regional workspace licenses; retention offer sent.',
  },
  {
    id: 'acc-4',
    name: 'Cobalt Robotics',
    segment: 'Mid-Market',
    currentArr: 245000,
    expansionDelta: 52000,
    ndrPercent: 127,
    renewalDate: '2027-02-04',
    owner: 'Claire Dubois',
    health: 'Healthy',
    notes: 'Warehouse analytics module piloted across 3 facilities with 94% weekly active rate.',
  },
  {
    id: 'acc-5',
    name: 'Strata Financial Group',
    segment: 'Enterprise',
    currentArr: 520000,
    expansionDelta: 88000,
    ndrPercent: 120,
    renewalDate: '2027-03-11',
    owner: 'David Okafor',
    health: 'Healthy',
    notes: 'SOC-2 audit archive tier upgraded; annual prepay invoice scheduled.',
  },
  {
    id: 'acc-6',
    name: 'Aether Maritime',
    segment: 'Mid-Market',
    currentArr: 185000,
    expansionDelta: -14000,
    ndrPercent: 92,
    renewalDate: '2026-12-22',
    owner: 'Claire Dubois',
    health: 'Warning',
    notes: 'Seat utilization dipped to 61% after seasonal shipping slowdown; onboarding session booked.',
  },
  {
    id: 'acc-7',
    name: 'Kinetix Semiconductor',
    segment: 'Enterprise',
    currentArr: 390000,
    expansionDelta: 74000,
    ndrPercent: 123,
    renewalDate: '2027-01-29',
    owner: 'Maya Lin',
    health: 'Healthy',
    notes: 'Expanding cleanroom telemetry feeds to Austin fabrication site.',
  },
  {
    id: 'acc-8',
    name: 'Lumen Civic Cloud',
    segment: 'Self-Serve',
    currentArr: 94000,
    expansionDelta: 18000,
    ndrPercent: 124,
    renewalDate: '2027-01-06',
    owner: 'Automated Ops',
    health: 'Healthy',
    notes: 'Converted 4 municipal sub-teams from monthly usage plan to annual contract.',
  },
];

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led-101',
    date: '2026-11-22',
    vendor: 'AWS Infrastructure',
    description: 'Production GPU cluster & multi-region RDS compute',
    category: 'Cloud & Infra',
    amount: 46800,
    variancePercent: 14.2,
    status: 'Flagged',
    analystNote: 'Spike driven by unscheduled batch backfill on Nov 14; reserved instance coverage review open.',
  },
  {
    id: 'led-102',
    date: '2026-11-20',
    vendor: 'Rippling Payroll',
    description: 'Bi-weekly engineering & GTM payroll cycle',
    category: 'Payroll',
    amount: 112400,
    variancePercent: 0.4,
    status: 'Reconciled',
    analystNote: 'Matches approved Q4 headcount plan across 44 FTEs.',
  },
  {
    id: 'led-103',
    date: '2026-11-19',
    vendor: 'Snowflake Data Cloud',
    description: 'Warehouse analytics credits & cross-cloud replication',
    category: 'Cloud & Infra',
    amount: 18950,
    variancePercent: 8.6,
    status: 'Pending',
    analystNote: 'Awaiting engineering sign-off on auto-suspend policy change.',
  },
  {
    id: 'led-104',
    date: '2026-11-17',
    vendor: 'LinkedIn Enterprise Ads',
    description: 'Q4 CFO & VP Finance demand generation campaign',
    category: 'GTM & Sales',
    amount: 24500,
    variancePercent: -3.1,
    status: 'Reconciled',
    analystNote: 'Under budget with 42 qualified enterprise demos attributed.',
  },
  {
    id: 'led-105',
    date: '2026-11-15',
    vendor: 'Anthropic & AI Compute',
    description: 'Batch inference API usage for document reconciliation',
    category: 'Cloud & Infra',
    amount: 9420,
    variancePercent: 19.5,
    status: 'Flagged',
    analystNote: 'Higher token volume during month-end close automation pilot.',
  },
  {
    id: 'led-106',
    date: '2026-11-12',
    vendor: 'Wilson Sonsini Counsel',
    description: 'Enterprise MSA & SOC-2 compliance advisory',
    category: 'G&A',
    amount: 14200,
    variancePercent: 2.0,
    status: 'Reconciled',
    analystNote: 'Standard monthly retainer plus Northstar BioLabs redlines.',
  },
  {
    id: 'led-107',
    date: '2026-11-09',
    vendor: 'Gong Revenue Intelligence',
    description: 'Annual seat renewal for 16 AE & CSM seats',
    category: 'GTM & Sales',
    amount: 19200,
    variancePercent: 0.0,
    status: 'Reconciled',
    analystNote: 'Prepaid 12-month contract amortized monthly.',
  },
  {
    id: 'led-108',
    date: '2026-11-06',
    vendor: 'Cloudflare Enterprise',
    description: 'Zero-trust edge routing & DDoS mitigation',
    category: 'Cloud & Infra',
    amount: 6150,
    variancePercent: -1.8,
    status: 'Pending',
    analystNote: 'Invoice matched to PO #CF-8841; scheduled for Friday ACH run.',
  },
];

export const INITIAL_REPORTS: ReportSnapshot[] = [
  {
    id: 'rep-1',
    title: 'November 2026 Board Financial Packet',
    audience: 'Board Packet',
    generatedAt: 'Nov 23, 2026 · 09:40 PST',
    period: '30D',
    scenario: 'Base Case',
    executiveSummary:
      'Committed ARR reached $14.82M (+18.4% MoM annualized pace), outperforming the Q4 operating plan by $520K. Net Dollar Retention expanded to 124.6% on the strength of Enterprise multi-facility expansions.',
    revenueBlock:
      'Net New MRR hit a record $412K in November, led by $278K in new enterprise logos and $174K in seat and module expansion. Gross churn remained tightly contained at 0.9% annualized.',
    treasuryBlock:
      'Monthly net burn compressed to $184.2K (-11.5% improvement), extending zero-debt cash runway to 34.2 months on $6.30M in liquid treasury reserves.',
    actionItems: [
      'Finalize Vanguard Grid Energy retention package ahead of Dec 9 renewal.',
      'Convert 35% of AWS GPU cluster workloads to 1-year reserved capacity to recover $6.4K/mo.',
      'Approve Q1 AE hiring requisition (2 enterprise reps) contingent on December collections.',
    ],
  },
  {
    id: 'rep-2',
    title: 'October Close Variance Memorandum',
    audience: 'Monthly Close',
    generatedAt: 'Nov 05, 2026 · 17:15 PST',
    period: '90D',
    scenario: 'Base Case',
    executiveSummary:
      'October closed 1.8% favorable to operating expense budget due to deferred GTM contractor spend and lower SaaS seat overlap.',
    revenueBlock:
      'Expansion MRR accounted for 43.5% of total Net New MRR, validating the Q3 pricing tier migration across Mid-Market accounts.',
    treasuryBlock:
      'Ending cash stood at $6.48M with 98.4% of billed receivables collected within 30 days.',
    actionItems: [
      'Audit Snowflake warehouse auto-suspend thresholds with data platform lead.',
      'Close out remaining two pending cloud infrastructure invoices before Nov 10.',
    ],
  },
];
