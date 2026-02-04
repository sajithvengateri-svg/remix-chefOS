import { motion } from "framer-motion";
import { 
  Plus,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface SafetyLog {
  id: string;
  type: "temperature" | "cleaning" | "receiving" | "cooking";
  location: string;
  value?: string;
  status: "passed" | "warning" | "failed";
  recordedBy: string;
  time: string;
}

const mockLogs: SafetyLog[] = [
  { id: "1", type: "temperature", location: "Walk-in Cooler", value: "36°F", status: "passed", recordedBy: "James", time: "8:00 AM" },
  { id: "2", type: "temperature", location: "Freezer", value: "-5°F", status: "passed", recordedBy: "James", time: "8:05 AM" },
  { id: "3", type: "temperature", location: "Prep Cooler", value: "42°F", status: "warning", recordedBy: "Maria", time: "10:00 AM" },
  { id: "4", type: "cooking", location: "Chicken Internal Temp", value: "168°F", status: "passed", recordedBy: "Alex", time: "11:30 AM" },
  { id: "5", type: "receiving", location: "Produce Delivery", value: "Visual OK", status: "passed", recordedBy: "Maria", time: "7:00 AM" },
  { id: "6", type: "cleaning", location: "Prep Station 1", status: "passed", recordedBy: "James", time: "3:00 PM" },
];

const statusStyles = {
  passed: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
  warning: { bg: "bg-warning/10", text: "text-warning", icon: AlertTriangle },
  failed: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
};

const typeLabels = {
  temperature: "Temperature Check",
  cleaning: "Cleaning Log",
  receiving: "Receiving Log",
  cooking: "Cooking Temperature",
};

const FoodSafety = () => {
  const passedCount = mockLogs.filter(l => l.status === "passed").length;
  const warningCount = mockLogs.filter(l => l.status === "warning").length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Food Safety</h1>
            <p className="page-subtitle">HACCP compliance and temperature logs</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Log Entry
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-success/10 w-fit">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="stat-value">{passedCount}</p>
              <p className="stat-label">Passed Today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-warning/10 w-fit">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="stat-value">{warningCount}</p>
              <p className="stat-label">Warnings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-primary/10 w-fit">
              <Thermometer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="stat-value">12</p>
              <p className="stat-label">Temp Logs Due</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-accent/10 w-fit">
              <FileCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="stat-value">98%</p>
              <p className="stat-label">Compliance Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="section-header mb-0">Today's Logs</h2>
          </div>
          <div className="divide-y divide-border">
            {mockLogs.map((log) => {
              const style = statusStyles[log.status];
              const StatusIcon = style.icon;
              
              return (
                <div 
                  key={log.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className={cn("p-2.5 rounded-xl", style.bg)}>
                    <StatusIcon className={cn("w-5 h-5", style.text)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{log.location}</p>
                    <p className="text-sm text-muted-foreground">{typeLabels[log.type]}</p>
                  </div>

                  {log.value && (
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{log.value}</p>
                    </div>
                  )}

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-foreground">{log.recordedBy}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {log.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default FoodSafety;
