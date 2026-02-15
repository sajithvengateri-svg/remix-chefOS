

# Food Safety Duty Assignments: Shift-Based Team Responsibility

## Overview

Add a "Duty Roster" tab to the Food Safety page where Head Chefs can assign specific team members to AM and PM food safety shifts. Assigned chefs get in-app alerts when they start their shift reminding them to complete temp checks and receiving logs. At night, a reminder prompts the closing chef to complete their temp checks and submit the nightly prep list before leaving.

## What Changes

### 1. New Database Table: `food_safety_duties`

Stores who is assigned to which food safety shift, on which date (or as a recurring default).

```text
food_safety_duties
  - id (uuid, PK)
  - org_id (uuid, NOT NULL)
  - user_id (uuid, NOT NULL)
  - shift (text: 'am' | 'pm')
  - duty_date (date, nullable) -- NULL = recurring default assignment
  - assigned_by (uuid)
  - created_at (timestamptz)
  UNIQUE(org_id, user_id, shift, duty_date)
```

RLS: Org members can view; Head Chefs can manage.

### 2. New Database Table: `food_safety_reminders`

Tracks which reminders have been shown/dismissed so we don't nag repeatedly.

```text
food_safety_reminders
  - id (uuid, PK)
  - org_id (uuid, NOT NULL)
  - user_id (uuid, NOT NULL)
  - reminder_type (text: 'shift_start' | 'shift_end' | 'prep_list')
  - reminder_date (date)
  - dismissed_at (timestamptz, nullable)
  - created_at (timestamptz)
  UNIQUE(org_id, user_id, reminder_type, reminder_date)
```

RLS: Users manage their own reminders.

### 3. Duty Roster Tab on Food Safety Page

A new "Duty Roster" tab added to `FoodSafety.tsx` showing:

- **Today's Assignments**: AM chef and PM chef displayed prominently with avatar and name
- **Default Roster**: Head Chef sets recurring default assignments (e.g., "Chef Marco always does AM, Chef Sarah does PM") -- these apply unless overridden for a specific date
- **Date Override**: Tap a specific date to assign a different chef for that day
- **Team Picker**: Dropdown of org team members pulled from `org_memberships` + `profiles`

### 4. In-App Shift Reminders

A new component `FoodSafetyReminder.tsx` mounted in `AppLayout.tsx` that checks:

- **Morning Alert** (shown once per day when the AM-assigned chef logs in): "You're on food safety duty today (AM). Start your temp checks!" with a link to `/food-safety`
- **Evening Alert** (shown after 4pm to the PM-assigned chef): "Don't forget: Complete PM temp checks and submit tonight's prep list before you leave"
- Reminders appear as a toast-style banner at the top of the dashboard -- dismissible, tracked in `food_safety_reminders` so they only show once per day

### 5. Duty Badge on Daily Temp Checks

The existing `DailyTempChecks.tsx` component will show who is assigned to the current shift at the top: "On duty: Chef Marco (AM)" -- making it clear to the whole team who is responsible.

## Technical Details

### Database Migration

```sql
-- Duty assignments
CREATE TABLE public.food_safety_duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  shift text NOT NULL DEFAULT 'am',
  duty_date date, -- NULL = recurring default
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id, shift, duty_date)
);

ALTER TABLE food_safety_duties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view duties"
  ON food_safety_duties FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Head chefs can manage duties"
  ON food_safety_duties FOR ALL
  USING (is_head_chef(auth.uid()) AND org_id IN (SELECT get_user_org_ids(auth.uid())))
  WITH CHECK (is_head_chef(auth.uid()) AND org_id IN (SELECT get_user_org_ids(auth.uid())));

-- Reminder tracking
CREATE TABLE public.food_safety_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reminder_type text NOT NULL,
  reminder_date date NOT NULL DEFAULT CURRENT_DATE,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id, reminder_type, reminder_date)
);

ALTER TABLE food_safety_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminders"
  ON food_safety_reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Files to Create

- **`src/components/food-safety/DutyRosterTab.tsx`** -- The duty assignment management UI with team picker, AM/PM slots, date overrides, and default roster management
- **`src/components/food-safety/FoodSafetyReminder.tsx`** -- In-app reminder banner that checks duty assignments and shows alerts to the assigned chef at shift start/end
- **`src/hooks/useFoodSafetyDuties.ts`** -- Hook to fetch/manage duty assignments, resolve today's on-duty chef (checking date override first, then default), and fetch team members

### Files to Modify

- **`src/pages/FoodSafety.tsx`** -- Add "Duty Roster" tab alongside existing tabs (Daily, Logs, Cleaning, etc.)
- **`src/components/food-safety/DailyTempChecks.tsx`** -- Show "On Duty" badge at top with assigned chef name for the current shift
- **`src/components/layout/AppLayout.tsx`** -- Mount `FoodSafetyReminder` component to show shift start/end alerts globally

### Reminder Logic

The reminder component runs on app load and checks:

1. Is the current user assigned to today's food safety duty (AM or PM)?
2. Has this reminder already been dismissed today?
3. If AM duty and it's before 2pm, show morning reminder
4. If PM duty and it's after 4pm, show evening reminder (includes prep list nudge)
5. Dismissing creates a record in `food_safety_reminders` for today

### Duty Resolution Order

When determining who is on duty for a given shift + date:
1. Check `food_safety_duties` for a row matching the exact date (date override)
2. If none found, check for a row with `duty_date IS NULL` (recurring default)
3. If still none, show "Unassigned" with a prompt for Head Chef to set it up

