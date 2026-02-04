import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon,
  Plus,
  Wrench,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  type: "maintenance" | "license" | "inspection" | "reminder";
  equipment?: string;
  notes?: string;
  status: "upcoming" | "due" | "overdue" | "completed";
}

const mockEvents: ScheduledEvent[] = [
  { id: "1", title: "Hood Exhaust Cleaning", date: new Date(2026, 1, 10), type: "maintenance", equipment: "Kitchen Hood System", status: "upcoming" },
  { id: "2", title: "Liquor License Renewal", date: new Date(2026, 1, 15), type: "license", notes: "Submit 30 days before expiry", status: "due" },
  { id: "3", title: "Health Inspection Due", date: new Date(2026, 1, 20), type: "inspection", status: "upcoming" },
  { id: "4", title: "Walk-in Cooler Service", date: new Date(2026, 1, 5), type: "maintenance", equipment: "Walk-in Cooler #1", status: "overdue" },
  { id: "5", title: "Fire Extinguisher Check", date: new Date(2026, 1, 25), type: "maintenance", status: "upcoming" },
  { id: "6", title: "Food Handler Cert Renewal", date: new Date(2026, 2, 1), type: "license", notes: "Chef Marcus", status: "upcoming" },
  { id: "7", title: "Grease Trap Cleaning", date: new Date(2026, 1, 18), type: "maintenance", equipment: "Grease Trap", status: "upcoming" },
  { id: "8", title: "Pest Control Visit", date: new Date(2026, 1, 12), type: "inspection", status: "upcoming" },
];

const typeConfig = {
  maintenance: { icon: Wrench, color: "text-primary", bg: "bg-primary/10", label: "Maintenance" },
  license: { icon: FileCheck, color: "text-warning", bg: "bg-warning/10", label: "License" },
  inspection: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Inspection" },
  reminder: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Reminder" },
};

const statusStyles = {
  upcoming: { bg: "bg-muted", text: "text-muted-foreground" },
  due: { bg: "bg-warning/10", text: "text-warning" },
  overdue: { bg: "bg-destructive/10", text: "text-destructive" },
  completed: { bg: "bg-success/10", text: "text-success" },
};

const OperationsCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with weekday
  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay).fill(null).concat(daysInMonth);

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(e => isSameDay(e.date, date));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = mockEvents
    .filter(e => e.status !== "completed")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

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
            <h1 className="page-title font-display">Operations Calendar</h1>
            <p className="page-subtitle">Track maintenance, licenses, and inspections</p>
          </div>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 card-elevated p-5"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                →
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }
                
                const events = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 rounded-lg text-sm relative transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      isToday && !isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {events.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.slice(0, 3).map((e, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              typeConfig[e.type].bg,
                              isSelected ? "bg-primary-foreground" : ""
                            )} 
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              {Object.entries(typeConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className={cn("w-3 h-3 rounded-full", config.bg)} />
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Selected Date Events */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold mb-3">
                {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map(event => {
                    const config = typeConfig[event.type];
                    const status = statusStyles[event.status];
                    const Icon = config.icon;
                    
                    return (
                      <div key={event.id} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <Icon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.title}</p>
                            {event.equipment && (
                              <p className="text-sm text-muted-foreground">{event.equipment}</p>
                            )}
                            <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", status.bg, status.text)}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No events scheduled</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="card-elevated p-5">
              <h3 className="font-semibold mb-3">Upcoming</h3>
              <div className="space-y-2">
                {upcomingEvents.map(event => {
                  const config = typeConfig[event.type];
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={event.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(event.date)}
                    >
                      <div className={cn("p-1.5 rounded-lg", config.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{format(event.date, "MMM d")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OperationsCalendar;
