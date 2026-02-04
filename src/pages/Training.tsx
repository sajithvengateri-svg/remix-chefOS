import { motion } from "framer-motion";
import { 
  Plus,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  PlayCircle,
  User
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface TrainingModule {
  id: string;
  title: string;
  category: string;
  duration: string;
  status: "not-started" | "in-progress" | "completed";
  completedBy: number;
  totalStaff: number;
}

const mockTraining: TrainingModule[] = [
  { id: "1", title: "Food Safety Fundamentals", category: "Safety", duration: "45 min", status: "completed", completedBy: 8, totalStaff: 8 },
  { id: "2", title: "Allergen Awareness", category: "Safety", duration: "30 min", status: "in-progress", completedBy: 5, totalStaff: 8 },
  { id: "3", title: "Knife Skills Basics", category: "Skills", duration: "1 hr", status: "completed", completedBy: 8, totalStaff: 8 },
  { id: "4", title: "HACCP Certification", category: "Certification", duration: "2 hrs", status: "in-progress", completedBy: 3, totalStaff: 8 },
  { id: "5", title: "Fire Safety Procedures", category: "Safety", duration: "20 min", status: "not-started", completedBy: 0, totalStaff: 8 },
  { id: "6", title: "Customer Service Excellence", category: "Soft Skills", duration: "45 min", status: "not-started", completedBy: 0, totalStaff: 8 },
];

const statusStyles = {
  "not-started": { bg: "bg-muted", text: "text-muted-foreground", label: "Not Started" },
  "in-progress": { bg: "bg-warning/10", text: "text-warning", label: "In Progress" },
  "completed": { bg: "bg-success/10", text: "text-success", label: "Completed" },
};

const Training = () => {
  const completedCount = mockTraining.filter(t => t.status === "completed").length;
  const inProgressCount = mockTraining.filter(t => t.status === "in-progress").length;

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
            <h1 className="page-title font-display">Training</h1>
            <p className="page-subtitle">Staff training and certifications</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Module
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
            <div className="p-2 rounded-lg bg-primary/10 w-fit">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="stat-value">{mockTraining.length}</p>
              <p className="stat-label">Total Modules</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-success/10 w-fit">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="stat-value">{completedCount}</p>
              <p className="stat-label">Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-warning/10 w-fit">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="stat-value">{inProgressCount}</p>
              <p className="stat-label">In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="p-2 rounded-lg bg-accent/10 w-fit">
              <Award className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="stat-value">12</p>
              <p className="stat-label">Certifications</p>
            </div>
          </div>
        </motion.div>

        {/* Training Modules */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {mockTraining.map((module, index) => {
            const style = statusStyles[module.status];
            const progress = (module.completedBy / module.totalStaff) * 100;
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="card-interactive p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {module.category}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    style.bg, style.text
                  )}>
                    {style.label}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{module.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{module.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{module.completedBy}/{module.totalStaff} staff</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Team Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        module.status === "completed" ? "bg-success" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm font-medium">
                  <PlayCircle className="w-4 h-4" />
                  {module.status === "not-started" ? "Start Training" : "Continue"}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Training;
