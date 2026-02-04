import { create } from 'zustand';
import { Ingredient, Recipe, PriceUpdateEvent, RecipeCostImpact } from '@/types/costing';

// Empty initial state - no mock data
const initialIngredients: Ingredient[] = [];
const initialRecipes: Recipe[] = [];

interface CostingStore {
  ingredients: Ingredient[];
  recipes: Recipe[];
  priceHistory: PriceUpdateEvent[];
  
  // Actions
  updateIngredientPrice: (ingredientId: string, newPrice: number, source: 'invoice' | 'manual') => RecipeCostImpact[];
  getRecipeWithCosts: (recipeId: string) => Recipe | null;
  calculateRecipeCost: (recipe: Recipe) => number;
  getAffectedRecipes: (ingredientId: string) => Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
}

export const useCostingStore = create<CostingStore>((set, get) => ({
  ingredients: initialIngredients,
  recipes: initialRecipes,
  priceHistory: [],

  updateIngredientPrice: (ingredientId: string, newPrice: number, source: 'invoice' | 'manual') => {
    const { ingredients, recipes, priceHistory } = get();
    const ingredient = ingredients.find(i => i.id === ingredientId);
    
    if (!ingredient) return [];

    const oldPrice = ingredient.currentPrice;
    
    // Create price update event
    const event: PriceUpdateEvent = {
      ingredientId,
      oldPrice,
      newPrice,
      source,
      timestamp: new Date(),
    };

    // Calculate impact on affected recipes
    const affectedRecipes = recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ingredientId)
    );

    const impacts: RecipeCostImpact[] = affectedRecipes.map(recipe => {
      const oldCost = get().calculateRecipeCost(recipe);
      
      // Calculate new cost with updated price
      const newCost = recipe.ingredients.reduce((total, ri) => {
        const ing = ingredients.find(i => i.id === ri.ingredientId);
        if (!ing) return total;
        const price = ri.ingredientId === ingredientId ? newPrice : ing.currentPrice;
        return total + (price * ri.quantity);
      }, 0);

      const oldFoodCostPercent = (oldCost / recipe.sellPrice) * 100;
      const newFoodCostPercent = (newCost / recipe.sellPrice) * 100;

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        oldCost,
        newCost,
        costChange: newCost - oldCost,
        costChangePercent: ((newCost - oldCost) / oldCost) * 100,
        oldFoodCostPercent,
        newFoodCostPercent,
        isNowOverBudget: newFoodCostPercent > recipe.targetFoodCostPercent,
      };
    });

    // Update state
    set({
      ingredients: ingredients.map(i => 
        i.id === ingredientId 
          ? { ...i, previousPrice: oldPrice, currentPrice: newPrice, lastUpdated: new Date() }
          : i
      ),
      priceHistory: [...priceHistory, event],
    });

    return impacts;
  },

  getRecipeWithCosts: (recipeId: string) => {
    const { recipes, ingredients } = get();
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) return null;

    // Enrich with ingredient details and costs
    const enrichedIngredients = recipe.ingredients.map(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredientId);
      return {
        ...ri,
        ingredient,
        cost: ingredient ? ingredient.currentPrice * ri.quantity : 0,
      };
    });

    const totalCost = enrichedIngredients.reduce((sum, ri) => sum + (ri.cost || 0), 0);
    const costPerServing = totalCost / recipe.servings;
    const actualFoodCostPercent = (costPerServing / recipe.sellPrice) * 100;
    const maxAllowedCost = (recipe.sellPrice * recipe.targetFoodCostPercent) / 100;

    return {
      ...recipe,
      ingredients: enrichedIngredients,
      totalCost,
      costPerServing,
      actualFoodCostPercent,
      margin: recipe.sellPrice - costPerServing,
      maxAllowedCost,
      isOverBudget: actualFoodCostPercent > recipe.targetFoodCostPercent,
    };
  },

  calculateRecipeCost: (recipe: Recipe) => {
    const { ingredients } = get();
    return recipe.ingredients.reduce((total, ri) => {
      const ingredient = ingredients.find(i => i.id === ri.ingredientId);
      return total + (ingredient ? ingredient.currentPrice * ri.quantity : 0);
    }, 0);
  },

  getAffectedRecipes: (ingredientId: string) => {
    const { recipes } = get();
    return recipes.filter(r => 
      r.ingredients.some(ri => ri.ingredientId === ingredientId)
    );
  },

  addRecipe: (recipe: Recipe) => {
    set(state => ({ recipes: [...state.recipes, recipe] }));
  },

  updateRecipe: (recipe: Recipe) => {
    set(state => ({
      recipes: state.recipes.map(r => r.id === recipe.id ? recipe : r),
    }));
  },
}));

// Utility functions for reverse costing
export const calculateReverseCost = (sellPrice: number, targetFoodCostPercent: number, servings: number = 1) => {
  const maxAllowedCost = (sellPrice * targetFoodCostPercent) / 100;
  const maxCostPerServing = maxAllowedCost; // Assuming sellPrice is per serving
  const targetMargin = sellPrice - maxAllowedCost;
  const targetMarginPercent = 100 - targetFoodCostPercent;

  return {
    maxAllowedCost,
    maxCostPerServing,
    targetMargin,
    targetMarginPercent,
    maxIngredientBudget: maxAllowedCost * servings,
  };
};

export const calculateSellPriceFromCost = (cost: number, targetFoodCostPercent: number) => {
  return cost / (targetFoodCostPercent / 100);
};

export const calculateFoodCostPercent = (cost: number, sellPrice: number) => {
  return (cost / sellPrice) * 100;
};
