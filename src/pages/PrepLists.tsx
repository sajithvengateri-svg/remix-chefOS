import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  User,
  MoreVertical
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface PrepTask {
  id: string;
  task: string;
  quantity: string;
  recipe?: string;
  assignee: string;
  dueTime: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

interface PrepList {
  id: string;
  date: string;
  shift: "AM" | "PM";
  tasks: PrepTask[];
}

const mockPrepLists: PrepList[] = [
  {
    id: "1",
    date: "Today",
    shift: "AM",
    tasks: [
      { id: "1", task: "Dice onions", quantity: "5 lbs", assignee: "Maria", dueTime: "9:00 AM", status: "completed", priority: "high" },
      { id: "2", task: "Prep hollandaise base", quantity: "2 qts", recipe: "Eggs Benedict", assignee: "James", dueTime: "10:00 AM", status: "in-progress", priority: "high" },
      { id: "3", task: "Portion salmon fillets", quantity: "24 pc", recipe: "Pan-Seared Salmon", assignee: "Alex", dueTime: "11:00 AM", status: "pending", priority: "medium" },
      { id: "4", task: "Make croutons", quantity: "3 sheet pans", recipe: "Caesar Salad", assignee: "Maria", dueTime: "11:30 AM", status: "pending", priority: "low" },
    ]
  },
  {
    id: "2",
    date: "Today",
    shift: "PM",
    tasks: [
      { id: "5", task: "Blanch vegetables", quantity: "10 lbs", assignee: "James", dueTime: "3:00 PM", status: "pending", priority: "medium" },
      { id: "6", task: "Prep dessert components", quantity: "48 servings", recipe: "Crème Brûlée", assignee: "Sarah", dueTime: "4:00 PM", status: "pending", priority: "high" },
    ]
  }
];

const statusIcons = {
  "pending": Circle,
  "in-progress": Clock,
  "completed": CheckCircle2,
};

const priorityStyles = {
  "high": "border-l-destructive",
  "medium": "border-l-warning",
  "low": "border-l-muted-foreground",
};

const PrepLists = () => {
  const [selectedDate, setSelectedDate] = useState("today");

  const totalTasks = mockPrepLists.reduce((acc, list) => acc + list.tasks.length, 0);
  const completedTasks = mockPrepLists.reduce(
    (acc, list) => acc + list.tasks.filter(t => t.status === "completed").length, 
    0
  );
  const progress = (completedTasks / totalTasks) * 100;

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
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Prep List
          </button>
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
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-muted rounded-lg px-3 py-2 text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {mockPrepLists.reduce((acc, list) => acc + list.tasks.filter(t => t.status === "in-progress").length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {mockPrepLists.reduce((acc, list) => acc + list.tasks.filter(t => t.status === "pending").length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>

        {/* Prep Lists */}
        <div className="space-y-6">
          {mockPrepLists.map((list, listIndex) => (
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
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {list.shift} Shift
                  </div>
                  <span className="text-sm text-muted-foreground">{list.date}</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tasks */}
              <div className="divide-y divide-border">
                {list.tasks.map((task) => {
                  const StatusIcon = statusIcons[task.status];
                  
                  return (
                    <div 
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border-l-4 hover:bg-muted/30 transition-colors cursor-pointer",
                        priorityStyles[task.priority]
                      )}
                    >
                      <button className="flex-shrink-0">
                        <StatusIcon className={cn(
                          "w-5 h-5",
                          task.status === "completed" && "text-success",
                          task.status === "in-progress" && "text-warning",
                          task.status === "pending" && "text-muted-foreground"
                        )} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium",
                            task.status === "completed" && "line-through text-muted-foreground"
                          )}>
                            {task.task}
                          </p>
                          <span className="text-sm text-muted-foreground">• {task.quantity}</span>
                        </div>
                        {task.recipe && (
                          <p className="text-sm text-muted-foreground">For: {task.recipe}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{task.dueTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PrepLists;
