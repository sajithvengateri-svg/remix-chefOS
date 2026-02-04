import { create } from 'zustand';
import { 
  ScalableRecipe, 
  ScaledRecipe, 
  ScalingInput,
  ProductionBatch,
  ProductionSchedule,
  GeneratedOrder,
  OrderLineItem,
  AggregatedIngredient,
  PrepTaskWithIngredients
} from '@/types/production';
import { useCostingStore } from './costingStore';

// Sample scalable recipes with yield data
const initialScalableRecipes: ScalableRecipe[] = [
  {
    id: "rec-1",
    name: "Pan-Seared Duck Breast",
    category: "Mains",
    baseServings: 1,
    baseYieldWeight: 0.35,
    yieldUnit: "kg",
    prepTime: "15 min",
    cookTime: "30 min",
    sellPrice: 32,
    targetFoodCostPercent: 28,
    shelfLifeDays: 2,
    ingredients: [
      { ingredientId: "ing-7", quantity: 0.5, unit: "lb", wastePercent: 5, cookingLossPercent: 25 },
      { ingredientId: "ing-6", quantity: 0.1, unit: "lb", wastePercent: 15, cookingLossPercent: 10 },
      { ingredientId: "ing-2", quantity: 0.05, unit: "lb", wastePercent: 0, cookingLossPercent: 0 },
      { ingredientId: "ing-8", quantity: 0.1, unit: "btl", wastePercent: 0, cookingLossPercent: 50 },
    ]
  },
  {
    id: "rec-2",
    name: "Crème Brûlée",
    category: "Desserts",
    baseServings: 6,
    baseYieldWeight: 1.2,
    yieldUnit: "kg",
    prepTime: "20 min",
    cookTime: "45 min",
    sellPrice: 12,
    targetFoodCostPercent: 22,
    shelfLifeDays: 3,
    ingredients: [
      { ingredientId: "ing-3", quantity: 1, unit: "qt", wastePercent: 0, cookingLossPercent: 5 },
      { ingredientId: "ing-9", quantity: 0.5, unit: "dz", wastePercent: 5, cookingLossPercent: 0 },
      { ingredientId: "ing-10", quantity: 0.25, unit: "lb", wastePercent: 0, cookingLossPercent: 0 },
      { ingredientId: "ing-11", quantity: 1, unit: "oz", wastePercent: 0, cookingLossPercent: 0 },
    ]
  },
  {
    id: "rec-3",
    name: "Mushroom Risotto",
    category: "Mains",
    baseServings: 4,
    baseYieldWeight: 2,
    yieldUnit: "kg",
    prepTime: "15 min",
    cookTime: "35 min",
    sellPrice: 24,
    targetFoodCostPercent: 25,
    shelfLifeDays: 2,
    ingredients: [
      { ingredientId: "ing-12", quantity: 1, unit: "lb", wastePercent: 0, cookingLossPercent: 0 },
      { ingredientId: "ing-14", quantity: 1, unit: "lb", wastePercent: 20, cookingLossPercent: 30 },
      { ingredientId: "ing-13", quantity: 0.5, unit: "lb", wastePercent: 10, cookingLossPercent: 0 },
      { ingredientId: "ing-2", quantity: 0.25, unit: "lb", wastePercent: 0, cookingLossPercent: 0 },
      { ingredientId: "ing-8", quantity: 0.4, unit: "btl", wastePercent: 0, cookingLossPercent: 80 },
      { ingredientId: "ing-15", quantity: 2, unit: "qt", wastePercent: 0, cookingLossPercent: 30 },
      { ingredientId: "ing-6", quantity: 0.2, unit: "lb", wastePercent: 15, cookingLossPercent: 10 },
    ]
  },
];

// Sample batches
const initialBatches: ProductionBatch[] = [
  {
    id: "batch-1",
    batchCode: "CB-20260204-001",
    recipeId: "rec-2",
    recipeName: "Crème Brûlée",
    quantity: 48,
    unit: "portions",
    servingsProduced: 48,
    productionDate: new Date(),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    producedBy: "Maria",
    status: "completed",
    actualCost: 42.50,
  },
  {
    id: "batch-2",
    batchCode: "MR-20260204-001",
    recipeId: "rec-3",
    recipeName: "Mushroom Risotto",
    quantity: 8,
    unit: "kg",
    servingsProduced: 16,
    productionDate: new Date(),
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    producedBy: "James",
    status: "in-progress",
  },
];

interface ProductionStore {
  scalableRecipes: ScalableRecipe[];
  batches: ProductionBatch[];
  schedules: ProductionSchedule[];
  generatedOrders: GeneratedOrder[];

  // Scaling functions
  scaleRecipe: (input: ScalingInput) => ScaledRecipe | null;
  calculateYield: (quantity: number, wastePercent: number, cookingLossPercent: number) => { gross: number; usable: number };
  
  // Batch management
  createBatch: (batch: Omit<ProductionBatch, 'id' | 'batchCode'>) => ProductionBatch;
  updateBatchStatus: (batchId: string, status: ProductionBatch['status']) => void;
  getBatchesByDate: (date: Date) => ProductionBatch[];
  
  // Order generation
  aggregateIngredientsFromTasks: (tasks: PrepTaskWithIngredients[]) => AggregatedIngredient[];
  generateOrderFromPrepList: (prepListId: string, tasks: PrepTaskWithIngredients[]) => GeneratedOrder;
}

export const useProductionStore = create<ProductionStore>((set, get) => ({
  scalableRecipes: initialScalableRecipes,
  batches: initialBatches,
  schedules: [],
  generatedOrders: [],

  scaleRecipe: (input: ScalingInput) => {
    const { scalableRecipes } = get();
    const recipe = scalableRecipes.find(r => r.id === input.recipeId);
    if (!recipe) return null;

    const costingStore = useCostingStore.getState();
    
    // Calculate scale factor
    let scaleFactor: number;
    let targetServings: number;
    let targetYieldWeight: number;

    if (input.scaleBy === 'servings' && input.targetServings) {
      scaleFactor = input.targetServings / recipe.baseServings;
      targetServings = input.targetServings;
      targetYieldWeight = recipe.baseYieldWeight * scaleFactor;
    } else if (input.scaleBy === 'yield' && input.targetYieldWeight) {
      scaleFactor = input.targetYieldWeight / recipe.baseYieldWeight;
      targetServings = Math.round(recipe.baseServings * scaleFactor);
      targetYieldWeight = input.targetYieldWeight;
    } else {
      return null;
    }

    // Scale ingredients with yield calculations
    const scaledIngredients = recipe.ingredients.map(ing => {
      const ingredient = costingStore.ingredients.find(i => i.id === ing.ingredientId);
      const scaledQuantity = ing.quantity * scaleFactor;
      
      // Calculate gross quantity needed (accounting for waste and cooking loss)
      const wasteMultiplier = 1 / (1 - ing.wastePercent / 100);
      const grossQuantity = scaledQuantity * wasteMultiplier;
      
      const unitCost = ingredient?.currentPrice || 0;
      const lineCost = grossQuantity * unitCost;

      return {
        ingredientId: ing.ingredientId,
        name: ingredient?.name || 'Unknown',
        originalQuantity: ing.quantity,
        scaledQuantity,
        grossQuantity,
        unit: ing.unit,
        unitCost,
        lineCost,
      };
    });

    const totalCost = scaledIngredients.reduce((sum, ing) => sum + ing.lineCost, 0);

    return {
      originalRecipe: recipe,
      scaleFactor,
      targetServings,
      targetYieldWeight,
      scaledIngredients,
      totalCost,
      costPerServing: totalCost / targetServings,
      costPerUnit: totalCost / targetYieldWeight,
    };
  },

  calculateYield: (quantity: number, wastePercent: number, cookingLossPercent: number) => {
    const afterWaste = quantity * (1 - wastePercent / 100);
    const usable = afterWaste * (1 - cookingLossPercent / 100);
    const gross = quantity / (1 - wastePercent / 100);
    
    return { gross, usable };
  },

  createBatch: (batchData) => {
    const { batches } = get();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prefix = batchData.recipeName.substring(0, 2).toUpperCase();
    const count = batches.filter(b => b.batchCode.startsWith(prefix + '-' + today)).length + 1;
    
    const newBatch: ProductionBatch = {
      ...batchData,
      id: `batch-${Date.now()}`,
      batchCode: `${prefix}-${today}-${count.toString().padStart(3, '0')}`,
    };

    set({ batches: [...batches, newBatch] });
    return newBatch;
  },

  updateBatchStatus: (batchId: string, status: ProductionBatch['status']) => {
    set(state => ({
      batches: state.batches.map(b => 
        b.id === batchId ? { ...b, status } : b
      ),
    }));
  },

  getBatchesByDate: (date: Date) => {
    const { batches } = get();
    const dateStr = date.toDateString();
    return batches.filter(b => b.productionDate.toDateString() === dateStr);
  },

  aggregateIngredientsFromTasks: (tasks: PrepTaskWithIngredients[]) => {
    const costingStore = useCostingStore.getState();
    const aggregated: Map<string, AggregatedIngredient> = new Map();

    tasks.forEach(task => {
      task.ingredients.forEach(ing => {
        const existing = aggregated.get(ing.ingredientId);
        const ingredient = costingStore.ingredients.find(i => i.id === ing.ingredientId);
        
        if (existing) {
          existing.totalRequired += ing.requiredQuantity * task.scaleFactor;
        } else {
          aggregated.set(ing.ingredientId, {
            ingredientId: ing.ingredientId,
            name: ing.name,
            totalRequired: ing.requiredQuantity * task.scaleFactor,
            unit: ing.unit,
            currentStock: 0, // Would come from inventory
            shortfall: 0,
            supplier: ingredient?.supplier || 'Unknown',
            estimatedCost: (ingredient?.currentPrice || 0) * ing.requiredQuantity * task.scaleFactor,
          });
        }
      });
    });

    // Calculate shortfalls (would integrate with real inventory)
    aggregated.forEach((item, key) => {
      item.shortfall = Math.max(0, item.totalRequired - item.currentStock);
    });

    return Array.from(aggregated.values());
  },

  generateOrderFromPrepList: (prepListId: string, tasks: PrepTaskWithIngredients[]) => {
    const { generatedOrders } = get();
    const costingStore = useCostingStore.getState();
    const aggregated = get().aggregateIngredientsFromTasks(tasks);

    const orderItems: OrderLineItem[] = aggregated
      .filter(item => item.shortfall > 0)
      .map(item => {
        const ingredient = costingStore.ingredients.find(i => i.id === item.ingredientId);
        const unitPrice = ingredient?.currentPrice || 0;
        
        return {
          ingredientId: item.ingredientId,
          ingredientName: item.name,
          unit: item.unit,
          supplier: item.supplier,
          requiredQuantity: item.totalRequired,
          currentStock: item.currentStock,
          orderQuantity: item.shortfall,
          unitPrice,
          lineCost: item.shortfall * unitPrice,
          urgency: item.shortfall > item.totalRequired * 0.8 ? 'critical' as const : 
                   item.shortfall > item.totalRequired * 0.3 ? 'needed' as const : 'buffer' as const,
        };
      });

    const suppliers = [...new Set(orderItems.map(i => i.supplier))];

    const order: GeneratedOrder = {
      id: `order-${Date.now()}`,
      generatedFrom: 'prep-list',
      prepListIds: [prepListId],
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      items: orderItems,
      totalCost: orderItems.reduce((sum, item) => sum + item.lineCost, 0),
      status: 'draft',
      createdAt: new Date(),
      suppliersInvolved: suppliers,
    };

    set({ generatedOrders: [...generatedOrders, order] });
    return order;
  },
}));

// Utility functions for yield calculations
export const calculateGrossWeight = (netWeight: number, wastePercent: number): number => {
  return netWeight / (1 - wastePercent / 100);
};

export const calculateNetYield = (grossWeight: number, wastePercent: number, cookingLossPercent: number): number => {
  const afterWaste = grossWeight * (1 - wastePercent / 100);
  return afterWaste * (1 - cookingLossPercent / 100);
};

export const calculateUsableYieldPercent = (wastePercent: number, cookingLossPercent: number): number => {
  return (1 - wastePercent / 100) * (1 - cookingLossPercent / 100) * 100;
};
