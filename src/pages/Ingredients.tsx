import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  supplier: string;
  usedInRecipes: number;
}

const mockIngredients: Ingredient[] = [
  { id: "1", name: "All-Purpose Flour", category: "Dry Goods", unit: "lb", currentPrice: 0.45, previousPrice: 0.42, supplier: "Sysco", usedInRecipes: 12 },
  { id: "2", name: "Butter (Unsalted)", category: "Dairy", unit: "lb", currentPrice: 4.50, previousPrice: 4.25, supplier: "US Foods", usedInRecipes: 24 },
  { id: "3", name: "Heavy Cream", category: "Dairy", unit: "qt", currentPrice: 3.25, previousPrice: 3.25, supplier: "Local Dairy", usedInRecipes: 18 },
  { id: "4", name: "Fresh Salmon", category: "Proteins", unit: "lb", currentPrice: 12.99, previousPrice: 14.50, supplier: "Fish Market", usedInRecipes: 5 },
  { id: "5", name: "Olive Oil (EVOO)", category: "Oils", unit: "L", currentPrice: 15.00, previousPrice: 14.00, supplier: "Sysco", usedInRecipes: 32 },
  { id: "6", name: "Shallots", category: "Produce", unit: "lb", currentPrice: 3.00, previousPrice: 2.75, supplier: "Local Farm", usedInRecipes: 15 },
  { id: "7", name: "Duck Breast", category: "Proteins", unit: "lb", currentPrice: 18.50, previousPrice: 17.00, supplier: "D'Artagnan", usedInRecipes: 3 },
  { id: "8", name: "White Wine (Cooking)", category: "Beverages", unit: "btl", currentPrice: 8.00, previousPrice: 8.00, supplier: "Wine Depot", usedInRecipes: 8 },
];

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Oils", "Beverages"];

const Ingredients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = mockIngredients.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change;
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
            <p className="page-subtitle">Manage your ingredient database and pricing</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
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
            
            return (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="card-interactive p-4 cursor-pointer"
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
                <p className="text-sm text-muted-foreground mb-4">
                  Used in {ingredient.usedInRecipes} recipes
                </p>

                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price per {ingredient.unit}</p>
                    <p className="text-xl font-bold text-foreground">
                      ${ingredient.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    priceChange > 0 && "text-destructive",
                    priceChange < 0 && "text-success",
                    priceChange === 0 && "text-muted-foreground"
                  )}>
                    {priceChange > 0 && <TrendingUp className="w-4 h-4" />}
                    {priceChange < 0 && <TrendingDown className="w-4 h-4" />}
                    {priceChange !== 0 && (
                      <span>{priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%</span>
                    )}
                    {priceChange === 0 && <span>No change</span>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Supplier: {ingredient.supplier}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Ingredients;
