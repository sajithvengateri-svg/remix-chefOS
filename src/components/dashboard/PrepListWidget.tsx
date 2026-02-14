import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Circle, Clock, ClipboardList, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";

type UrgencyLevel = "priority" | "end_of_day" | "within_48h";

interface PrepItem {
  id: string;
  task: string;
  quantity: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  urgency?: UrgencyLevel;
}

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

const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; label: string }> = {
  priority: { color: "text-red-600", label: "Before Next Service" },
  end_of_day: { color: "text-yellow-600", label: "End of Day" },
  within_48h: { color: "text-green-600", label: "48 Hours" },
};

const PrepListWidget = () => {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentOrg } = useOrg();

  const fetchTodaysPrepLists = useCallback(async () => {
    if (!currentOrg?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('prep_lists')
        .select('*')
        .eq('date', today)
        .eq('org_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allItems: PrepItem[] = [];
      (data || []).forEach((list) => {
        const items = (Array.isArray(list.items) ? list.items : []) as unknown as Array<{
          id?: string; task?: string; quantity?: string; assignee?: string;
          status?: string; completed?: boolean; priority?: string; urgency?: string;
        }>;
        items.forEach((item, index) => {
          let status: "pending" | "in-progress" | "completed" = "pending";
          if (item.status) {
            status = item.status as "pending" | "in-progress" | "completed";
          } else if (item.completed !== undefined) {
            status = item.completed ? "completed" : "pending";
          }
          
          let urgency: UrgencyLevel = "within_48h";
          if (item.urgency) urgency = item.urgency as UrgencyLevel;
          else if (item.priority === "high") urgency = "priority";
          else if (item.priority === "medium") urgency = "end_of_day";
          
          allItems.push({
            id: item.id || `${list.id}-${index}`,
            task: item.task || '',
            quantity: item.quantity || '',
            assignee: item.assignee || list.assigned_to_name || 'Unassigned',
            status,
            priority: (item.priority as "high" | "medium" | "low") || "medium",
            urgency,
          });
        });
      });

      setPrepItems(allItems);
    } catch (error) {
      console.error('Error fetching prep lists:', error);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchTodaysPrepLists();

    if (!currentOrg?.id) return;

    const channel = supabase
      .channel('prep-widget-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prep_lists', filter: `org_id=eq.${currentOrg.id}` },
        () => fetchTodaysPrepLists()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentOrg?.id, fetchTodaysPrepLists]);

  const completedCount = prepItems.filter(item => item.status === "completed").length;
  const progress = prepItems.length > 0 ? (completedCount / prepItems.length) * 100 : 0;

  if (loading) {
    return (
      <div className="card-elevated p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-2 bg-muted rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header mb-0">Today's Prep List</h2>
          <p className="text-sm text-muted-foreground">
            {prepItems.length > 0 
              ? `${completedCount} of ${prepItems.length} tasks completed`
              : "No prep tasks today"
            }
          </p>
        </div>
        <Link to="/prep" className="btn-primary text-sm py-2 px-4">View All</Link>
      </div>

      <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {prepItems.length > 0 ? (
        <div className="space-y-2">
          {prepItems.slice(0, 5).map((item) => {
            const StatusIcon = statusIcons[item.status] || Circle;
            return (
              <div key={item.id} className={cn(
                "flex items-center gap-4 p-3 rounded-lg bg-muted/50 border-l-4 transition-all hover:bg-muted",
                priorityStyles[item.priority] || "border-l-muted-foreground"
              )}>
                <StatusIcon className={cn("w-5 h-5 flex-shrink-0",
                  item.status === "completed" && "text-success",
                  item.status === "in-progress" && "text-warning",
                  item.status === "pending" && "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium truncate",
                      item.status === "completed" && "line-through text-muted-foreground"
                    )}>{item.task}</p>
                    {item.urgency && item.status !== "completed" && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Flag className={cn("w-3 h-3", URGENCY_CONFIG[item.urgency].color)} />
                        <span className={cn("text-xs font-medium", URGENCY_CONFIG[item.urgency].color)}>
                          {URGENCY_CONFIG[item.urgency].label}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-foreground">{item.assignee}</p>
                  <span className={cn("text-xs capitalize",
                    item.status === "completed" && "text-success",
                    item.status === "in-progress" && "text-warning",
                    item.status === "pending" && "text-muted-foreground"
                  )}>{item.status.replace("-", " ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">No prep tasks today</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create your first prep list</p>
          <Link to="/prep/new" className="btn-primary text-sm py-2 px-4 mt-4">Create Prep List</Link>
        </div>
      )}
    </div>
  );
};

export default PrepListWidget;
