import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Thermometer,
  Flame,
  Clock,
  Droplets,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Cheatsheet {
  id: string;
  title: string;
  category: string;
  content: string;
  image_url: string | null;
}

// Built-in temperature charts (read-only)
const sousVideCharts = [
  { item: "Beef Steak (Rare)", temp: "52°C / 126°F", time: "1-2 hrs", notes: "Tender, ruby red center" },
  { item: "Beef Steak (Medium-Rare)", temp: "54°C / 130°F", time: "1-2 hrs", notes: "Most popular doneness" },
  { item: "Beef Steak (Medium)", temp: "57°C / 135°F", time: "1-2 hrs", notes: "Pink center" },
  { item: "Pork Chops", temp: "58°C / 136°F", time: "1-2 hrs", notes: "Juicy and tender" },
  { item: "Chicken Breast", temp: "63°C / 146°F", time: "1-2 hrs", notes: "Juicy, not rubbery" },
  { item: "Salmon", temp: "52°C / 126°F", time: "30-45 min", notes: "Silky texture" },
  { item: "Eggs (Soft)", temp: "63°C / 145°F", time: "45-60 min", notes: "Runny yolk, set white" },
];

const ovenCharts = [
  { item: "Prime Rib Roast", temp: "120°C / 250°F", time: "3-4 hrs", notes: "Low and slow" },
  { item: "Whole Chicken", temp: "180°C / 350°F", time: "1-1.5 hrs", notes: "Until 74°C internal" },
  { item: "Lamb Leg", temp: "160°C / 325°F", time: "2-3 hrs", notes: "Medium: 63°C internal" },
  { item: "Pork Belly", temp: "220°C / 425°F", time: "30 min + 90 min at 160°C", notes: "Start high for skin" },
  { item: "Roasted Vegetables", temp: "200°C / 400°F", time: "30-45 min", notes: "High heat caramelization" },
];

const steamCharts = [
  { item: "Asparagus", temp: "100°C / 212°F", time: "2-4 min", notes: "Tender-crisp" },
  { item: "Broccoli Florets", temp: "100°C / 212°F", time: "3-4 min", notes: "Vibrant color" },
  { item: "Green Beans", temp: "100°C / 212°F", time: "4-5 min", notes: "Snap when bent" },
  { item: "Fish Fillet", temp: "100°C / 212°F", time: "6-8 min", notes: "Flakes easily" },
  { item: "Dim Sum", temp: "100°C / 212°F", time: "8-12 min", notes: "Wrapper translucent" },
];

const categoryOptions = ["Sous Vide", "Oven", "Steam", "Sauces", "Prep", "General"];

const CookingCheatsheets = () => {
  const { canEdit } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cheatsheets, setCheatsheets] = useState<Cheatsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Cheatsheet | null>(null);
  const [deletingSheet, setDeletingSheet] = useState<Cheatsheet | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    content: "",
  });

  const hasEditPermission = canEdit("cheatsheets");

  useEffect(() => {
    fetchCheatsheets();
  }, []);

  const fetchCheatsheets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cheatsheets")
      .select("*")
      .order("category")
      .order("title");

    if (error) {
      console.error("Error fetching cheatsheets:", error);
    } else {
      setCheatsheets(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    if (editingSheet) {
      const { error } = await supabase
        .from("cheatsheets")
        .update({
          title: formData.title,
          category: formData.category,
          content: formData.content,
        })
        .eq("id", editingSheet.id);

      if (error) {
        toast.error("Failed to update cheatsheet");
        return;
      }
      toast.success("Cheatsheet updated");
    } else {
      const { error } = await supabase.from("cheatsheets").insert({
        title: formData.title,
        category: formData.category,
        content: formData.content,
      });

      if (error) {
        toast.error("Failed to create cheatsheet");
        return;
      }
      toast.success("Cheatsheet created");
    }

    resetForm();
    fetchCheatsheets();
  };

  const handleDelete = async () => {
    if (!deletingSheet) return;

    const { error } = await supabase.from("cheatsheets").delete().eq("id", deletingSheet.id);

    if (error) {
      toast.error("Failed to delete cheatsheet");
      return;
    }

    toast.success("Cheatsheet deleted");
    setDeleteDialogOpen(false);
    setDeletingSheet(null);
    fetchCheatsheets();
  };

  const openEditDialog = (sheet: Cheatsheet) => {
    setEditingSheet(sheet);
    setFormData({
      title: sheet.title,
      category: sheet.category,
      content: sheet.content,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingSheet(null);
    setFormData({
      title: "",
      category: "General",
      content: "",
    });
  };

  const filterCharts = <T extends { item?: string; notes?: string; title?: string }>(charts: T[]) => {
    if (!searchQuery) return charts;
    return charts.filter(c => 
      c.item?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ChartTable = ({ data, icon: Icon, color }: { data: { item: string; temp: string; time: string; notes?: string }[]; icon: typeof Thermometer; color: string }) => {
    const filtered = filterCharts(data);
    
    return (
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Temperature</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", color)} />
                      <span className="font-medium">{row.item}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{row.temp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{row.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{row.notes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No items match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Group custom cheatsheets by category
  const customByCategory = cheatsheets.reduce((acc, sheet) => {
    if (!acc[sheet.category]) acc[sheet.category] = [];
    acc[sheet.category].push(sheet);
    return acc;
  }, {} as Record<string, Cheatsheet[]>);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Cooking Cheatsheets</h1>
            <p className="page-subtitle">Quick reference for temperatures and cooking times</p>
          </div>
          {hasEditPermission && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cheatsheet
            </Button>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Tabs defaultValue="sous-vide" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sous-vide" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                <span className="hidden sm:inline">Sous Vide</span>
              </TabsTrigger>
              <TabsTrigger value="oven" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Oven</span>
              </TabsTrigger>
              <TabsTrigger value="steam" className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span className="hidden sm:inline">Steam</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Custom</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sous-vide">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Sous Vide Temperature Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Precision water bath cooking temperatures and times
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={sousVideCharts} icon={Droplets} color="text-primary" />
              </div>
            </TabsContent>

            <TabsContent value="oven">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-warning">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-semibold">Oven & Slow Cooking Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Roasting, braising, and slow cooking temperatures
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={ovenCharts} icon={Flame} color="text-warning" />
              </div>
            </TabsContent>

            <TabsContent value="steam">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-success">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-semibold">Steam Times Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Steaming times for vegetables, seafood, and more
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={steamCharts} icon={Thermometer} color="text-success" />
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : cheatsheets.length === 0 ? (
                  <div className="card-elevated p-12 text-center">
                    <Edit className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No custom cheatsheets yet</p>
                    {hasEditPermission && (
                      <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Cheatsheet
                      </Button>
                    )}
                  </div>
                ) : (
                  Object.entries(customByCategory).map(([category, sheets]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sheets.map((sheet) => (
                          <div key={sheet.id} className="card-elevated p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{sheet.title}</h4>
                              {hasEditPermission && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditDialog(sheet)}
                                    className="p-1 rounded hover:bg-muted"
                                  >
                                    <Edit className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeletingSheet(sheet);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="p-1 rounded hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sheet.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSheet ? "Edit Cheatsheet" : "New Cheatsheet"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mother Sauces"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your cheatsheet content..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingSheet ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Cheatsheet</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deletingSheet?.title}"? This action cannot be undone.
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

export default CookingCheatsheets;
