import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  User,
  Edit,
  Trash2,
  Loader2,
  Flag
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
import { format } from "date-fns";

type UrgencyLevel = "priority" | "end_of_day" | "within_48h";

interface PrepItem {
  id: string;
  task: string;
  quantity: string;
  completed: boolean;
  urgency?: UrgencyLevel;
}

const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; bgColor: string; label: string }> = {
  priority: { color: "text-red-600", bgColor: "bg-red-500", label: "Before Next Service" },
  end_of_day: { color: "text-yellow-600", bgColor: "bg-yellow-500", label: "End of Day" },
  within_48h: { color: "text-green-600", bgColor: "bg-green-500", label: "48 Hours" },
};

interface PrepList {
  id: string;
  name: string;
  date: string;
  items: PrepItem[];
  assigned_to_name: string | null;
  status: "pending" | "in_progress" | "completed";
  notes: string | null;
}

const PrepLists = () => {
  const { user, canEdit } = useAuth();
  const [selectedDate, setSelectedDate] = useState("today");
  const [prepLists, setPrepLists] = useState<PrepList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<PrepList | null>(null);
  const [deletingList, setDeletingList] = useState<PrepList | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    assigned_to_name: "",
    status: "pending" as "pending" | "in_progress" | "completed",
    notes: "",
    items: [] as PrepItem[],
  });

  const [newTask, setNewTask] = useState({ task: "", quantity: "", urgency: "within_48h" as UrgencyLevel });

  const hasEditPermission = canEdit("prep");

  useEffect(() => {
    fetchPrepLists();
  }, []);

  const fetchPrepLists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prep_lists")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching prep lists:", error);
      toast.error("Failed to load prep lists");
    } else {
      const formattedData = (data || []).map(item => ({
        ...item,
        items: (Array.isArray(item.items) ? item.items : []) as unknown as PrepItem[],
        status: item.status as "pending" | "in_progress" | "completed",
      }));
      setPrepLists(formattedData);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Prep list name is required");
      return;
    }

    if (editingList) {
      const { error } = await supabase
        .from("prep_lists")
        .update({
          name: formData.name,
          date: formData.date,
          assigned_to_name: formData.assigned_to_name || null,
          status: formData.status,
          notes: formData.notes || null,
          items: JSON.parse(JSON.stringify(formData.items)),
        })
        .eq("id", editingList.id);

      if (error) {
        toast.error("Failed to update prep list");
        console.error(error);
        return;
      }
      toast.success("Prep list updated");
    } else {
      const { error } = await supabase.from("prep_lists").insert({
        name: formData.name,
        date: formData.date,
        assigned_to_name: formData.assigned_to_name || null,
        status: formData.status,
        notes: formData.notes || null,
        items: JSON.parse(JSON.stringify(formData.items)),
        created_by: user?.id,
      });

      if (error) {
        toast.error("Failed to create prep list");
        console.error(error);
        return;
      }
      toast.success("Prep list created");
    }

    resetForm();
    fetchPrepLists();
  };

  const handleDelete = async () => {
    if (!deletingList) return;

    const { error } = await supabase
      .from("prep_lists")
      .delete()
      .eq("id", deletingList.id);

    if (error) {
      toast.error("Failed to delete prep list");
      console.error(error);
      return;
    }

    toast.success("Prep list deleted");
    setDeleteDialogOpen(false);
    setDeletingList(null);
    fetchPrepLists();
  };

  const toggleTaskComplete = async (list: PrepList, taskId: string) => {
    const updatedItems = list.items.map(item =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );

    const allCompleted = updatedItems.every(item => item.completed);
    const anyInProgress = updatedItems.some(item => item.completed) && !allCompleted;

    const { error } = await supabase
      .from("prep_lists")
      .update({
        items: JSON.parse(JSON.stringify(updatedItems)),
        status: allCompleted ? "completed" : anyInProgress ? "in_progress" : "pending",
      })
      .eq("id", list.id);

    if (error) {
      toast.error("Failed to update task");
      return;
    }

    fetchPrepLists();
  };

  const addTaskToForm = () => {
    if (!newTask.task.trim()) return;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: crypto.randomUUID(), task: newTask.task, quantity: newTask.quantity, completed: false, urgency: newTask.urgency },
      ],
    });
    setNewTask({ task: "", quantity: "", urgency: "within_48h" });
  };

  const removeTaskFromForm = (taskId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== taskId),
    });
  };

  const openEditDialog = (list: PrepList) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      date: list.date,
      assigned_to_name: list.assigned_to_name || "",
      status: list.status,
      notes: list.notes || "",
      items: list.items,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingList(null);
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      assigned_to_name: "",
      status: "pending",
      notes: "",
      items: [],
    });
    setNewTask({ task: "", quantity: "", urgency: "within_48h" });
  };

  const totalTasks = prepLists.reduce((acc, list) => acc + list.items.length, 0);
  const completedTasks = prepLists.reduce(
    (acc, list) => acc + list.items.filter(t => t.completed).length,
    0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const statusIcons = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
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
            <h1 className="page-title font-display">Prep Lists</h1>
            <p className="page-subtitle">Organize your kitchen prep work</p>
          </div>
          {hasEditPermission && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Prep List
            </Button>
          )}
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-header mb-0">Today's Progress</h2>
              <p className="text-sm text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {prepLists.filter(l => l.status === "in_progress").length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {prepLists.filter(l => l.status === "pending").length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>

        {/* Prep Lists */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {prepLists.map((list, listIndex) => {
              const StatusIcon = statusIcons[list.status];
              
              return (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + listIndex * 0.1 }}
                  className="card-elevated overflow-hidden"
                >
                  {/* List Header */}
                  <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        list.status === "completed" ? "bg-success/10 text-success" :
                        list.status === "in_progress" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {list.name}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(list.date), "MMM d, yyyy")}
                      </span>
                      {list.assigned_to_name && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {list.assigned_to_name}
                        </span>
                      )}
                    </div>
                    {hasEditPermission && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditDialog(list)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingList(list);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="divide-y divide-border">
                    {list.items.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No tasks in this list
                      </div>
                    ) : (
                      list.items.map((task) => {
                        const urgency = task.urgency || "within_48h";
                        return (
                          <div 
                            key={task.id}
                            className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                          >
                            <button 
                              className="flex-shrink-0"
                              onClick={() => hasEditPermission && toggleTaskComplete(list, task.id)}
                              disabled={!hasEditPermission}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "font-medium",
                                  task.completed && "line-through text-muted-foreground"
                                )}>
                                  {task.task}
                                </p>
                                {!task.completed && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Flag className={cn("w-3 h-3", URGENCY_CONFIG[urgency].color)} />
                                    <span className={cn(
                                      "text-xs font-medium",
                                      URGENCY_CONFIG[urgency].color
                                    )}>
                                      {URGENCY_CONFIG[urgency].label}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {task.quantity && (
                              <span className="text-sm text-muted-foreground">
                                {task.quantity}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              );
            })}

            {prepLists.length === 0 && !loading && (
              <div className="card-elevated p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No prep lists found</p>
                {hasEditPermission && (
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Prep List
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingList ? "Edit Prep List" : "New Prep List"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">List Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., AM Prep, Lunch Prep"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned">Assigned To</Label>
                  <Input
                    id="assigned"
                    value={formData.assigned_to_name}
                    onChange={(e) => setFormData({ ...formData, assigned_to_name: e.target.value })}
                    placeholder="e.g., Maria"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "in_progress" | "completed") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                <Label>Tasks</Label>
                <div className="space-y-2">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Flag className={cn("w-4 h-4 flex-shrink-0", URGENCY_CONFIG[item.urgency || "within_48h"].color)} />
                      <span className="flex-1">{item.task}</span>
                      <span className="text-xs text-muted-foreground">{item.quantity}</span>
                      <span className={cn("text-xs", URGENCY_CONFIG[item.urgency || "within_48h"].color)}>
                        {URGENCY_CONFIG[item.urgency || "within_48h"].label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTaskFromForm(item.id)}
                        className="p-1 rounded hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Task name"
                    className="flex-1 min-w-[150px]"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  />
                  <Input
                    placeholder="Qty"
                    className="w-20"
                    value={newTask.quantity}
                    onChange={(e) => setNewTask({ ...newTask, quantity: e.target.value })}
                  />
                  <Select
                    value={newTask.urgency}
                    onValueChange={(value: UrgencyLevel) => setNewTask({ ...newTask, urgency: value })}
                  >
                    <SelectTrigger className="w-[160px]">
                      <div className="flex items-center gap-2">
                        <Flag className={cn("w-3 h-3", URGENCY_CONFIG[newTask.urgency].color)} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-red-600" />
                          Before Next Service
                        </div>
                      </SelectItem>
                      <SelectItem value="end_of_day">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-yellow-600" />
                          End of Day
                        </div>
                      </SelectItem>
                      <SelectItem value="within_48h">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-green-600" />
                          48 Hours
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={addTaskToForm}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
                {editingList ? "Save Changes" : "Create List"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Prep List</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deletingList?.name}"? This action cannot be undone.
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

export default PrepLists;
