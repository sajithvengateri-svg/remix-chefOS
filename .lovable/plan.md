

# Demand Pipeline Fix + Brisbane Suburb Map

## Problem Summary
The VendorOS demand insights and Admin heatmap are showing zero data because:
1. The `demand_insights` table is completely empty -- the database trigger only fires for recipes marked as "public", but recipes are now private by default (correct security behavior)
2. The `useMarketplaceDemand` hook tries to query `recipe_ingredients` and `ingredients` directly, but RLS correctly blocks cross-org access for vendor users
3. The Brisbane postcode map only has ~20 entries and needs full suburb coverage

## Solution

### 1. New Demand Aggregation Pipeline (Database)
Instead of relying on the broken trigger, create a **database function** that aggregates anonymized ingredient demand into the `demand_insights` table. This function will:
- Query `ingredients` table across ALL orgs (using `SECURITY DEFINER`)
- Join with `org_venues` to get postcodes (hiding org identity)
- Aggregate by category + postcode + week
- Write results to `demand_insights`
- Expose ZERO org/user identifiers

A scheduled call or manual trigger from the admin panel will refresh this data.

Additionally, update the existing `aggregate_demand_insights` trigger to also fire when ingredients are inserted/updated (not just recipe_ingredients), so the pipeline stays fresh automatically.

### 2. Update VendorOS to Read from `demand_insights` (Not Raw Tables)
Rewrite `useMarketplaceDemand.ts` so the vendor-facing hook reads from the `demand_insights` table (which vendors already have RLS SELECT access to) instead of trying to join `recipe_ingredients` + `ingredients` (which RLS correctly blocks).

This means:
- VendorOS sees aggregated category-level demand by postcode
- No ingredient-level detail that could identify recipes
- No org/user data exposed

### 3. Add Brisbane Suburb Postcodes to Heatmap
Expand the `postcodeCoords` map in `AdminHeatmap.tsx` with comprehensive Brisbane/SEQ suburb postcodes (4000-4179 range) to properly render the heatmap for Queensland-based orgs like FOCC.IT (4006) and Biri (4007).

### 4. Seed Initial Demand Data
Run the new aggregation function to populate `demand_insights` from the 3 existing ingredients across the 2 orgs, so vendors and admins see data immediately.

### 5. Admin Dashboard Sync
The Admin heatmap already reads from `demand_insights` -- once the table is populated, it will automatically display on the admin dashboard with no code changes needed.

---

## Technical Details

### Database Migration
```sql
-- Function to refresh demand insights from ingredients across all orgs
CREATE OR REPLACE FUNCTION public.refresh_demand_insights()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  refreshed integer := 0;
  current_week_end date;
BEGIN
  current_week_end := date_trunc('week', CURRENT_DATE) + interval '6 days';
  
  -- Clear current week data and re-aggregate
  DELETE FROM demand_insights WHERE week_ending = current_week_end;
  
  INSERT INTO demand_insights (ingredient_category, postcode, week_ending, total_quantity, order_count, unit, avg_price_paid)
  SELECT 
    i.category,
    COALESCE(v.postcode, '0000'),
    current_week_end,
    SUM(COALESCE(ri.quantity, 0)),
    COUNT(ri.id),
    MODE() WITHIN GROUP (ORDER BY COALESCE(ri.unit, i.unit)),
    AVG(i.cost_per_unit)
  FROM ingredients i
  LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
  LEFT JOIN org_venues v ON v.org_id = i.org_id
  WHERE i.org_id IS NOT NULL
  GROUP BY i.category, COALESCE(v.postcode, '0000'), current_week_end;
  
  GET DIAGNOSTICS refreshed = ROW_COUNT;
  RETURN refreshed;
END;
$$;
```

### Files to Modify
- `supabase/migrations/` -- New migration with `refresh_demand_insights` function
- `src/hooks/useMarketplaceDemand.ts` -- Rewrite to read from `demand_insights` table
- `src/portals/admin/components/AdminHeatmap.tsx` -- Add Brisbane suburb postcodes
- `src/portals/vendor/pages/VendorInsights.ts` -- Update to work with new demand data shape

### Privacy Guarantee
- Only category, postcode, quantity, and unit flow to vendors/admin
- No org names, user IDs, recipe names, or business details are exposed
- Postcode maps to suburb area (not specific address)

