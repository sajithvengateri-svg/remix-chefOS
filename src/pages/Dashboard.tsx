import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ChefHat, 
  ClipboardCheck, 
  Package, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import PrepListWidget from "@/components/dashboard/PrepListWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ErrorBoundary from "@/components/ErrorBoundary";
import TaskInbox from "@/components/tasks/TaskInbox";
import ActivityFeed from "@/components/activity/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileDeck } from "@/components/mobile/MobileDeck";

console.log("[Dashboard] Module loaded");

interface DashboardStats {
  prepTasksTotal: number;
  prepTasksCompleted: number;
  activeRecipes: number;
  newRecipesThisWeek: number;
  lowStockItems: number;
  avgFoodCostPercent: number;
  targetFoodCost: number;
}

const Dashboard = () => {
  console.log("[Dashboard] Component rendering");
  
  const [stats, setStats] = useState<DashboardStats>({
    prepTasksTotal: 0,
    prepTasksCompleted: 0,
    activeRecipes: 0,
    newRecipesThisWeek: 0,
    lowStockItems: 0,
    avgFoodCostPercent: 0,
    targetFoodCost: 30,
  });
  const [loading, setLoading] = useState(true);
 
  const isMobile = useIsMobile();
  console.log("[Dashboard] isMobile:", isMobile);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all stats in parallel
      const [prepListsRes, recipesRes, newRecipesRes, ingredientsRes] = await Promise.all([
        // Today's prep lists
        supabase
          .from('prep_lists')
          .select('items, status')
          .eq('date', today),
        // All recipes
        supabase
          .from('recipes')
          .select('id, cost_per_serving, sell_price, target_food_cost_percent'),
        // New recipes this week
        supabase
          .from('recipes')
          .select('id')
          .gte('created_at', weekAgo),
        // Ingredients with low stock
        supabase
          .from('ingredients')
          .select('id, current_stock, par_level'),
      ]);

      // Calculate prep tasks
      let prepTasksTotal = 0;
      let prepTasksCompleted = 0;
      
      interface PrepItem {
        status?: string;
      }
      
      (prepListsRes.data || []).forEach((list) => {
        const items = (Array.isArray(list.items) ? list.items : []) as PrepItem[];
        prepTasksTotal += items.length;
        prepTasksCompleted += items.filter((item) => item.status === 'completed').length;
      });

      // Calculate low stock items
      const lowStockItems = (ingredientsRes.data || []).filter(
        (ing) => ing.current_stock !== null && 
                 ing.par_level !== null && 
                 Number(ing.current_stock) < Number(ing.par_level)
      ).length;

      // Calculate average food cost percentage
      const recipesWithCost = (recipesRes.data || []).filter(
        (r) => r.sell_price && r.sell_price > 0 && r.cost_per_serving
      );
      
      let avgFoodCostPercent = 0;
      if (recipesWithCost.length > 0) {
        const totalFoodCost = recipesWithCost.reduce((sum, r) => {
          const costPercent = ((r.cost_per_serving || 0) / (r.sell_price || 1)) * 100;
          return sum + costPercent;
        }, 0);
        avgFoodCostPercent = totalFoodCost / recipesWithCost.length;
      }

      // Get average target food cost
      const recipesWithTarget = (recipesRes.data || []).filter(r => r.target_food_cost_percent);
      const avgTargetFoodCost = recipesWithTarget.length > 0
        ? recipesWithTarget.reduce((sum, r) => sum + (r.target_food_cost_percent || 30), 0) / recipesWithTarget.length
        : 30;

      setStats({
        prepTasksTotal,
        prepTasksCompleted,
        activeRecipes: recipesRes.data?.length || 0,
        newRecipesThisWeek: newRecipesRes.data?.length || 0,
        lowStockItems,
        avgFoodCostPercent: Math.round(avgFoodCostPercent * 10) / 10,
        targetFoodCost: Math.round(avgTargetFoodCost),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Subscribe to realtime updates for relevant tables
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prep_lists' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, fetchDashboardStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getFoodCostTrend = () => {
    if (stats.avgFoodCostPercent === 0) return "";
    if (stats.avgFoodCostPercent <= stats.targetFoodCost) return "On track";
    return "Above target";
  };

  const getFoodCostColor = (): "primary" | "accent" | "warning" | "success" => {
    if (stats.avgFoodCostPercent === 0) return "primary";
    if (stats.avgFoodCostPercent <= stats.targetFoodCost) return "success";
    return "warning";
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
            <h1 className="page-title font-display">Good Morning, Chef</h1>
            <p className="page-subtitle">{currentDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-success">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All Systems Go
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={ClipboardCheck}
            label="Prep Tasks"
            value={loading ? "..." : String(stats.prepTasksTotal)}
            subValue={`${stats.prepTasksCompleted} completed`}
            trend={stats.prepTasksTotal > 0 ? `${stats.prepTasksTotal - stats.prepTasksCompleted} pending` : ""}
            color="primary"
          />
          <StatCard
            icon={ChefHat}
            label="Active Recipes"
            value={loading ? "..." : String(stats.activeRecipes)}
            subValue={stats.newRecipesThisWeek > 0 ? `${stats.newRecipesThisWeek} new this week` : "No new recipes"}
            color="accent"
          />
          <StatCard
            icon={Package}
            label="Low Stock Items"
            value={loading ? "..." : String(stats.lowStockItems)}
            subValue={stats.lowStockItems > 0 ? "Need attention" : "Stock OK"}
            trend={stats.lowStockItems > 0 ? "urgent" : ""}
            color="warning"
          />
          <StatCard
            icon={TrendingUp}
            label="Food Cost"
            value={loading ? "..." : `${stats.avgFoodCostPercent}%`}
            subValue={`Target: ${stats.targetFoodCost}%`}
            trend={getFoodCostTrend()}
            color={getFoodCostColor()}
          />
        </motion.div>

       {/* Mobile Card Deck - Only visible on mobile */}
       {isMobile && (
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.15 }}
           className="card-elevated p-4"
         >
           <h2 className="section-header">Your Action Deck</h2>
           <ErrorBoundary fallbackMessage="Could not load action deck">
             <MobileDeck className="mt-2" />
           </ErrorBoundary>
         </motion.div>
       )}
 
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActions />
        </motion.div>

        {/* Task Inbox - Shows assigned tasks for all users */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ErrorBoundary fallbackMessage="Could not load task inbox">
            <TaskInbox />
          </ErrorBoundary>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prep List Widget - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <ErrorBoundary fallbackMessage="Could not load prep list">
              <PrepListWidget />
            </ErrorBoundary>
          </motion.div>

          {/* Recent Activity with ActivityFeed */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorBoundary fallbackMessage="Could not load activity feed">
                  <ActivityFeed compact limit={8} />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Today's Alerts</h2>
            <Link to="/food-safety" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">{stats.lowStockItems} items below par level</p>
                </div>
                <Link to="/ingredients" className="btn-primary text-sm py-1.5 px-3">Review</Link>
              </div>
            )}
            {stats.prepTasksTotal > 0 && stats.prepTasksCompleted < stats.prepTasksTotal && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Prep Tasks Pending</p>
                  <p className="text-xs text-muted-foreground">{stats.prepTasksTotal - stats.prepTasksCompleted} tasks remaining today</p>
                </div>
                <Link to="/prep" className="text-sm text-primary hover:underline">View</Link>
              </div>
            )}
            {stats.lowStockItems === 0 && stats.prepTasksTotal === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">No Alerts</p>
                  <p className="text-xs text-muted-foreground">Everything is running smoothly</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
