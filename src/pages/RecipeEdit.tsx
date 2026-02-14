import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Save,
  Loader2,
  ChefHat,
  Shield,
  Settings,
  Pencil
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import RecipeBuilder from "@/components/recipes/RecipeBuilder";
import RecipeCostSettings from "@/components/recipes/RecipeCostSettings";
import RecipeSectionsManager from "@/components/recipes/RecipeSectionsManager";
import { CCPTimelineEditor } from "@/components/ccp/CCPTimelineEditor";
import { useRecipeCCPs } from "@/hooks/useRecipeCCPs";
import { useRecipeSections } from "@/hooks/useRecipeSections";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import { toast } from "sonner";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  cost_per_serving: number;
  sell_price: number;
  target_food_cost_percent: number;
  gst_percent: number;
  total_yield: number;
  yield_unit: string;
  food_cost_low_alert: number;
  food_cost_high_alert: number;
}

// CCP Section Component with its own data management
const CCPSection = ({ recipeId, hasEditPermission }: { recipeId: string; hasEditPermission: boolean }) => {
  const [haccpMode, setHaccpMode] = useState(false);
  const { ccps, addCCP, updateCCP, deleteCCP, loading } = useRecipeCCPs(recipeId);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-elevated p-5"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-elevated p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Critical Control Points</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {ccps.length} points
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="haccp-mode" className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Full HACCP
          </Label>
          <Switch
            id="haccp-mode"
            checked={haccpMode}
            onCheckedChange={setHaccpMode}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Click on the timeline to add control points. Drag points to reposition.
      </p>
      <CCPTimelineEditor
        ccps={ccps}
        onAdd={addCCP}
        onUpdate={updateCCP}
        onDelete={deleteCCP}
        haccpMode={haccpMode}
        readOnly={!hasEditPermission}
      />
    </motion.div>
  );
};

const RecipeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, canEdit } = useAuth();
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [sectionsManagerOpen, setSectionsManagerOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isUntitled = recipe?.name === "Untitled Recipe";
  
  const { sections, loading: sectionsLoading } = useRecipeSections();

  const isNewRecipe = location.pathname === "/recipes/new";
  const hasEditPermission = canEdit("recipes");

  useEffect(() => {
    if (isNewRecipe) {
      // Create a new recipe immediately
      createNewRecipe();
    } else if (id) {
      fetchRecipe();
    }
  }, [id, isNewRecipe]);

  // Auto-focus and select the name field when it's "Untitled Recipe"
  useEffect(() => {
    if (recipe?.name === "Untitled Recipe" && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [recipe?.name]);

  const createNewRecipe = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        name: "Untitled Recipe",
        category: "Mains",
        prep_time: 0,
        cook_time: 0,
        servings: 4,
        cost_per_serving: 0,
        sell_price: 0,
        target_food_cost_percent: 30,
        gst_percent: 10,
        total_yield: 4,
        yield_unit: "portions",
        food_cost_low_alert: 20,
        food_cost_high_alert: 35,
        created_by: user?.id,
        org_id: currentOrg?.id,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      toast.error("Failed to create recipe");
      navigate("/recipes");
    } else {
      // Redirect to the edit page for the new recipe
      navigate(`/recipes/${data.id}/edit`, { replace: true });
    }
    setLoading(false);
  };

  const fetchRecipe = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      toast.error("Recipe not found");
      navigate("/recipes");
    } else {
      setRecipe({
        ...data,
        sell_price: Number(data.sell_price) || 0,
        target_food_cost_percent: Number(data.target_food_cost_percent) || 30,
        gst_percent: Number(data.gst_percent) || 10,
        total_yield: Number(data.total_yield) || data.servings || 1,
        yield_unit: data.yield_unit || "portions",
        food_cost_low_alert: Number(data.food_cost_low_alert) || 20,
        food_cost_high_alert: Number(data.food_cost_high_alert) || 35,
      } as Recipe);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!recipe) return;

    setSaving(true);
    const { error } = await supabase
      .from("recipes")
      .update({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        cost_per_serving: recipe.cost_per_serving,
        sell_price: recipe.sell_price,
        target_food_cost_percent: recipe.target_food_cost_percent,
        gst_percent: recipe.gst_percent,
        total_yield: recipe.total_yield,
        yield_unit: recipe.yield_unit,
        food_cost_low_alert: recipe.food_cost_low_alert,
        food_cost_high_alert: recipe.food_cost_high_alert,
        is_public: true,
      })
      .eq("id", recipe.id);

    if (error) {
      toast.error("Failed to save recipe");
      console.error(error);
    } else {
      toast.success("Recipe saved");
    }
    setSaving(false);
  };

  const handleFieldUpdate = (field: string, value: number | string | boolean) => {
    if (!recipe) return;
    setRecipe({ ...recipe, [field]: value } as Recipe);
  };

  const handleCostUpdate = (totalCost: number, costPerPortion: number) => {
    if (!recipe) return;
    setRecipe({ ...recipe, cost_per_serving: costPerPortion } as Recipe);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!recipe) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ChefHat className="w-16 h-16 text-muted-foreground/50" />
          <p className="text-muted-foreground">Recipe not found</p>
          <Button variant="outline" onClick={() => navigate("/recipes")}>
            Back to Recipes
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
              <div className="flex-1">
                {hasEditPermission ? (
                  <Input
                    ref={nameInputRef}
                    value={recipe.name}
                    onChange={(e) => handleFieldUpdate("name", e.target.value)}
                    className={`text-2xl font-bold border-none p-0 h-auto focus-visible:ring-2 focus-visible:ring-primary ${
                      isUntitled 
                        ? "text-muted-foreground italic bg-primary/5 px-2 py-1 rounded-lg border-2 border-dashed border-primary/30 animate-pulse" 
                        : ""
                    }`}
                    placeholder="Enter recipe name..."
                  />
                ) : (
                  <h1 className="page-title font-display">{recipe.name}</h1>
                )}
                <p className="page-subtitle">{recipe.category}</p>
              </div>
              <div className="flex items-center gap-4">
                {hasEditPermission && (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Recipe
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-5"
        >
          <h3 className="font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                {hasEditPermission && (
                  <button
                    onClick={() => setSectionsManagerOpen(true)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
              <Select
                value={recipe.category}
                onValueChange={(v) => handleFieldUpdate("category", v)}
                disabled={!hasEditPermission || sectionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={sectionsLoading ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.name}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: section.color }}
                        />
                        {section.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prep Time (min)</Label>
              <Input
                type="number"
                min="0"
                value={recipe.prep_time}
                onChange={(e) => handleFieldUpdate("prep_time", parseInt(e.target.value) || 0)}
                disabled={!hasEditPermission}
              />
            </div>
            <div className="space-y-2">
              <Label>Cook Time (min)</Label>
              <Input
                type="number"
                min="0"
                value={recipe.cook_time}
                onChange={(e) => handleFieldUpdate("cook_time", parseInt(e.target.value) || 0)}
                disabled={!hasEditPermission}
              />
            </div>
            <div className="space-y-2">
              <Label>Base Servings</Label>
              <Input
                type="number"
                min="1"
                value={recipe.servings}
                onChange={(e) => handleFieldUpdate("servings", parseInt(e.target.value) || 1)}
                disabled={!hasEditPermission}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Description</Label>
            <Textarea
              value={recipe.description || ""}
              onChange={(e) => handleFieldUpdate("description", e.target.value)}
              placeholder="Brief description of the dish..."
              disabled={!hasEditPermission}
            />
          </div>
        </motion.div>

        {/* Cost Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RecipeCostSettings
            sellPrice={recipe.sell_price}
            targetFoodCostPercent={recipe.target_food_cost_percent}
            gstPercent={recipe.gst_percent}
            totalYield={recipe.total_yield}
            yieldUnit={recipe.yield_unit}
            foodCostLowAlert={recipe.food_cost_low_alert}
            foodCostHighAlert={recipe.food_cost_high_alert}
            onUpdate={handleFieldUpdate}
            disabled={!hasEditPermission}
          />
        </motion.div>

        {/* Recipe Builder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecipeBuilder
            recipeId={recipe.id}
            servings={recipe.servings}
            sellPrice={recipe.sell_price}
            targetFoodCostPercent={recipe.target_food_cost_percent}
            gstPercent={recipe.gst_percent}
            totalYield={recipe.total_yield}
            yieldUnit={recipe.yield_unit}
            foodCostLowAlert={recipe.food_cost_low_alert}
            foodCostHighAlert={recipe.food_cost_high_alert}
            onCostUpdate={handleCostUpdate}
            hasEditPermission={hasEditPermission}
          />
        </motion.div>

        {/* Critical Control Points Timeline */}
        <CCPSection 
          recipeId={recipe.id} 
          hasEditPermission={hasEditPermission}
        />

        {/* Sections Manager Dialog */}
        <RecipeSectionsManager 
          open={sectionsManagerOpen}
          onOpenChange={setSectionsManagerOpen}
        />
      </div>
    </AppLayout>
  );
};

export default RecipeEdit;
