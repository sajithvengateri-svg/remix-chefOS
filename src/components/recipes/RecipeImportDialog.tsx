import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileImage,
  FileText,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Camera,
  File,
  ChefHat,
  Edit3,
  Plus,
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  matched_ingredient_id?: string;
  matched_ingredient_name?: string;
  estimated_cost?: number;
}

interface ExtractedRecipe {
  name: string;
  description: string;
  category: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  ingredients: ExtractedIngredient[];
  instructions: string[];
  allergens: string[];
}

interface RecipeImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipeId: string) => void;
}

const categories = ["Mains", "Appetizers", "Soups", "Salads", "Desserts", "Sauces"];
const units = ["g", "kg", "ml", "L", "each", "lb", "oz", "bunch", "tbsp", "tsp", "cup"];

type ImportStep = "upload" | "processing" | "review" | "saving";

const RecipeImportDialog = ({ isOpen, onClose, onImport }: RecipeImportDialogProps) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "image/jpeg", "image/png", "image/webp", "image/heic",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|pdf|doc|docx|txt)$/i)) {
      setError("Unsupported file type. Please use images, PDFs, Word docs, or text files.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setStep("processing");
    setError(null);

    try {
      // Fetch existing ingredients for matching
      const { data: ingredients } = await supabase
        .from("ingredients")
        .select("id, name, unit, cost_per_unit");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("ingredients", JSON.stringify(ingredients || []));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-recipe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract recipe");
      }

      const result = await response.json();
      
      if (result.success && result.recipe) {
        setExtractedRecipe(result.recipe);
        setStep("review");
      } else {
        throw new Error("No recipe data extracted");
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process file");
      setStep("upload");
    }
  };

  const updateRecipeField = (field: keyof ExtractedRecipe, value: unknown) => {
    if (extractedRecipe) {
      setExtractedRecipe({ ...extractedRecipe, [field]: value });
    }
  };

  const updateIngredient = (index: number, field: keyof ExtractedIngredient, value: unknown) => {
    if (extractedRecipe) {
      const newIngredients = [...extractedRecipe.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      setExtractedRecipe({ ...extractedRecipe, ingredients: newIngredients });
    }
  };

  const removeIngredient = (index: number) => {
    if (extractedRecipe) {
      const newIngredients = extractedRecipe.ingredients.filter((_, i) => i !== index);
      setExtractedRecipe({ ...extractedRecipe, ingredients: newIngredients });
    }
  };

  const addIngredient = () => {
    if (extractedRecipe) {
      setExtractedRecipe({
        ...extractedRecipe,
        ingredients: [...extractedRecipe.ingredients, { name: "", quantity: 0, unit: "g" }]
      });
    }
  };

  const updateInstruction = (index: number, value: string) => {
    if (extractedRecipe) {
      const newInstructions = [...extractedRecipe.instructions];
      newInstructions[index] = value;
      setExtractedRecipe({ ...extractedRecipe, instructions: newInstructions });
    }
  };

  const removeInstruction = (index: number) => {
    if (extractedRecipe) {
      const newInstructions = extractedRecipe.instructions.filter((_, i) => i !== index);
      setExtractedRecipe({ ...extractedRecipe, instructions: newInstructions });
    }
  };

  const addInstruction = () => {
    if (extractedRecipe) {
      setExtractedRecipe({
        ...extractedRecipe,
        instructions: [...extractedRecipe.instructions, ""]
      });
    }
  };

  const saveRecipe = async () => {
    if (!extractedRecipe) return;

    setStep("saving");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          name: extractedRecipe.name,
          description: extractedRecipe.description,
          category: extractedRecipe.category,
          servings: extractedRecipe.servings,
          prep_time: extractedRecipe.prep_time,
          cook_time: extractedRecipe.cook_time,
          instructions: extractedRecipe.instructions,
          allergens: extractedRecipe.allergens,
          created_by: user?.id,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert matched ingredients into recipe_ingredients
      const matchedIngredients = extractedRecipe.ingredients
        .filter(ing => ing.matched_ingredient_id)
        .map(ing => ({
          recipe_id: recipe.id,
          ingredient_id: ing.matched_ingredient_id!,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.name !== ing.matched_ingredient_name ? `Original: ${ing.name}` : null,
        }));

      if (matchedIngredients.length > 0) {
        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(matchedIngredients);

        if (ingError) {
          console.error("Error adding ingredients:", ingError);
        }
      }

      toast.success("Recipe imported successfully!");
      onImport(recipe.id);
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save recipe");
      setStep("review");
    }
  };

  const handleClose = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedRecipe(null);
    setError(null);
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <FileImage className="w-8 h-8" />;
    if (file.type === "application/pdf") return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Recipe
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  selectedFile && "border-success bg-success/5"
                )}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Recipe preview"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-3 text-muted-foreground">
                        {getFileIcon(selectedFile)}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-success" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="p-1 rounded-full hover:bg-muted"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <div className="p-4 rounded-full bg-muted">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="p-4 rounded-full bg-muted">
                        <FileImage className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="p-4 rounded-full bg-muted">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        Drop your recipe file here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Photos, scans, PDFs, or Word documents
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <FileImage className="w-4 h-4 mr-2" />
                            Browse Files
                          </span>
                        </Button>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={processFile} disabled={!selectedFile}>
                  <ChefHat className="w-4 h-4 mr-2" />
                  Extract Recipe
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 text-center space-y-4"
            >
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <div>
                <p className="text-lg font-medium">Extracting recipe data...</p>
                <p className="text-sm text-muted-foreground">
                  AI is reading your recipe and matching ingredients
                </p>
              </div>
            </motion.div>
          )}

          {/* Review Step */}
          {step === "review" && extractedRecipe && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-4">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Basic Information
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Recipe Name</Label>
                        <Input
                          value={extractedRecipe.name}
                          onChange={(e) => updateRecipeField("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={extractedRecipe.description}
                          onChange={(e) => updateRecipeField("description", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={extractedRecipe.category}
                            onValueChange={(v) => updateRecipeField("category", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Servings</Label>
                          <Input
                            type="number"
                            min="1"
                            value={extractedRecipe.servings}
                            onChange={(e) => updateRecipeField("servings", parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prep (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={extractedRecipe.prep_time}
                            onChange={(e) => updateRecipeField("prep_time", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cook (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={extractedRecipe.cook_time}
                            onChange={(e) => updateRecipeField("cook_time", parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Ingredients ({extractedRecipe.ingredients.length})</h3>
                      <Button variant="outline" size="sm" onClick={addIngredient}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {extractedRecipe.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg",
                            ing.matched_ingredient_id ? "bg-success/10" : "bg-muted/50"
                          )}
                        >
                          <Input
                            value={ing.name}
                            onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                            placeholder="Ingredient name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={ing.quantity}
                            onChange={(e) => updateIngredient(idx, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                          <Select
                            value={ing.unit}
                            onValueChange={(v) => updateIngredient(idx, "unit", v)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(u => (
                                <SelectItem key={u} value={u}>{u}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {ing.matched_ingredient_name && (
                            <span className="text-xs text-success whitespace-nowrap">
                              ✓ {ing.matched_ingredient_name}
                            </span>
                          )}
                          <button
                            onClick={() => removeIngredient(idx)}
                            className="p-1 rounded hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Instructions ({extractedRecipe.instructions.length} steps)</h3>
                      <Button variant="outline" size="sm" onClick={addInstruction}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {extractedRecipe.instructions.map((instruction, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-2">
                            {idx + 1}
                          </span>
                          <Textarea
                            value={instruction}
                            onChange={(e) => updateInstruction(idx, e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <button
                            onClick={() => removeInstruction(idx)}
                            className="p-1 rounded hover:bg-destructive/10 mt-2"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allergens */}
                  {extractedRecipe.allergens.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Detected Allergens</h3>
                      <div className="flex flex-wrap gap-2">
                        {extractedRecipe.allergens.map((allergen, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mt-4">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Back
                </Button>
                <Button onClick={saveRecipe}>
                  <Check className="w-4 h-4 mr-2" />
                  Import Recipe
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Saving Step */}
          {step === "saving" && (
            <motion.div
              key="saving"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 text-center space-y-4"
            >
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Saving recipe...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeImportDialog;
