import { ChefHat, Package, ClipboardCheck, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: string;
  subject: string;
  user: string;
  time: string;
  type: "recipe" | "inventory" | "prep" | "safety";
}

const mockActivities: ActivityItem[] = [
  { id: "1", action: "Added recipe", subject: "Pan-Seared Duck Breast", user: "Chef Marco", time: "10 min ago", type: "recipe" },
  { id: "2", action: "Updated inventory", subject: "Received produce delivery", user: "Alex", time: "25 min ago", type: "inventory" },
  { id: "3", action: "Completed prep", subject: "Morning mise en place", user: "Maria", time: "1 hr ago", type: "prep" },
  { id: "4", action: "Logged temperature", subject: "Walk-in cooler: 36°F", user: "James", time: "2 hrs ago", type: "safety" },
  { id: "5", action: "Updated recipe", subject: "Risotto cost adjusted", user: "Chef Marco", time: "3 hrs ago", type: "recipe" },
];

const typeIcons = {
  recipe: ChefHat,
  inventory: Package,
  prep: ClipboardCheck,
  safety: Shield,
};

const typeColors = {
  recipe: "text-primary bg-primary/10",
  inventory: "text-accent bg-accent/10",
  prep: "text-success bg-success/10",
  safety: "text-warning bg-warning/10",
};

const RecentActivity = () => {
  return (
    <div className="card-elevated p-5 h-full">
      <h2 className="section-header">Recent Activity</h2>
      
      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = typeIcons[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg flex-shrink-0", typeColors[activity.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground truncate">{activity.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
