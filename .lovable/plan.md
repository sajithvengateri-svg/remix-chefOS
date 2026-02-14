

# Master Plan: Bottom Nav Carousel + Admin Updates Tab

## Summary

Three changes bundled together:

1. **Bottom Nav** -- Replace the popup "More" menu with a flat horizontal scrollable carousel showing 7 active items
2. **Admin Updates Tab** -- New page in the Control Centre to track feature releases and improvements to existing modules
3. **Database** -- New `feature_releases` table to persist release planning data

---

## Part 1: Bottom Nav Carousel

Replace the current popup-style secondary strip with a single scrollable row of 7 items. No "More" button, no popup.

**The 7 items:**
Home | Prep | Recipes | Costing | Menu | Equipment | Teams

### Changes to `src/hooks/useBottomNavPrefs.ts`
- Update `allNavItems` to only include the 7 active carousel items (remove all "Coming Soon" modules)
- Change `defaultPrimaryPaths` to all 7 paths
- Remove the "exactly 5" constraint -- allow 7 items
- Remove `secondaryItems` logic (no longer needed)

### Changes to `src/components/layout/BottomNav.tsx`
- Remove `showSecondary` state and the "More" toggle button entirely
- Remove the secondary popup strip
- Replace the fixed `flex` layout with `flex overflow-x-auto` so items scroll horizontally
- Render all 7 `primaryItems` in a single scrollable row
- Each item keeps the existing active indicator (dot + scale) and branded Home icon

---

## Part 2: Database -- `feature_releases` Table

New table to track both unreleased modules and improvements to live features.

```text
feature_releases
  id              uuid, PK, default gen_random_uuid()
  module_slug     text, NOT NULL
  module_name     text, NOT NULL
  description     text, nullable
  status          text, DEFAULT 'development' (development | beta | released)
  release_type    text, DEFAULT 'new' (new | improvement)
  target_release  text, nullable (e.g. 'March 2026')
  release_notes   text, nullable
  sort_order      integer, DEFAULT 0
  released_at     timestamptz, nullable
  created_at      timestamptz, DEFAULT now()
  updated_at      timestamptz, DEFAULT now()
```

**RLS Policies:**
- Admins: full access (ALL)
- Authenticated users: read-only (SELECT)

**Seed data** -- 10 "Coming Soon" modules pre-populated as `release_type = 'new'`, `status = 'development'`:
Inventory, Production, Marketplace, Allergens, Roster, Calendar, Kitchen Sections, Cheatsheets, Food Safety, Training

Plus 3 example improvement tickets for live modules (`release_type = 'improvement'`):
- Recipes: Batch duplicate recipes
- Prep Lists: Drag-to-reorder items
- Costing: Supplier comparison view

---

## Part 3: Admin Updates Page

New page at `/admin/updates` with two tabs for managing the release roadmap.

### Tab 1: New Modules
- Card grid showing each "Coming Soon" module
- Each card displays: module name, description, current status badge, target release date
- Status toggle buttons: Development -> Beta -> Released
- Target release text input (e.g. "March 2026")
- Release notes textarea
- When toggled to "Released", `released_at` is set automatically

### Tab 2: Feature Improvements
- List of improvement tickets grouped by module
- "Add Improvement" button opens inline form: module selector, description, target release, status
- Each entry shows status badge + target date
- Safe by design -- only reads/writes to `feature_releases`, never touches customer data tables

### Admin Sidebar Update
Add "Updates" nav item with `RefreshCw` icon between "Email Templates" and "Analytics" in the admin sidebar.

### App Router Update
Add route `/admin/updates` pointing to `AdminUpdates` component, import added to `App.tsx`.

---

## Files Summary

### New Files
1. `supabase/migrations/[timestamp]_feature_releases.sql` -- table, RLS policies, seed data
2. `src/portals/admin/pages/AdminUpdates.tsx` -- the Updates management page with two tabs

### Modified Files
1. `src/components/layout/BottomNav.tsx` -- flat 7-item scrollable carousel, remove popup
2. `src/hooks/useBottomNavPrefs.ts` -- 7 active items, remove secondary logic
3. `src/portals/admin/components/AdminSidebar.tsx` -- add "Updates" nav item
4. `src/App.tsx` -- add AdminUpdates import and route

### Data Safety
The `feature_releases` table is a standalone planning tool. It never reads from or writes to customer data tables (recipes, ingredients, prep_lists, etc.). All mutations are admin-only via RLS. This gives you a safe system to plan, track, and push feature updates on your own schedule.

