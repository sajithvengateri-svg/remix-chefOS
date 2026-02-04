import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Package,
  Edit,
  ChefHat,
  AlertTriangle
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PriceUpdateAlert from "@/components/costing/PriceUpdateAlert";
import { useCostingStore } from "@/stores/costingStore";
import { RecipeCostImpact } from "@/types/costing";
import { cn } from "@/lib/utils";

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Oils", "Beverages", "Prepared"];

const Ingredients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    ingredientId: string;
    ingredientName: string;
    oldPrice: number;
    newPrice: number;
    impacts: RecipeCostImpact[];
  } | null>(null);

  const { ingredients, getAffectedRecipes, updateIngredientPrice, getRecipeWithCosts } = useCostingStore();

  const filteredItems = ingredients.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriceChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handlePriceEdit = (ingredientId: string, currentPrice: number) => {
    setEditingId(ingredientId);
    setNewPrice(currentPrice);
  };

  const handlePriceUpdate = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient || newPrice === ingredient.currentPrice) {
      setEditingId(null);
      return;
    }

    // Calculate impacts before updating
    const affectedRecipes = getAffectedRecipes(ingredientId);
    const impacts: RecipeCostImpact[] = affectedRecipes.map(recipe => {
      const enrichedRecipe = getRecipeWithCosts(recipe.id);
      if (!enrichedRecipe) return null;
      
      const oldCost = enrichedRecipe.costPerServing || 0;
      
      // Calculate new cost with updated price
      const newCost = recipe.ingredients.reduce((total, ri) => {
        const ing = ingredients.find(i => i.id === ri.ingredientId);
        if (!ing) return total;
        const price = ri.ingredientId === ingredientId ? newPrice : ing.currentPrice;
        return total + (price * ri.quantity);
      }, 0) / recipe.servings;

      const oldFoodCostPercent = (oldCost / recipe.sellPrice) * 100;
      const newFoodCostPercent = (newCost / recipe.sellPrice) * 100;

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        oldCost,
        newCost,
        costChange: newCost - oldCost,
        costChangePercent: oldCost > 0 ? ((newCost - oldCost) / oldCost) * 100 : 0,
        oldFoodCostPercent,
        newFoodCostPercent,
        isNowOverBudget: newFoodCostPercent > recipe.targetFoodCostPercent,
      };
    }).filter(Boolean) as RecipeCostImpact[];

    if (impacts.length > 0) {
      setPendingUpdate({
        ingredientId,
        ingredientName: ingredient.name,
        oldPrice: ingredient.currentPrice,
        newPrice,
        impacts,
      });
      setShowAlert(true);
    } else {
      // No recipes affected, update directly
      updateIngredientPrice(ingredientId, newPrice, 'manual');
      setEditingId(null);
    }
  };

  const confirmPriceUpdate = () => {
    if (pendingUpdate) {
      updateIngredientPrice(pendingUpdate.ingredientId, pendingUpdate.newPrice, 'manual');
      setEditingId(null);
      setPendingUpdate(null);
    }
  };

  // Count how many recipes would be affected
  const getRecipeCount = (ingredientId: string) => {
    return getAffectedRecipes(ingredientId).length;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Ingredients</h1>
            <p className="page-subtitle">Manage pricing — recipe costs update automatically</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 bg-primary/5 border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-foreground">
              <span className="font-medium">Auto-sync enabled:</span> When you update an ingredient price, 
              all linked recipe costs recalculate automatically.
            </p>
          </div>
        </motion.div>

        {/* Search and Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Ingredients Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredItems.map((ingredient, index) => {
            const priceChange = getPriceChange(ingredient.currentPrice, ingredient.previousPrice);
            const recipeCount = getRecipeCount(ingredient.id);
            const isEditing = editingId === ingredient.id;
            
            return (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="card-elevated p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {ingredient.category}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{ingredient.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Used in {recipeCount} recipe{recipeCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Price per {ingredient.unit}</p>
                    {priceChange !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        priceChange > 0 ? "text-destructive" : "text-success"
                      )}>
                        {priceChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                          className="input-field pl-7 py-2 text-lg font-bold"
                          step="0.01"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handlePriceUpdate(ingredient.id)}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-foreground">
                        ${ingredient.currentPrice.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handlePriceEdit(ingredient.id, ingredient.currentPrice)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm font-medium"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Update
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Supplier: {ingredient.supplier}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Price Update Alert Modal */}
        {pendingUpdate && (
          <PriceUpdateAlert
            isOpen={showAlert}
            onClose={() => {
              setShowAlert(false);
              setEditingId(null);
              setPendingUpdate(null);
            }}
            ingredientName={pendingUpdate.ingredientName}
            oldPrice={pendingUpdate.oldPrice}
            newPrice={pendingUpdate.newPrice}
            impacts={pendingUpdate.impacts}
            onConfirm={confirmPriceUpdate}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Ingredients;
