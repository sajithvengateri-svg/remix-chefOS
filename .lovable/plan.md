

# ChefOS Master Plan -- Launch and Beyond

## The Big Picture

ChefOS launches with **9 polished core features**, with remaining modules marked "Coming Soon" to build anticipation. The Chef Vault is saved as a post-launch upgrade for Head Chefs only.

---

## PHASE 1: Launch-Ready Polish (Now)

### 1.1 Navigation Overhaul

**Bottom Nav (Mobile)** -- Fixed 5-item bar, no carousel:
- Home | Prep | Recipes | Costing | Menu

**Sidebar (Desktop)** -- Two sections:
- **Core** (no badges): Dashboard, Prep Lists, Recipe Bank, Costing, Invoices, Menu Engineering, Kitchen Wall, Equipment, Team
- **Coming Soon** (muted with badge): Inventory, Production, Marketplace, Allergens, Roster, Calendar, Kitchen Sections, Cheatsheets, Food Safety, Training

### 1.2 Data Cleanup

Delete all existing test data to start fresh:
- `recipe_ingredients` (FK dependency)
- `recipe_ccps` (FK dependency)
- `prep_list_comments` (FK dependency)
- `prep_lists`
- `recipes`

### 1.3 Dashboard (Home) Fixes

- Fix Quick Actions broken paths: `/inventory/log` becomes `/inventory`, `/invoices/scan` becomes `/invoices`
- Replace "Log Inventory" with "View Costing" pointing to `/ingredients`
- Keep: Stats grid, Quick Actions, Prep Widget, Kitchen Wall, Alerts
- Hide non-launch widgets behind "Coming Soon" teaser cards

### 1.4 Recipes -- Verify End-to-End

- New Recipe flow: `/recipes/new` with ingredient linking and cost calculation
- Recipe Detail: GP%, cost per serving, margin display from linked ingredients
- Import, bulk import, sections, CCPs -- all already working

### 1.5 Costing (Ingredients Page) -- Polish

- Ensure price update tracking: `previous_cost_per_unit` saved before changes, `last_price_update` timestamp updated
- Add price change indicator (up/down arrow) on ingredient cards

### 1.6 Prep Lists -- Verify End-to-End

- Create, add items, assign, save flow
- Dashboard prep widget counts today's tasks correctly
- Comments, templates, weekly view all functional

### 1.7 Invoices -- Polish

- Verify scan flow: upload image, AI extracts items, review matches, update prices
- Add "Recent Scans" history section (requires new `invoice_scans` table)

### 1.8 Menu Engineering -- Verify End-to-End

- Create menu, add items, view matrix (Stars/Plow Horses/Puzzles/Dogs)
- AI analysis via `analyze-menu` edge function
- Menu comparison between versions

### 1.9 Kitchen Wall -- Keep Visible

- Already built in `TeamFeed.tsx` with posts, reactions, comments, image uploads
- Ensure it stays on Dashboard and is accessible from sidebar
- Wired to `team_posts`, `post_reactions`, `post_comments` with realtime

### 1.10 Equipment -- Verify Working

- Full CRUD with `equipment` table
- Tech contacts, maintenance scheduling, asset label scanner
- Accessible from sidebar

### 1.11 Teams -- Verify Working

- Member list, invite flow, tasks tab, activity feed, org chart tab
- Uses `org_memberships`, `profiles`, `team_invites` tables

---

## PHASE 2: Ingredient Price Tracking (Now)

### 2.1 New Database Table: `ingredient_price_history`

```text
ingredient_price_history
  id              uuid, PK
  ingredient_id   uuid, NOT NULL, references ingredients(id) ON DELETE CASCADE
  old_price       numeric
  new_price       numeric, NOT NULL
  source          text ('manual', 'invoice', 'import')
  changed_by      uuid, nullable
  created_at      timestamptz, default now()
```

RLS: SELECT for authenticated users; INSERT handled by trigger.

### 2.2 Database Trigger

Auto-log price changes: when `ingredients.cost_per_unit` is updated and the value differs from the old value, insert a row into `ingredient_price_history` with old and new prices.

### 2.3 Price History Line Chart Component

- New component: `PriceHistoryChart.tsx` using Recharts (already installed)
- Small chart icon button on each ingredient card
- Clicking opens a popover with a `LineChart` showing price over time
- X-axis: date, Y-axis: price per unit, data points from `ingredient_price_history`
- Shows "No price changes recorded yet" if empty

---

## PHASE 3: Invoice Scan History (Now)

### 3.1 New Database Table: `invoice_scans`

```text
invoice_scans
  id              uuid, PK
  org_id          uuid, nullable
  scanned_by      uuid, nullable
  file_name       text
  items_extracted integer
  items_matched   integer
  prices_updated  integer
  scan_data       jsonb
  status          text ('processing', 'completed', 'failed')
  created_at      timestamptz, default now()
```

### 3.2 Recent Scans Widget

- New component on the Invoices page showing past scan history
- Each row: file name, date, items extracted/matched, status badge
- Connected to `InvoiceScannerDialog` to save results after scan

---

## PHASE 4: Chef Vault (Future Update -- Head Chef/Admin Only)

Saved for post-launch. Full plan preserved:

- **Database**: `vault_credentials` and `vault_profiles` tables
- **Access Control**: Only Head Chefs, Owners, and Admins can seal recipes and access the Vault
- **The Bridge**: "Seal to Vault" button on Recipe Detail snapshots GP%, costing data
- **Magic Link Signatures**: Public approval page at `/vault/approve/:token` -- no login required for the signer
- **Edge Function**: `vault-signature` for token-based approval/rejection
- **Adapter Pattern**: `signature_hash` field ready for future blockchain Verifiable Credentials (Privy/Crossmint)
- **Privacy**: Searchable-but-anonymous profiles for the Brisbane Talent Bank

---

## Files Summary

### New Files to Create
1. `supabase/migrations/[timestamp]_ingredient_price_history.sql` -- price history table + trigger
2. `supabase/migrations/[timestamp]_invoice_scans.sql` -- invoice scan history table
3. `src/components/ingredients/PriceHistoryChart.tsx` -- Recharts line chart in popover
4. `src/components/invoices/RecentScans.tsx` -- scan history widget

### Files to Modify
1. `src/hooks/useBottomNavPrefs.ts` -- update default 5 items, reorder allNavItems
2. `src/components/layout/BottomNav.tsx` -- fixed 5-item bar (remove carousel), show only launch items
3. `src/components/layout/Sidebar.tsx` -- add "Coming Soon" badges to non-launch nav items
4. `src/components/dashboard/QuickActions.tsx` -- fix broken paths, swap actions
5. `src/pages/Ingredients.tsx` -- add price history button + popover per card, price change indicators
6. `src/pages/Invoices.tsx` -- add RecentScans component
7. `src/pages/Dashboard.tsx` -- streamline for launch features, keep Kitchen Wall visible

### Data Operations
- DELETE from `recipe_ingredients`, `recipe_ccps`, `prep_list_comments`, `prep_lists`, `recipes`

