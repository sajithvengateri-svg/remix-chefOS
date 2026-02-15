

# Chef Induction System: 14-Day Guided Onboarding

## Overview

A structured, hand-held onboarding experience that guides new chefs (and org admins) through everything they need to get their kitchen fully operational on ChefOS. It works like a "2-week induction programme" with daily missions, contextual tooltips, and a progress tracker -- all dismissible once the chef is comfortable.

## How It Works

The system has three layers:

1. **Induction Tracker** (persistent dashboard widget) -- Replaces the current simple `SetupProgressWidget` with a phased, day-by-day induction checklist organized into Week 1 and Week 2
2. **Contextual Guide Cards** -- When a chef lands on a page for the first time (e.g. Recipes), a slide-up card explains what to do here, with a "Show me" button that highlights the key action
3. **Daily Workflow Guide** -- A collapsible "Today's Workflow" card on the dashboard showing the recommended daily routine (morning prep check, service, nightly count) -- can be turned off in Settings

## The 14-Day Induction Plan

### Week 1: Foundation

| Day | Mission | Page | What They Do |
|-----|---------|------|-------------|
| 1 | Welcome and Setup | Dashboard | Complete profile, set up org details, add venues |
| 2 | Your First Recipe | Recipes | Create or import 1 recipe (photo, paste, or manual) |
| 3 | Build Your Pantry | Ingredients | Add 10+ ingredients with costs and suppliers |
| 4 | Kitchen Sections | Kitchen Sections | Create sections (Hot, Cold, Pastry, etc.) and assign team |
| 5 | Prep List Templates | Prep Lists | Set up section prep templates with par levels |
| 6 | Team and Roles | Team | Invite team members, assign roles and sections |
| 7 | Review and Catch-up | Dashboard | Complete any missed steps, explore settings |

### Week 2: Advanced

| Day | Mission | Page | What They Do |
|-----|---------|------|-------------|
| 8 | Scan Your First Invoice | Invoices | Snap a photo of a supplier invoice |
| 9 | Yield Testing | Production | Log a yield test (butchery, fish, batch) |
| 10 | Menu Upload | Menu Engineering | Upload or create a menu, link recipes |
| 11 | Equipment and Smallwares | Inventory | Log plates, cutlery, equipment counts |
| 12 | Cleaning Inventory | Inventory | Add cleaning materials and chemicals |
| 13 | Food Safety Setup | Food Safety | Set up CCP points and temperature logs |
| 14 | Daily Workflow | Dashboard | Run through a full day (prep, service, nightly count) |

## Database

### New table: `induction_progress`

Tracks per-user progress through the induction steps:

```text
induction_progress
  - id (uuid, PK)
  - user_id (uuid, references profiles)
  - org_id (uuid)
  - step_key (text) -- e.g. "day1_profile", "day3_pantry"
  - completed_at (timestamptz, nullable)
  - skipped (boolean, default false)
  - created_at (timestamptz)
  UNIQUE(user_id, org_id, step_key)
```

### Add to `AppSettings` (localStorage)

- `inductionEnabled: boolean` (default true, user can turn off)
- `inductionStartDate: string` (ISO date, set on first dashboard visit)
- `showDailyWorkflow: boolean` (default true)

## Components

### 1. InductionTracker (replaces SetupProgressWidget)

A card on the dashboard right column showing:
- Current day/phase ("Day 3 of 14 -- Build Your Pantry")
- Overall progress bar
- Expandable checklist grouped by Week 1 / Week 2
- Each step links to the relevant page
- Steps auto-complete when data exists (e.g. "Add recipes" completes when recipe count > 0)
- "Skip" option on each step
- "I'm done, turn off induction" button at the bottom

### 2. PageGuideCard

A slide-up card shown once per page (first visit):
- Title: "Welcome to Recipes"
- 2-3 bullet points explaining what to do
- "Got it" dismisses permanently
- "Show me" highlights the primary CTA button with a pulse animation
- Stored in localStorage: `chefos_page_guides_seen`

### 3. DailyWorkflowCard

Dashboard widget showing the recommended daily routine:
- **Morning**: Check prep lists, review stock counts from last night
- **Service**: Log temperatures, handle orders
- **Close**: Complete nightly stock count, archive prep list, review yields
- Each item links to the relevant page
- Collapsible, with a "Don't show again" toggle

### 4. Settings Integration

Add an "Induction" section to Settings > General:
- Toggle: "Show induction guide" (on/off)
- Toggle: "Show daily workflow reminders" (on/off)  
- Button: "Reset induction" (start over)
- Progress indicator: "Day 8 of 14 -- 60% complete"

## Files to Create

- `src/components/onboarding/InductionTracker.tsx` -- The main phased checklist widget
- `src/components/onboarding/PageGuideCard.tsx` -- Contextual first-visit guide overlay
- `src/components/onboarding/DailyWorkflowCard.tsx` -- Daily routine guide widget
- `src/hooks/useInduction.ts` -- Hook managing induction state, step completion detection, day calculation

## Files to Modify

- `src/pages/Dashboard.tsx` -- Replace `SetupProgressWidget` with `InductionTracker`, add `DailyWorkflowCard`
- `src/hooks/useAppSettings.ts` -- Add `inductionEnabled`, `inductionStartDate`, `showDailyWorkflow` settings
- `src/pages/Settings.tsx` -- Add Induction section to General tab
- `src/components/layout/AppLayout.tsx` -- Mount `PageGuideCard` system for contextual guides on each page

## Auto-Completion Logic

Steps complete automatically by checking real data (no manual ticking needed):

- "Complete profile" -- profile has avatar_url or bio set
- "Add recipes" -- recipe count > 0
- "Add ingredients" -- ingredient count >= 10
- "Set up sections" -- kitchen_sections count > 0
- "Create prep templates" -- section_stock_templates count > 0
- "Invite team" -- org membership count > 1
- "Scan invoice" -- invoice_scans count > 0
- "Log yield test" -- yield_tests count > 0
- "Upload menu" -- menus count > 0
- "Equipment inventory" -- equipment_inventory count > 0
- "Cleaning inventory" -- cleaning_inventory count > 0
- "Nightly count" -- nightly_stock_counts count > 0

## Migration

One table with RLS scoped to the authenticated user:

```sql
CREATE TABLE public.induction_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  step_key text NOT NULL,
  completed_at timestamptz,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id, step_key)
);

ALTER TABLE induction_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own induction"
  ON induction_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

