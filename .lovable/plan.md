

# Kitchen Sections Upgrade: Fix, Chef Assignment, Wall Badges, and RLS

## Overview

This plan fixes three core problems with Kitchen Sections and adds two features:

1. **Bug fix**: Sections fail to save because `org_id` is never included in INSERT/SELECT calls
2. **Security fix**: `section_assignments` has no `org_id` column and uses `USING (true)` for SELECT -- anyone can see all assignments across all orgs
3. **Feature**: Add "Section Leader" dropdown directly in the Add/Edit Section dialog
4. **Feature**: Show section badge next to poster names on the Kitchen Wall (e.g., "Marco / Pastry")

---

## Part 1: Database Migration

### Add `org_id` to `section_assignments`

The `section_assignments` table currently has no `org_id` column, making org-scoped RLS impossible.

```text
ALTER TABLE section_assignments ADD COLUMN org_id uuid;

-- Backfill from parent kitchen_sections
UPDATE section_assignments sa
SET org_id = ks.org_id
FROM kitchen_sections ks
WHERE sa.section_id = ks.id;

-- Make NOT NULL after backfill
ALTER TABLE section_assignments ALTER COLUMN org_id SET NOT NULL;
```

### Replace Unsafe RLS Policies

Current policies are dangerously permissive:
- SELECT: `USING (true)` -- **anyone sees everything**
- ALL: `is_head_chef(auth.uid())` -- **no org check, a head chef in Org A can manage Org B's assignments**

Replace with:

```text
-- Drop unsafe policies
DROP POLICY "Anyone can view section assignments" ON section_assignments;
DROP POLICY "Head chefs can manage section assignments" ON section_assignments;

-- Org-scoped replacements
CREATE POLICY "Org members can view section assignments"
  ON section_assignments FOR SELECT
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Head chefs can manage section assignments"
  ON section_assignments FOR ALL
  USING (
    is_head_chef(auth.uid())
    AND org_id IN (SELECT get_user_org_ids(auth.uid()))
  )
  WITH CHECK (
    is_head_chef(auth.uid())
    AND org_id IN (SELECT get_user_org_ids(auth.uid()))
  );
```

### Fix nullable `org_id` on related tables

Make `org_id` NOT NULL on `kitchen_sections` (after defaulting any existing NULLs):

```text
-- Clean up any NULL org_ids in kitchen_sections
DELETE FROM kitchen_sections WHERE org_id IS NULL;
ALTER TABLE kitchen_sections ALTER COLUMN org_id SET NOT NULL;
```

---

## Part 2: Fix KitchenSectionsManager.tsx

### Problem
- `fetchSections()` queries all sections globally (no org filter)
- `handleSubmit()` insert does not include `org_id`

### Fix
- Import `useOrg()` and get `currentOrg`
- Add `.eq("org_id", currentOrg.id)` to the SELECT query
- Add `org_id: currentOrg.id` to the INSERT payload
- Add a "Section Leader" select dropdown in the Add/Edit dialog, populated from org team members (resolved via `org_memberships` then `profiles`)
- On save, upsert the leader in `section_assignments` with `org_id`

---

## Part 3: Fix useSectionAssignments.ts

### Problem
- Fetches all assignments globally (no org filter)
- Fetches all profiles globally for team members (no org filter)
- Insert calls do not include `org_id`

### Fix
- Accept `orgId` parameter (or use `useOrg()` internally)
- Filter `section_assignments` by org_id
- Resolve team members from `org_memberships` (filtered by org) then join to `profiles`
- Include `org_id` in all insert calls

---

## Part 4: Kitchen Wall Section Badge (TeamFeed.tsx)

### What Changes
- On mount, fetch `section_assignments` (with `role = 'leader'`) and `kitchen_sections` for the current org
- Build a lookup map: `user_id -> { sectionName, sectionColor }`
- Next to each poster's name, render a small colored badge: "Marco / Pastry" with the section's color dot

### Where in the code
In `TeamFeed.tsx`, the post header area (around line 508-509) currently shows:

```text
<p className="font-medium text-sm">{post.user_name || "Team Member"}</p>
```

This becomes:

```text
<p className="font-medium text-sm">
  {post.user_name || "Team Member"}
  {userSectionMap[post.user_id] && (
    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" 
          style={{ backgroundColor: userSectionMap[post.user_id].color + '20', color: userSectionMap[post.user_id].color }}>
      {userSectionMap[post.user_id].sectionName}
    </span>
  )}
</p>
```

---

## Summary of Files

| File | Action | What |
|------|--------|------|
| Migration SQL | Create | Add `org_id` to `section_assignments`, fix RLS, make `kitchen_sections.org_id` NOT NULL |
| `src/components/operations/KitchenSectionsManager.tsx` | Modify | Add `org_id` to queries/inserts, add Section Leader dropdown in dialog |
| `src/hooks/useSectionAssignments.ts` | Modify | Add org scoping to all queries and inserts |
| `src/components/feed/TeamFeed.tsx` | Modify | Fetch section assignments, show section badge next to poster names |
| `src/integrations/supabase/types.ts` | Auto-updated | Will reflect new `org_id` column on `section_assignments` |

---

## Security Summary

| Table | Before | After |
|-------|--------|-------|
| `section_assignments` SELECT | `USING (true)` -- global leak | `org_id IN get_user_org_ids(auth.uid())` |
| `section_assignments` ALL | `is_head_chef()` only -- cross-org | `is_head_chef() AND org_id IN get_user_org_ids()` |
| `kitchen_sections.org_id` | Nullable | NOT NULL |
| `section_assignments.org_id` | Missing | Added, NOT NULL, org-scoped |

