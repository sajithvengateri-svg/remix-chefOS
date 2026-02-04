import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Package,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  supplier: string | null;
  allergens: string[];
  par_level: number;
  current_stock: number;
  notes: string | null;
}

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Oils", "Beverages", "Prepared"];
const units = ["kg", "g", "L", "ml", "lb", "oz", "each", "bunch", "case"];

const Ingredients = () => {
  const { canEdit } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Produce",
    unit: "kg",
    cost_per_unit: 0,
    supplier: "",
    par_level: 0,
    current_stock: 0,
    notes: "",
  });

  const hasEditPermission = canEdit("ingredients");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching ingredients:", error);
      toast.error("Failed to load ingredients");
    } else {
      setIngredients(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Ingredient name is required");
      return;
    }

    if (editingIngredient) {
      const { error } = await supabase
        .from("ingredients")
        .update({
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          cost_per_unit: formData.cost_per_unit,
          supplier: formData.supplier || null,
          par_level: formData.par_level,
          current_stock: formData.current_stock,
          notes: formData.notes || null,
        })
        .eq("id", editingIngredient.id);

      if (error) {
        toast.error("Failed to update ingredient");
        console.error(error);
        return;
      }
      toast.success("Ingredient updated");
    } else {
      const { error } = await supabase.from("ingredients").insert({
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        cost_per_unit: formData.cost_per_unit,
        supplier: formData.supplier || null,
        par_level: formData.par_level,
        current_stock: formData.current_stock,
        notes: formData.notes || null,
      });

      if (error) {
        toast.error("Failed to create ingredient");
        console.error(error);
        return;
      }
      toast.success("Ingredient created");
    }

    resetForm();
    fetchIngredients();
  };

  const handleDelete = async () => {
    if (!deletingIngredient) return;

    const { error } = await supabase
      .from("ingredients")
      .delete()
      .eq("id", deletingIngredient.id);

    if (error) {
      toast.error("Failed to delete ingredient");
      console.error(error);
      return;
    }

    toast.success("Ingredient deleted");
    setDeleteDialogOpen(false);
    setDeletingIngredient(null);
    fetchIngredients();
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      cost_per_unit: Number(ingredient.cost_per_unit),
      supplier: ingredient.supplier || "",
      par_level: Number(ingredient.par_level),
      current_stock: Number(ingredient.current_stock),
      notes: ingredient.notes || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingIngredient(null);
    setFormData({
      name: "",
      category: "Produce",
      unit: "kg",
      cost_per_unit: 0,
      supplier: "",
      par_level: 0,
      current_stock: 0,
      notes: "",
    });
  };

  const filteredItems = ingredients.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (current: number, par: number) => {
    if (par === 0) return "ok";
    const ratio = current / par;
    if (ratio <= 0.25) return "critical";
    if (ratio <= 0.5) return "low";
    return "ok";
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
            <p className="page-subtitle">Manage your ingredient library</p>
          </div>
          {hasEditPermission && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          )}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredItems.map((ingredient, index) => {
              const stockStatus = getStockStatus(Number(ingredient.current_stock), Number(ingredient.par_level));
              
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {ingredient.category}
                      </span>
                      {hasEditPermission && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditDialog(ingredient)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingIngredient(ingredient);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{ingredient.name}</h3>
                  
                  <div className="pt-3 border-t border-border mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Price per {ingredient.unit}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        stockStatus === "critical" && "bg-destructive/10 text-destructive",
                        stockStatus === "low" && "bg-warning/10 text-warning",
                        stockStatus === "ok" && "bg-success/10 text-success"
                      )}>
                        {stockStatus === "critical" ? "Critical" : stockStatus === "low" ? "Low" : "In Stock"}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      ${Number(ingredient.cost_per_unit).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                    <span>Stock: {Number(ingredient.current_stock).toFixed(1)} {ingredient.unit}</span>
                    <span>Par: {Number(ingredient.par_level).toFixed(1)} {ingredient.unit}</span>
                  </div>

                  {ingredient.supplier && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Supplier: {ingredient.supplier}
                    </p>
                  )}
                </motion.div>
              );
            })}

            {filteredItems.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No ingredients found</p>
                {hasEditPermission && (
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Ingredient
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingIngredient ? "Edit Ingredient" : "New Ingredient"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ingredient Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Salmon"
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
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost/Unit ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="par">Par Level</Label>
                  <Input
                    id="par"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.par_level}
                    onChange={(e) => setFormData({ ...formData, par_level: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g., Fresh Farms Co."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingIngredient ? "Save Changes" : "Add Ingredient"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Ingredient</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deletingIngredient?.name}"? This action cannot be undone.
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

export default Ingredients;
