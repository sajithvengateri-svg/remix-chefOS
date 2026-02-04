import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PrepItem {
  id: string;
  task: string;
  quantity: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

interface PrepList {
  id: string;
  name: string;
  date: string;
  status: string;
  items: PrepItem[];
  assigned_to_name: string | null;
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

const PrepListWidget = () => {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaysPrepLists = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('prep_lists')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten all items from today's prep lists
      const allItems: PrepItem[] = [];
      (data || []).forEach((list) => {
        const items = (Array.isArray(list.items) ? list.items : []) as unknown as PrepItem[];
        items.forEach((item, index) => {
          allItems.push({
            ...item,
            id: item.id || `${list.id}-${index}`,
            assignee: item.assignee || list.assigned_to_name || 'Lorem',
          });
        });
      });

      setPrepItems(allItems);
    } catch (error) {
      console.error('Error fetching prep lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysPrepLists();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('prep-lists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prep_lists',
        },
        () => {
          fetchTodaysPrepLists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
              : "Nulla opera hodie"
            }
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
      {prepItems.length > 0 ? (
        <div className="space-y-2">
          {prepItems.slice(0, 5).map((item) => {
            const StatusIcon = statusIcons[item.status] || Circle;
            
            return (
              <div 
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg bg-muted/50 border-l-4 transition-all hover:bg-muted",
                  priorityStyles[item.priority] || "border-l-muted-foreground"
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
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">Nullae res praeparandae</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Crea primam tuam indicem praeparationis
          </p>
          <Link to="/prep/new" className="btn-primary text-sm py-2 px-4 mt-4">
            Create Prep List
          </Link>
        </div>
      )}
    </div>
  );
};

export default PrepListWidget;
