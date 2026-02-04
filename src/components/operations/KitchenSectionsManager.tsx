import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface KitchenSection {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  monthly_budget: number | null;
  current_month_cost: number | null;
}

interface KitchenSectionsManagerProps {
  hasEditPermission: boolean;
}

const defaultColors = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6B7280", // gray
];

const KitchenSectionsManager = ({ hasEditPermission }: KitchenSectionsManagerProps) => {
  const [sections, setSections] = useState<KitchenSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<KitchenSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<KitchenSection | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6B7280",
    is_active: true,
    monthly_budget: 0,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kitchen_sections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load kitchen sections");
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    if (editingSection) {
      const { error } = await supabase
        .from("kitchen_sections")
        .update({
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          is_active: formData.is_active,
          monthly_budget: formData.monthly_budget,
        })
        .eq("id", editingSection.id);

      if (error) {
        toast.error("Failed to update section");
        console.error(error);
        return;
      }
      toast.success("Section updated");
    } else {
      const maxOrder = sections.reduce((max, s) => Math.max(max, s.sort_order || 0), 0);
      const { error } = await supabase.from("kitchen_sections").insert({
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
        is_active: formData.is_active,
        monthly_budget: formData.monthly_budget,
        sort_order: maxOrder + 1,
      });

      if (error) {
        toast.error("Failed to create section");
        console.error(error);
        return;
      }
      toast.success("Section created");
    }

    resetForm();
    fetchSections();
  };

  const handleDelete = async () => {
    if (!deletingSection) return;

    const { error } = await supabase
      .from("kitchen_sections")
      .delete()
      .eq("id", deletingSection.id);

    if (error) {
      toast.error("Failed to delete section");
      console.error(error);
      return;
    }

    toast.success("Section deleted");
    setDeleteDialogOpen(false);
    setDeletingSection(null);
    fetchSections();
  };

  const openEditDialog = (section: KitchenSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      description: section.description || "",
      color: section.color || "#6B7280",
      is_active: section.is_active ?? true,
      monthly_budget: section.monthly_budget || 0,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingSection(null);
    setFormData({
      name: "",
      description: "",
      color: "#6B7280",
      is_active: true,
      monthly_budget: 0,
    });
  };

  const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getBudgetStatus = (section: KitchenSection) => {
    if (!section.monthly_budget || section.monthly_budget === 0) return null;
    const spent = section.current_month_cost || 0;
    const percentage = (spent / section.monthly_budget) * 100;
    
    if (percentage >= 100) return { status: "over", color: "text-destructive", bg: "bg-destructive/10" };
    if (percentage >= 80) return { status: "warning", color: "text-warning", bg: "bg-warning/10" };
    return { status: "ok", color: "text-success", bg: "bg-success/10" };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kitchen Sections</h3>
          <p className="text-sm text-muted-foreground">Manage your kitchen areas and track section costs</p>
        </div>
        {hasEditPermission && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        )}
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <GripVertical className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-1">No kitchen sections</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create sections like Grill, Pastry, Garde Manger, etc.
          </p>
          {hasEditPermission && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Section
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {sections.map((section) => {
            const budgetStatus = getBudgetStatus(section);
            
            return (
              <div
                key={section.id}
                className={cn(
                  "card-elevated p-4 flex items-center gap-4",
                  !section.is_active && "opacity-50"
                )}
              >
                {/* Color indicator */}
                <div
                  className="w-3 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: section.color || "#6B7280" }}
                />

                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{section.name}</h4>
                    {!section.is_active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground truncate">{section.description}</p>
                  )}
                </div>

                {/* Budget info */}
                {section.monthly_budget && section.monthly_budget > 0 ? (
                  <div className={cn("text-right px-3 py-2 rounded-lg", budgetStatus?.bg)}>
                    <p className={cn("text-sm font-medium", budgetStatus?.color)}>
                      {formatCurrency(section.current_month_cost)} / {formatCurrency(section.monthly_budget)}
                    </p>
                    <p className="text-xs text-muted-foreground">Monthly Budget</p>
                  </div>
                ) : (
                  <div className="text-right text-muted-foreground">
                    <DollarSign className="w-5 h-5 opacity-30" />
                  </div>
                )}

                {/* Actions */}
                {hasEditPermission && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(section)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingSection(section);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "New Kitchen Section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Section Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grill Station"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.color === color ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="budget"
                  type="number"
                  value={formData.monthly_budget}
                  onChange={(e) => setFormData({ ...formData, monthly_budget: Number(e.target.value) })}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">Set to 0 to disable budget tracking</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive sections are hidden from prep lists</p>
              </div>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingSection ? "Save Changes" : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{deletingSection?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitchenSectionsManager;
