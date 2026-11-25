# Supabase & Backend Setup for BizReport (Kestrel)

This project now includes a complete Node.js/Express backend API connected to Supabase PostgreSQL database, with real-time support and offline-safe local caching.

---

## 1. Quick Setup in Supabase (2 minutes)

1. **Create or Open a Supabase Project:**
   - Go to [database.new](https://database.new) or log in to [supabase.com](https://supabase.com).
   - Create a new project (e.g., `BizReport`).

2. **Execute Database Schema:**
   - In your Supabase dashboard, click **SQL Editor** on the left navigation bar.
   - Click **New Query**, open [`supabase/schema.sql`](./supabase/schema.sql) in this repo, copy its contents, paste it into the SQL editor, and click **Run**.
   - This creates all 5 tables (`accounts`, `ledger_entries`, `reports`, `mrr_movements`, `cohort_retentions`), enables Row Level Security (RLS) with permissive read/write policies, enables Realtime publications, and seeds the initial data!

3. **Retrieve Your Supabase API Keys:**
   - In Supabase, navigate to **Project Settings** -> **API** (or **Data API**).
   - Copy:
     - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
     - **anon / public** key (e.g., `eyJhbGciOi...`)
     - **service_role** key (optional, for administrative server operations)

4. **Update `.env` in `BizReport`:**
   Open `.env` in the root of `BizReport` and fill in:
   ```env
   PORT=3001

   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

   # Vite Client Variables
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   VITE_API_URL=http://localhost:3001
   ```

---

## 2. Running the System

You can run the backend server and frontend development server:

### Terminal 1 (Backend Server):
```bash
npm run server
```
- Starts the Express API server at `http://localhost:3001`
- Endpoints:
  - `GET  /api/health` - Server and Supabase connection health check
  - `GET  /api/accounts` - List all SaaS customer accounts
  - `POST /api/accounts` - Create new customer account
  - `PATCH /api/accounts/:id` - Update account health & notes
  - `GET  /api/ledger` - List treasury operating transactions
  - `POST /api/ledger` - Log new expense entry
  - `PATCH /api/ledger/:id` - Reconcile / update status & analyst notes
  - `DELETE /api/ledger/:id` - Remove ledger entry
  - `GET  /api/reports` - Fetch synthesized board and memo reports
  - `POST /api/reports` - Save generated reports
  - `GET  /api/analytics` - MRR waterfall movements, cohorts & KPI forecast
  - `POST /api/seed` - One-click re-seed database with initial dataset

### Terminal 2 (Frontend Client):
```bash
npm run dev
```
- Starts Vite at `http://localhost:3000`
- Automatically proxies API requests to the backend server and directly syncs with Supabase.

---

## 3. Architecture Overview

```
BizReport (Frontend - Vite + React 19)
   │
   ├─► Express API Server (http://localhost:3001)
   │      │
   │      └─► Supabase Client (@supabase/supabase-js)
   │             │
   │             └─► Supabase Cloud PostgreSQL Database
   │
   └─► Direct Supabase fallback / Realtime client (src/services/supabase.ts)
```

- **Graceful Fallback:** If Supabase credentials are not provided yet, the backend and frontend automatically operate using in-memory mock storage so the UI is immediately interactive without crashing.
- **Optimistic Updates:** UI immediately updates upon logging transactions, saving reports, or changing health flags, and persists them via the API / Supabase in the background.
