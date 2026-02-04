import { create } from 'zustand';
import { Ingredient, Recipe, PriceUpdateEvent, RecipeCostImpact } from '@/types/costing';

// Mock ingredient data
const initialIngredients: Ingredient[] = [
  { id: "ing-1", name: "All-Purpose Flour", category: "Dry Goods", unit: "lb", currentPrice: 0.45, previousPrice: 0.42, supplier: "Sysco", lastUpdated: new Date() },
  { id: "ing-2", name: "Butter (Unsalted)", category: "Dairy", unit: "lb", currentPrice: 4.50, previousPrice: 4.25, supplier: "US Foods", lastUpdated: new Date() },
  { id: "ing-3", name: "Heavy Cream", category: "Dairy", unit: "qt", currentPrice: 3.25, previousPrice: 3.25, supplier: "Local Dairy", lastUpdated: new Date() },
  { id: "ing-4", name: "Fresh Salmon", category: "Proteins", unit: "lb", currentPrice: 12.99, previousPrice: 14.50, supplier: "Fish Market", lastUpdated: new Date() },
  { id: "ing-5", name: "Olive Oil (EVOO)", category: "Oils", unit: "L", currentPrice: 15.00, previousPrice: 14.00, supplier: "Sysco", lastUpdated: new Date() },
  { id: "ing-6", name: "Shallots", category: "Produce", unit: "lb", currentPrice: 3.00, previousPrice: 2.75, supplier: "Local Farm", lastUpdated: new Date() },
  { id: "ing-7", name: "Duck Breast", category: "Proteins", unit: "lb", currentPrice: 18.50, previousPrice: 17.00, supplier: "D'Artagnan", lastUpdated: new Date() },
  { id: "ing-8", name: "White Wine", category: "Beverages", unit: "btl", currentPrice: 8.00, previousPrice: 8.00, supplier: "Wine Depot", lastUpdated: new Date() },
  { id: "ing-9", name: "Eggs", category: "Dairy", unit: "dz", currentPrice: 4.20, previousPrice: 3.80, supplier: "Local Farm", lastUpdated: new Date() },
  { id: "ing-10", name: "Sugar", category: "Dry Goods", unit: "lb", currentPrice: 0.65, previousPrice: 0.60, supplier: "Sysco", lastUpdated: new Date() },
  { id: "ing-11", name: "Vanilla Extract", category: "Dry Goods", unit: "oz", currentPrice: 2.50, previousPrice: 2.50, supplier: "Sysco", lastUpdated: new Date() },
  { id: "ing-12", name: "Arborio Rice", category: "Dry Goods", unit: "lb", currentPrice: 3.50, previousPrice: 3.25, supplier: "Sysco", lastUpdated: new Date() },
  { id: "ing-13", name: "Parmesan Cheese", category: "Dairy", unit: "lb", currentPrice: 12.00, previousPrice: 11.50, supplier: "US Foods", lastUpdated: new Date() },
  { id: "ing-14", name: "Mixed Mushrooms", category: "Produce", unit: "lb", currentPrice: 8.00, previousPrice: 7.50, supplier: "Local Farm", lastUpdated: new Date() },
  { id: "ing-15", name: "Chicken Stock", category: "Prepared", unit: "qt", currentPrice: 2.00, previousPrice: 2.00, supplier: "Sysco", lastUpdated: new Date() },
];

// Mock recipe data with ingredients
const initialRecipes: Recipe[] = [
  {
    id: "rec-1",
    name: "Pan-Seared Duck Breast",
    category: "Mains",
    description: "Perfectly seared duck breast with crispy skin",
    servings: 1,
    prepTime: "45 min",
    sellPrice: 32,
    targetFoodCostPercent: 28,
    ingredients: [
      { ingredientId: "ing-7", quantity: 0.5, unit: "lb" },
      { ingredientId: "ing-6", quantity: 0.1, unit: "lb" },
      { ingredientId: "ing-2", quantity: 0.05, unit: "lb" },
      { ingredientId: "ing-8", quantity: 0.1, unit: "btl" },
    ]
  },
  {
    id: "rec-2",
    name: "Crème Brûlée",
    category: "Desserts",
    description: "Classic French vanilla custard with caramelized sugar",
    servings: 1,
    prepTime: "30 min",
    sellPrice: 12,
    targetFoodCostPercent: 22,
    ingredients: [
      { ingredientId: "ing-3", quantity: 0.25, unit: "qt" },
      { ingredientId: "ing-9", quantity: 0.25, unit: "dz" },
      { ingredientId: "ing-10", quantity: 0.1, unit: "lb" },
      { ingredientId: "ing-11", quantity: 0.5, unit: "oz" },
    ]
  },
  {
    id: "rec-3",
    name: "Mushroom Risotto",
    category: "Mains",
    description: "Creamy arborio rice with mixed wild mushrooms",
    servings: 2,
    prepTime: "45 min",
    sellPrice: 24,
    targetFoodCostPercent: 25,
    ingredients: [
      { ingredientId: "ing-12", quantity: 0.5, unit: "lb" },
      { ingredientId: "ing-14", quantity: 0.5, unit: "lb" },
      { ingredientId: "ing-13", quantity: 0.25, unit: "lb" },
      { ingredientId: "ing-2", quantity: 0.15, unit: "lb" },
      { ingredientId: "ing-8", quantity: 0.2, unit: "btl" },
      { ingredientId: "ing-15", quantity: 1, unit: "qt" },
      { ingredientId: "ing-6", quantity: 0.1, unit: "lb" },
    ]
  },
  {
    id: "rec-4",
    name: "Pan-Seared Salmon",
    category: "Mains",
    description: "Fresh Atlantic salmon with herb butter",
    servings: 1,
    prepTime: "25 min",
    sellPrice: 28,
    targetFoodCostPercent: 30,
    ingredients: [
      { ingredientId: "ing-4", quantity: 0.5, unit: "lb" },
      { ingredientId: "ing-2", quantity: 0.1, unit: "lb" },
      { ingredientId: "ing-5", quantity: 0.05, unit: "L" },
      { ingredientId: "ing-6", quantity: 0.05, unit: "lb" },
    ]
  },
];

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
