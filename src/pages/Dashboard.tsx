import { motion } from "framer-motion";
import { 
  ChefHat, 
  ClipboardCheck, 
  Package, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import PrepListWidget from "@/components/dashboard/PrepListWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
            value="12"
            subValue="4 completed"
            trend="+2 from yesterday"
            color="primary"
          />
          <StatCard
            icon={ChefHat}
            label="Active Recipes"
            value="48"
            subValue="3 new this week"
            color="accent"
          />
          <StatCard
            icon={Package}
            label="Low Stock Items"
            value="7"
            subValue="Need attention"
            trend="urgent"
            color="warning"
          />
          <StatCard
            icon={TrendingUp}
            label="Food Cost"
            value="28.5%"
            subValue="Target: 30%"
            trend="On track"
            color="success"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActions />
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
            <PrepListWidget />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentActivity />
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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Temperature Log Due</p>
                <p className="text-xs text-muted-foreground">Walk-in cooler check overdue by 2 hours</p>
              </div>
              <button className="btn-primary text-sm py-1.5 px-3">Log Now</button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Prep List Review</p>
                <p className="text-xs text-muted-foreground">Tomorrow's prep list ready for review</p>
              </div>
              <Link to="/prep" className="text-sm text-primary hover:underline">Review</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
