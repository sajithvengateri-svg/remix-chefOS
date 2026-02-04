import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrepItem {
  id: string;
  task: string;
  quantity: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

const mockPrepItems: PrepItem[] = [
  { id: "1", task: "Dice onions", quantity: "5 lbs", assignee: "Maria", status: "completed", priority: "high" },
  { id: "2", task: "Prep hollandaise base", quantity: "2 qts", assignee: "James", status: "in-progress", priority: "high" },
  { id: "3", task: "Portion salmon fillets", quantity: "24 pc", assignee: "Alex", status: "pending", priority: "medium" },
  { id: "4", task: "Make croutons", quantity: "3 sheet pans", assignee: "Maria", status: "pending", priority: "low" },
  { id: "5", task: "Blanch vegetables", quantity: "10 lbs", assignee: "James", status: "pending", priority: "medium" },
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

const PrepListWidget = () => {
  const completedCount = mockPrepItems.filter(item => item.status === "completed").length;
  const progress = (completedCount / mockPrepItems.length) * 100;

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header mb-0">Today's Prep List</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {mockPrepItems.length} tasks completed
          </p>
        </div>
        <Link to="/prep" className="btn-primary text-sm py-2 px-4">
          View All
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Prep items */}
      <div className="space-y-2">
        {mockPrepItems.map((item) => {
          const StatusIcon = statusIcons[item.status];
          
          return (
            <div 
              key={item.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg bg-muted/50 border-l-4 transition-all hover:bg-muted",
                priorityStyles[item.priority]
              )}
            >
              <StatusIcon className={cn(
                "w-5 h-5 flex-shrink-0",
                item.status === "completed" && "text-success",
                item.status === "in-progress" && "text-warning",
                item.status === "pending" && "text-muted-foreground"
              )} />
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  item.status === "completed" && "line-through text-muted-foreground"
                )}>
                  {item.task}
                </p>
                <p className="text-xs text-muted-foreground">{item.quantity}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm text-foreground">{item.assignee}</p>
                <span className={cn(
                  "text-xs capitalize",
                  item.status === "completed" && "text-success",
                  item.status === "in-progress" && "text-warning",
                  item.status === "pending" && "text-muted-foreground"
                )}>
                  {item.status.replace("-", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrepListWidget;
