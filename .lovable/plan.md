

# Recipe Type System: Dish / Component / Batch Prep / Portion Prep

## The Problem
Currently all recipes are treated the same -- there's just a boolean `is_batch_recipe` flag. In reality, kitchens have distinct recipe types with different costing logic:

1. **Dish** (menu item) -- composed of 3-5 components, priced for the menu
2. **Component** -- a sub-recipe (e.g. pesto, pickled onions) used inside dishes
3. **Batch Prep** -- high-volume bases (stocks, sauces, mayo) that produce a yield with a **unit cost** after production, then get consumed by qty in other recipes
4. **Portion Prep** -- proteins (beef, fish) where yield % matters (trim loss), used across multiple dishes

## What Changes

### 1. Database: Add `recipe_type` column + allow recipes as ingredients
- Add `recipe_type` column to `recipes` table with values: `dish`, `component`, `batch_prep`, `portion_prep` (default: `dish`)
- Migrate existing `is_batch_recipe = true` rows to `recipe_type = 'batch_prep'`
- Add `yield_percent` column to `recipes` for portion prep (e.g. beef fillet = 65% yield after trimming)
- Add `parent_recipe_id` and `sub_recipe_id` columns to `recipe_ingredients` so a dish can reference another recipe as an ingredient (with qty and unit, pulling cost from the sub-recipe's computed unit cost)

### 2. Recipe Cards: Visual Type Tags
- Replace the current "Batch" badge with a color-coded type badge on each card:
  - **Dish**: no badge (default, clean)
  - **Component**: blue "Component" badge
  - **Batch Prep**: purple "Batch" badge
  - **Portion Prep**: amber "Portion" badge
- Add a "Used in X dishes" count for components/batch/portion recipes
- Filter bar gets new type-based filter chips alongside categories

### 3. Recipe Edit: Type-Aware UI
- New "Recipe Type" selector at top of edit page (large, visual toggle)
- **Dish mode**: shows "Components" section where you can link sub-recipes (components, batches, portions) alongside raw ingredients. Each sub-recipe line shows its unit cost + quantity used = line cost
- **Component mode**: same as current but with batch yield fields prominent, and a "Used in" section showing which dishes use it
- **Batch Prep mode**: yield fields front-and-center (makes X kg/L), auto-calculates **cost per unit** after production. This unit cost flows into any dish that uses it
- **Portion Prep mode**: adds yield % field (e.g. whole fish = 55% yield). Calculates true cost per usable unit after waste

### 4. Costing Flow (the key automation)
When a **dish** recipe includes a batch prep sub-recipe:
- The batch recipe's total cost / total yield = cost per unit
- The dish uses qty of that unit, so line cost = qty x batch unit cost
- This cascades automatically -- if stock ingredient prices change, stock cost updates, which updates every dish that uses the stock

### 5. Creation Launcher Update
- After choosing how to start, add a "What type of recipe?" step with 4 visual cards:
  - Dish (plate icon) -- "A menu item with components"
  - Component (puzzle icon) -- "A building block for dishes"
  - Batch Prep (beaker icon) -- "Stocks, sauces, bases made in bulk"
  - Portion Prep (scale icon) -- "Proteins and items with yield loss"

### 6. Recipe Card Improvements
- Show type badge with icon
- For batch/component/portion: show "Used in X dishes" link count
- For dishes: show component count (e.g. "4 components")
- Better visual hierarchy with cost summary visible at a glance

## Technical Details

### Database Migration
```sql
-- Add recipe_type enum-like column
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS recipe_type text NOT NULL DEFAULT 'dish';
-- Add yield_percent for portion prep
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS yield_percent numeric DEFAULT 100;

-- Migrate existing batch recipes
UPDATE recipes SET recipe_type = 'batch_prep' WHERE is_batch_recipe = true;

-- Allow recipe_ingredients to reference sub-recipes
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS sub_recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL;
-- Make ingredient_id nullable (a line is either an ingredient OR a sub-recipe)
ALTER TABLE recipe_ingredients ALTER COLUMN ingredient_id DROP NOT NULL;
-- Add constraint: must have one of ingredient_id or sub_recipe_id
ALTER TABLE recipe_ingredients ADD CONSTRAINT ingredient_or_sub_recipe 
  CHECK (ingredient_id IS NOT NULL OR sub_recipe_id IS NOT NULL);
```

### Files to Modify
- **`src/pages/RecipeEdit.tsx`** -- Add recipe type selector, type-aware UI sections, sub-recipe linking
- **`src/components/recipes/RecipeBuilder.tsx`** -- Support sub-recipe lines alongside ingredients, compute sub-recipe line costs from their yield data
- **`src/components/recipes/RecipeCard.tsx`** -- Type badges, "used in" counts, component counts
- **`src/components/recipes/RecipeCreationLauncher.tsx`** -- Add type selection step after choosing creation method
- **`src/pages/Recipes.tsx`** -- Add type filter chips to filter bar

### Files to Create
- **`src/components/recipes/RecipeTypeSelector.tsx`** -- Visual type picker (4 cards with icons)
- **`src/components/recipes/SubRecipeCombobox.tsx`** -- Searchable combobox for adding sub-recipes to a dish

### Costing Logic Updates
In `RecipeBuilder.tsx`, when a line has `sub_recipe_id` instead of `ingredient_id`:
1. Fetch the sub-recipe's total food cost and yield
2. Calculate unit cost = total cost / yield quantity
3. Line cost = quantity used x unit cost
4. For portion prep sub-recipes, apply yield_percent adjustment

