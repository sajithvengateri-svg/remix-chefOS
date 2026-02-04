import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Filter, 
  ChefHat,
  Clock,
  DollarSign,
  Star,
  MoreVertical
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  category: string;
  cost: number;
  sellPrice: number;
  prepTime: string;
  servings: number;
  rating: number;
  image?: string;
}

const mockRecipes: Recipe[] = [
  { id: "1", name: "Pan-Seared Duck Breast", category: "Mains", cost: 8.50, sellPrice: 32, prepTime: "45 min", servings: 1, rating: 4.8 },
  { id: "2", name: "Lobster Bisque", category: "Soups", cost: 6.20, sellPrice: 18, prepTime: "1 hr", servings: 4, rating: 4.9 },
  { id: "3", name: "Caesar Salad", category: "Salads", cost: 2.80, sellPrice: 14, prepTime: "15 min", servings: 2, rating: 4.5 },
  { id: "4", name: "Crème Brûlée", category: "Desserts", cost: 2.10, sellPrice: 12, prepTime: "30 min", servings: 1, rating: 4.7 },
  { id: "5", name: "Beef Bourguignon", category: "Mains", cost: 12.40, sellPrice: 38, prepTime: "3 hrs", servings: 6, rating: 4.9 },
  { id: "6", name: "Mushroom Risotto", category: "Mains", cost: 4.50, sellPrice: 24, prepTime: "45 min", servings: 2, rating: 4.6 },
];

const categories = ["All", "Mains", "Appetizers", "Soups", "Salads", "Desserts", "Sauces"];

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateMargin = (cost: number, sellPrice: number) => {
    return (((sellPrice - cost) / sellPrice) * 100).toFixed(1);
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
            <h1 className="page-title font-display">Recipe Bank</h1>
            <p className="page-subtitle">{mockRecipes.length} recipes in your collection</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </button>
        </motion.div>

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
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card-interactive p-4 cursor-pointer"
            >
              {/* Recipe Image Placeholder */}
              <div className="aspect-video rounded-lg bg-muted mb-4 flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-muted-foreground/50" />
              </div>

              {/* Recipe Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                    <span className="text-xs text-muted-foreground">{recipe.category}</span>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="w-4 h-4 text-warning" />
                    <span>{recipe.rating}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Food Cost</p>
                    <p className="font-semibold text-foreground">${recipe.cost.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Margin</p>
                    <p className="font-semibold text-success">{calculateMargin(recipe.cost, recipe.sellPrice)}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Recipes;
