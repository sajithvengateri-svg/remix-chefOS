// Production, Yield, Scaling, and Batch Management Types

// Yield tracking for ingredients
export interface YieldFactor {
  wastePercent: number;        // Trim loss (e.g., 20% for vegetable peels)
  cookingLossPercent: number;  // Shrinkage during cooking (e.g., 25% for meat)
  usableYieldPercent: number;  // Calculated: 100 - waste - cooking loss
}

// Extended ingredient with yield data
export interface IngredientWithYield {
  ingredientId: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  cookingLossPercent: number;
  // Calculated
  grossQuantity?: number;      // What you need to purchase
  usableQuantity?: number;     // What you actually get after prep
  cost?: number;
}

// Recipe with full yield chain
export interface ScalableRecipe {
  id: string;
  name: string;
  category: string;
  baseServings: number;
  baseYieldWeight: number;     // e.g., 2.5 kg
  yieldUnit: string;           // kg, L, portions
  prepTime: string;
  cookTime: string;
  sellPrice: number;
  targetFoodCostPercent: number;
  ingredients: IngredientWithYield[];
  instructions?: string[];
  shelfLifeDays: number;       // For batch tracking
}

// Scaling calculation input
export interface ScalingInput {
  recipeId: string;
  scaleBy: 'servings' | 'yield';
  targetServings?: number;
  targetYieldWeight?: number;
}

// Scaling result
export interface ScaledRecipe {
  originalRecipe: ScalableRecipe;
  scaleFactor: number;
  targetServings: number;
  targetYieldWeight: number;
  scaledIngredients: {
    ingredientId: string;
    name: string;
    originalQuantity: number;
    scaledQuantity: number;
    grossQuantity: number;      // After accounting for waste
    unit: string;
    unitCost: number;
    lineCost: number;
  }[];
  totalCost: number;
  costPerServing: number;
  costPerUnit: number;          // Cost per kg/L/portion
}

// Batch/Production record
export interface ProductionBatch {
  id: string;
  batchCode: string;           // e.g., "SAL-20260204-001"
  recipeId: string;
  recipeName: string;
  quantity: number;
  unit: string;
  servingsProduced: number;
  productionDate: Date;
  expiryDate: Date;
  producedBy: string;
  status: 'planned' | 'in-progress' | 'completed' | 'discarded';
  actualCost?: number;
  notes?: string;
}

// Production schedule
export interface ProductionSchedule {
  id: string;
  date: Date;
  shift: 'AM' | 'PM';
  batches: ProductionBatch[];
  assignedStaff: string[];
  status: 'draft' | 'confirmed' | 'completed';
}

// Order generation types
export interface OrderLineItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  supplier: string;
  requiredQuantity: number;    // From prep list aggregation
  currentStock: number;        // From inventory
  orderQuantity: number;       // Required - current
  unitPrice: number;
  lineCost: number;
  urgency: 'critical' | 'needed' | 'buffer';
}

export interface GeneratedOrder {
  id: string;
  generatedFrom: 'prep-list' | 'par-level' | 'manual';
  prepListIds: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  items: OrderLineItem[];
  totalCost: number;
  status: 'draft' | 'submitted' | 'received';
  createdAt: Date;
  suppliersInvolved: string[];
}

// Prep list with ordering integration
export interface PrepListWithOrdering {
  id: string;
  date: Date;
  shift: 'AM' | 'PM';
  tasks: PrepTaskWithIngredients[];
  aggregatedIngredients: AggregatedIngredient[];
  generatedOrderId?: string;
}

export interface PrepTaskWithIngredients {
  id: string;
  task: string;
  recipeId?: string;
  recipeName?: string;
  quantity: number;
  unit: string;
  scaleFactor: number;
  assignee: string;
  dueTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  ingredients: {
    ingredientId: string;
    name: string;
    requiredQuantity: number;
    unit: string;
  }[];
}

export interface AggregatedIngredient {
  ingredientId: string;
  name: string;
  totalRequired: number;
  unit: string;
  currentStock: number;
  shortfall: number;
  supplier: string;
  estimatedCost: number;
}
