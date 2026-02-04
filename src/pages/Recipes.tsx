import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Filter, 
  ChefHat,
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  MoreVertical
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import FoodCostCalculator from "@/components/costing/FoodCostCalculator";
import { useCostingStore } from "@/stores/costingStore";
import { cn } from "@/lib/utils";

const categories = ["All", "Mains", "Appetizers", "Soups", "Salads", "Desserts", "Sauces"];

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCalculator, setShowCalculator] = useState(false);

  const { recipes, getRecipeWithCosts } = useCostingStore();

  // Get all recipes with calculated costs
  const recipesWithCosts = recipes.map(r => getRecipeWithCosts(r.id)).filter(Boolean);

  const filteredRecipes = recipesWithCosts.filter(recipe => {
    if (!recipe) return false;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const overBudgetCount = recipesWithCosts.filter(r => r?.isOverBudget).length;

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
            <h1 className="page-title font-display">Recipe Bank</h1>
            <p className="page-subtitle">{recipes.length} recipes in your collection</p>
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
              <Plus className="w-4 h-4 mr-2" />
              New Recipe
            </button>
          </div>
        </motion.div>

        {/* Over Budget Alert */}
        {overBudgetCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4 border-l-4 border-l-warning"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {overBudgetCount} recipe{overBudgetCount > 1 ? "s" : ""} over target food cost
                </p>
                <p className="text-sm text-muted-foreground">
                  Review pricing or ingredient costs to improve margins
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
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
        </motion.div>

        {/* Recipe Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredRecipes.map((recipe, index) => {
            if (!recipe) return null;
            
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="card-interactive p-4 cursor-pointer block"
                >
                  {/* Recipe Image Placeholder */}
                  <div className="aspect-video rounded-lg bg-muted mb-4 flex items-center justify-center relative overflow-hidden">
                    <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                    {recipe.isOverBudget && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/90">
                        <AlertTriangle className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                        <span className="text-xs text-muted-foreground">{recipe.category}</span>
                      </div>
                      <button 
                        onClick={(e) => e.preventDefault()}
                        className="p-1 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prepTime}</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                        recipe.isOverBudget 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-success/10 text-success"
                      )}>
                        {recipe.isOverBudget ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        <span>{recipe.actualFoodCostPercent?.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Food Cost</p>
                        <p className="font-semibold text-foreground">
                          ${recipe.costPerServing?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Sell Price</p>
                        <p className="font-semibold text-foreground">
                          ${recipe.sellPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className="font-semibold text-success">
                          ${recipe.margin?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Food Cost Calculator Modal */}
        <FoodCostCalculator
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
        />
      </div>
    </AppLayout>
  );
};

export default Recipes;
