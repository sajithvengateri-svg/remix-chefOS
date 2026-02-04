import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  Percent,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Package
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import FoodCostCalculator from "@/components/costing/FoodCostCalculator";
import { useCostingStore } from "@/stores/costingStore";
import { cn } from "@/lib/utils";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);
  
  const { getRecipeWithCosts } = useCostingStore();
  const recipe = getRecipeWithCosts(id || "");

  if (!recipe) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Recipe not found</p>
        </div>
      </AppLayout>
    );
  }

  const costPercentColor = recipe.isOverBudget ? "text-destructive" : "text-success";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          <button 
            onClick={() => navigate("/recipes")}
            className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="page-title font-display">{recipe.name}</h1>
                <p className="page-subtitle">{recipe.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCalculator(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Cost Calculator</span>
                </button>
                <button className="btn-primary">
                  <Edit className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Prep Time</span>
            </div>
            <p className="stat-value text-xl">{recipe.prepTime}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Servings</span>
            </div>
            <p className="stat-value text-xl">{recipe.servings}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Sell Price</span>
            </div>
            <p className="stat-value text-xl">${recipe.sellPrice.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-xs">Target Cost %</span>
            </div>
            <p className="stat-value text-xl">{recipe.targetFoodCostPercent}%</p>
          </div>
        </motion.div>

        {/* Cost Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "card-elevated p-5 border-l-4",
            recipe.isOverBudget ? "border-l-destructive" : "border-l-success"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Cost Analysis</h2>
            {recipe.isOverBudget ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Over Budget</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">On Target</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
              <p className="text-2xl font-bold">${recipe.totalCost?.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Cost/Serving</p>
              <p className="text-2xl font-bold">${recipe.costPerServing?.toFixed(2)}</p>
            </div>
            <div className={cn("p-4 rounded-xl", recipe.isOverBudget ? "bg-destructive/10" : "bg-success/10")}>
              <p className="text-xs text-muted-foreground mb-1">Actual Food Cost %</p>
              <p className={cn("text-2xl font-bold", costPercentColor)}>
                {recipe.actualFoodCostPercent?.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Max Allowed Cost</p>
              <p className="text-2xl font-bold text-primary">${recipe.maxAllowedCost?.toFixed(2)}</p>
            </div>
          </div>

          {/* Variance indicator */}
          {recipe.isOverBudget && recipe.maxAllowedCost && recipe.costPerServing && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm">
                <span className="font-medium text-destructive">
                  ${(recipe.costPerServing - recipe.maxAllowedCost).toFixed(2)} over budget
                </span>
                <span className="text-muted-foreground"> — reduce ingredients or increase sell price to </span>
                <span className="font-medium text-foreground">
                  ${((recipe.costPerServing || 0) / (recipe.targetFoodCostPercent / 100)).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {/* Margin info */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <p className="text-xl font-bold text-success">${recipe.margin?.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Margin %</p>
              <p className="text-xl font-bold text-success">
                {(100 - (recipe.actualFoodCostPercent || 0)).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ingredient Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <h2 className="section-header mb-0">Ingredient Cost Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Costs update automatically when ingredient prices change
            </p>
          </div>

          <div className="divide-y divide-border">
            {recipe.ingredients.map((ri, index) => {
              const percentOfTotal = recipe.totalCost 
                ? ((ri.cost || 0) / recipe.totalCost) * 100 
                : 0;
              const priceChanged = ri.ingredient && ri.ingredient.currentPrice !== ri.ingredient.previousPrice;
              const priceIncreased = ri.ingredient && ri.ingredient.currentPrice > ri.ingredient.previousPrice;

              return (
                <div key={ri.ingredientId} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {ri.ingredient?.name || "Unknown"}
                        </p>
                        {priceChanged && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                            priceIncreased 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-success/10 text-success"
                          )}>
                            {priceIncreased ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>Price updated</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ri.quantity} {ri.unit} × ${ri.ingredient?.currentPrice.toFixed(2)}/{ri.ingredient?.unit}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">${(ri.cost || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {percentOfTotal.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>

                  {/* Cost bar visualization */}
                  <div className="mt-2 ml-12">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentOfTotal}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Food Cost Calculator Modal */}
        <FoodCostCalculator
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          initialSellPrice={recipe.sellPrice}
          initialTargetPercent={recipe.targetFoodCostPercent}
          initialCost={recipe.costPerServing || 0}
        />
      </div>
    </AppLayout>
  );
};

export default RecipeDetail;
