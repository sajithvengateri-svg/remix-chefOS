import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IngredientDemand {
  id: string;
  ingredient_name: string;
  category: string;
  total_quantity: number;
  recipe_count: number;
  unit: string;
  avg_cost: number | null;
  inventory_quantity: number;
}

/**
 * Aggregates ingredient demand from:
 * - recipe_ingredients (what recipes need)
 * - ingredients (master list with costs)
 * - inventory (current stock levels)
 * 
 * NO account/user information is exposed - only items, quantities, and categories
 */
export const useMarketplaceDemand = () => {
  return useQuery({
    queryKey: ["marketplace-demand"],
    queryFn: async () => {
      // Fetch recipe ingredients with ingredient details
      const { data: recipeIngredients, error: riError } = await supabase
        .from("recipe_ingredients")
        .select(`
          quantity,
          unit,
          ingredient_id,
          ingredients!inner (
            id,
            name,
            category,
            unit,
            cost_per_unit
          )
        `);

      if (riError) throw riError;

      // Fetch inventory for stock levels
      const { data: inventory, error: invError } = await supabase
        .from("inventory")
        .select("ingredient_id, quantity, unit");

      if (invError) throw invError;

      // Create inventory lookup by ingredient_id
      const inventoryMap = new Map<string, number>();
      inventory?.forEach((item) => {
        if (item.ingredient_id) {
          const current = inventoryMap.get(item.ingredient_id) || 0;
          inventoryMap.set(item.ingredient_id, current + Number(item.quantity || 0));
        }
      });

      // Aggregate demand by ingredient
      const demandMap = new Map<string, {
        ingredient_name: string;
        category: string;
        total_quantity: number;
        recipe_count: number;
        unit: string;
        costs: number[];
        inventory_quantity: number;
      }>();

      recipeIngredients?.forEach((ri) => {
        const ingredient = ri.ingredients as unknown as {
          id: string;
          name: string;
          category: string;
          unit: string;
          cost_per_unit: number | null;
        };

        if (!ingredient) return;

        const key = ingredient.id;
        const existing = demandMap.get(key);

        if (existing) {
          existing.total_quantity += Number(ri.quantity) || 0;
          existing.recipe_count += 1;
          if (ingredient.cost_per_unit) {
            existing.costs.push(Number(ingredient.cost_per_unit));
          }
        } else {
          demandMap.set(key, {
            ingredient_name: ingredient.name,
            category: ingredient.category || "Other",
            total_quantity: Number(ri.quantity) || 0,
            recipe_count: 1,
            unit: ri.unit || ingredient.unit || "kg",
            costs: ingredient.cost_per_unit ? [Number(ingredient.cost_per_unit)] : [],
            inventory_quantity: inventoryMap.get(ingredient.id) || 0,
          });
        }
      });

      // Convert to array and calculate averages
      const result: IngredientDemand[] = Array.from(demandMap.entries()).map(([id, data]) => ({
        id,
        ingredient_name: data.ingredient_name,
        category: data.category,
        total_quantity: data.total_quantity,
        recipe_count: data.recipe_count,
        unit: data.unit,
        avg_cost: data.costs.length > 0 
          ? data.costs.reduce((a, b) => a + b, 0) / data.costs.length 
          : null,
        inventory_quantity: data.inventory_quantity,
      }));

      // Sort by total quantity descending
      return result.sort((a, b) => b.total_quantity - a.total_quantity);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Aggregates demand by category for high-level insights
 */
export const useCategoryDemand = () => {
  const { data: ingredients, isLoading, error } = useMarketplaceDemand();

  const categoryData = ingredients?.reduce((acc, item) => {
    const existing = acc.find((c) => c.category === item.category);
    if (existing) {
      existing.total_quantity += item.total_quantity;
      existing.recipe_count += item.recipe_count;
      existing.ingredient_count += 1;
    } else {
      acc.push({
        category: item.category,
        total_quantity: item.total_quantity,
        recipe_count: item.recipe_count,
        ingredient_count: 1,
        unit: item.unit,
      });
    }
    return acc;
  }, [] as { category: string; total_quantity: number; recipe_count: number; ingredient_count: number; unit: string }[]);

  return {
    data: categoryData?.sort((a, b) => b.total_quantity - a.total_quantity),
    isLoading,
    error,
  };
};
