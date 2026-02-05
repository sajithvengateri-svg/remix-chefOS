import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Filter, 
  ChefHat,
  Calculator,
  Loader2,
  Upload,
  Beaker,
  Layers
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import FoodCostCalculator from "@/components/costing/FoodCostCalculator";
import RecipeImportDialog from "@/components/recipes/RecipeImportDialog";
import BulkRecipeImportDialog from "@/components/recipes/BulkRecipeImportDialog";
import RecipeCard from "@/components/recipes/RecipeCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: unknown;
  instructions: unknown;
  allergens: string[] | null;
  cost_per_serving: number;
  sell_price: number | null;
  image_url: string | null;
  tasting_notes: string | null;
  is_batch_recipe: boolean;
  target_food_cost_percent: number | null;
  created_at: string;
}

const categories = ["All", "Mains", "Appetizers", "Soups", "Salads", "Desserts", "Sauces", "Batch Recipes"];

const Recipes = () => {
  const navigate = useNavigate();
  const { user, canEdit } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Mains",
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    cost_per_serving: 0,
    tasting_notes: "",
    is_batch_recipe: false,
  });

  const hasEditPermission = canEdit("recipes");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes");
    } else {
      setRecipes(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Recipe name is required");
      return;
    }

    if (editingRecipe) {
      const { error } = await supabase
        .from("recipes")
        .update({
          name: formData.name,
          description: formData.description || null,
          category: formData.is_batch_recipe ? "Sauces" : formData.category,
          prep_time: formData.prep_time,
          cook_time: formData.cook_time,
          servings: formData.servings,
          cost_per_serving: formData.cost_per_serving,
          tasting_notes: formData.tasting_notes || null,
          is_batch_recipe: formData.is_batch_recipe,
        })
        .eq("id", editingRecipe.id);

      if (error) {
        toast.error("Failed to update recipe");
        console.error(error);
        return;
      }
      toast.success("Recipe updated");
    } else {
      const { error } = await supabase.from("recipes").insert({
        name: formData.name,
        description: formData.description || null,
        category: formData.is_batch_recipe ? "Sauces" : formData.category,
        prep_time: formData.prep_time,
        cook_time: formData.cook_time,
        servings: formData.servings,
        cost_per_serving: formData.cost_per_serving,
        tasting_notes: formData.tasting_notes || null,
        is_batch_recipe: formData.is_batch_recipe,
        created_by: user?.id,
      });

      if (error) {
        toast.error("Failed to create recipe");
        console.error(error);
        return;
      }
      toast.success("Recipe created");
    }

    resetForm();
    fetchRecipes();
  };

  const handleDelete = async () => {
    if (!deletingRecipe) return;

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", deletingRecipe.id);

    if (error) {
      toast.error("Failed to delete recipe");
      console.error(error);
      return;
    }

    toast.success("Recipe deleted");
    setDeleteDialogOpen(false);
    setDeletingRecipe(null);
    fetchRecipes();
  };

  const openEditDialog = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || "",
      category: recipe.category,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      cost_per_serving: Number(recipe.cost_per_serving),
      tasting_notes: recipe.tasting_notes || "",
      is_batch_recipe: recipe.is_batch_recipe || false,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingRecipe(null);
    setFormData({
      name: "",
      description: "",
      category: "Mains",
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      cost_per_serving: 0,
      tasting_notes: "",
      is_batch_recipe: false,
    });
  };

  const handleImageUpdate = (recipeId: string, imageUrl: string) => {
    setRecipes(prev => prev.map(r => 
      r.id === recipeId ? { ...r, image_url: imageUrl } : r
    ));
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      recipe.category === selectedCategory ||
      (selectedCategory === "Batch Recipes" && recipe.is_batch_recipe);
    return matchesSearch && matchesCategory;
  });

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
            {hasEditPermission && (
              <>
                <div className="flex gap-1">
                  <Button variant="outline" onClick={() => setShowImport(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Import</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShowBulkImport(true)} title="Bulk Import">
                    <Layers className="w-4 h-4" />
                  </Button>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Recipe
                </Button>
              </>
            )}
          </div>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
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
                transition={{ delay: Math.min(0.1 * index, 0.5) }}
              >
                <RecipeCard
                  recipe={recipe}
                  hasEditPermission={hasEditPermission}
                  onEdit={() => openEditDialog(recipe)}
                  onDelete={() => {
                    setDeletingRecipe(recipe);
                    setDeleteDialogOpen(true);
                  }}
                  onImageUpdate={handleImageUpdate}
                />
              </motion.div>
            ))}

            {filteredRecipes.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center">
                <ChefHat className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No recipes found</p>
                {hasEditPermission && (
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Recipe
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Food Cost Calculator Modal */}
        <FoodCostCalculator
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
        />

        {/* Recipe Import Dialog */}
        <RecipeImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onImport={(recipeId) => {
            fetchRecipes();
            navigate(`/recipes/${recipeId}/edit`);
          }}
        />

        {/* Bulk Recipe Import Dialog */}
        <BulkRecipeImportDialog
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onImportComplete={(recipeIds) => {
            fetchRecipes();
            toast.success(`${recipeIds.length} recipes imported!`);
          }}
        />

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? "Edit Recipe" : "New Recipe"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grilled Salmon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the dish..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Prep (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="0"
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook_time">Cook (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    min="0"
                    value={formData.cook_time}
                    onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost/Serving</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_per_serving}
                    onChange={(e) => setFormData({ ...formData, cost_per_serving: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasting_notes">Tasting Notes</Label>
                <Textarea
                  id="tasting_notes"
                  value={formData.tasting_notes}
                  onChange={(e) => setFormData({ ...formData, tasting_notes: e.target.value })}
                  placeholder="Flavor profile, texture, recommended pairings..."
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="is_batch">Batch Recipe</Label>
                  <p className="text-xs text-muted-foreground">Mark this as a batch/prep recipe that can be used as an ingredient</p>
                </div>
                <Switch
                  id="is_batch"
                  checked={formData.is_batch_recipe}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_batch_recipe: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingRecipe ? "Save Changes" : "Create Recipe"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recipe</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deletingRecipe?.name}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Recipes;
