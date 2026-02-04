import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Trash2,
  Loader2,
  Wrench,
  FileText,
  Shield
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
import { format, isBefore, addDays } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  date: string;
  time: string | null;
  description: string | null;
  location: string | null;
  status: string | null;
}

const eventTypes = [
  { value: "maintenance", label: "Maintenance", icon: Wrench, color: "text-primary" },
  { value: "license", label: "License Renewal", icon: FileText, color: "text-warning" },
  { value: "inspection", label: "Inspection", icon: Shield, color: "text-destructive" },
  { value: "training", label: "Training", icon: Calendar, color: "text-success" },
  { value: "other", label: "Other", icon: Calendar, color: "text-muted-foreground" },
];

const OperationsCalendar = () => {
  const { user, canEdit } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    event_type: "maintenance",
    date: new Date().toISOString().split("T")[0],
    time: "",
    description: "",
    location: "",
    status: "upcoming",
  });

  const hasEditPermission = canEdit("calendar");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load calendar events");
    } else {
      // Update statuses based on date
      const today = new Date();
      const updatedEvents = (data || []).map(event => {
        const eventDate = new Date(event.date);
        let status = event.status;
        if (event.status !== "completed") {
          if (isBefore(eventDate, today)) {
            status = "overdue";
          } else if (isBefore(eventDate, addDays(today, 7))) {
            status = "due";
          } else {
            status = "upcoming";
          }
        }
        return { ...event, status } as CalendarEvent;
      });
      setEvents(updatedEvents);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (editingEvent) {
      const { error } = await supabase
        .from("calendar_events")
        .update({
          title: formData.title,
          event_type: formData.event_type,
          date: formData.date,
          time: formData.time || null,
          description: formData.description || null,
          location: formData.location || null,
          status: formData.status,
        })
        .eq("id", editingEvent.id);

      if (error) {
        toast.error("Failed to update event");
        console.error(error);
        return;
      }
      toast.success("Event updated");
    } else {
      const { error } = await supabase.from("calendar_events").insert({
        title: formData.title,
        event_type: formData.event_type,
        date: formData.date,
        time: formData.time || null,
        description: formData.description || null,
        location: formData.location || null,
        status: formData.status,
        created_by: user?.id,
      });

      if (error) {
        toast.error("Failed to create event");
        console.error(error);
        return;
      }
      toast.success("Event created");
    }

    resetForm();
    fetchEvents();
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", deletingEvent.id);

    if (error) {
      toast.error("Failed to delete event");
      console.error(error);
      return;
    }

    toast.success("Event deleted");
    setDeleteDialogOpen(false);
    setDeletingEvent(null);
    fetchEvents();
  };

  const markComplete = async (event: CalendarEvent) => {
    const { error } = await supabase
      .from("calendar_events")
      .update({ status: "completed" })
      .eq("id", event.id);

    if (error) {
      toast.error("Failed to update event");
      return;
    }

    toast.success("Marked as complete");
    fetchEvents();
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      event_type: event.event_type,
      date: event.date,
      time: event.time || "",
      description: event.description || "",
      location: event.location || "",
      status: event.status || "upcoming",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      event_type: "maintenance",
      date: new Date().toISOString().split("T")[0],
      time: "",
      description: "",
      location: "",
      status: "upcoming",
    });
  };

  const filteredEvents = events.filter(event => 
    filterType === "all" || event.event_type === filterType
  );

  const overdueCount = events.filter(e => e.status === "overdue").length;
  const dueCount = events.filter(e => e.status === "due").length;

  const statusStyles: Record<string, string> = {
    upcoming: "bg-primary/10 text-primary",
    due: "bg-warning/10 text-warning",
    overdue: "bg-destructive/10 text-destructive",
    completed: "bg-success/10 text-success",
  };

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
            <h1 className="page-title font-display">Operations Calendar</h1>
            <p className="page-subtitle">Track maintenance, licenses, and inspections</p>
          </div>
          {hasEditPermission && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
        </motion.div>

        {/* Alerts */}
        {(overdueCount > 0 || dueCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {overdueCount > 0 && (
              <div className="card-elevated p-4 border-l-4 border-l-destructive">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold">{overdueCount} Overdue</p>
                    <p className="text-sm text-muted-foreground">Requires immediate attention</p>
                  </div>
                </div>
              </div>
            )}
            {dueCount > 0 && (
              <div className="card-elevated p-4 border-l-4 border-l-warning">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning" />
                  <div>
                    <p className="font-semibold">{dueCount} Due Soon</p>
                    <p className="text-sm text-muted-foreground">Within the next 7 days</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filterType === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            )}
          >
            All
          </button>
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                filterType === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              )}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </motion.div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {filteredEvents.map((event, index) => {
              const typeInfo = eventTypes.find(t => t.value === event.event_type);
              const Icon = typeInfo?.icon || Calendar;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="card-elevated p-4 flex items-center gap-4"
                >
                  <div className={cn("p-3 rounded-lg bg-muted", typeInfo?.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{event.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        statusStyles[event.status || "upcoming"]
                      )}>
                        {(event.status || "upcoming").replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      {event.time && <span>{event.time}</span>}
                      {event.location && <span>• {event.location}</span>}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {event.status !== "completed" && hasEditPermission && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markComplete(event)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {hasEditPermission && (
                      <>
                        <button
                          onClick={() => openEditDialog(event)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingEvent(event);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="card-elevated p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No events found</p>
                {hasEditPermission && (
                  <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Event
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
              <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Hood Cleaning"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="due">Due Soon</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Kitchen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingEvent ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deletingEvent?.title}"? This action cannot be undone.
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

export default OperationsCalendar;
