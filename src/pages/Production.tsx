import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Factory,
  Scale,
  Package2,
  ShoppingCart,
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2,
  Beef
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import RecipeScaler from "@/components/production/RecipeScaler";
import BatchTracker from "@/components/production/BatchTracker";
import OrderGenerator from "@/components/production/OrderGenerator";
import YieldTestTracker from "@/components/production/YieldTestTracker";
import { useProductionStore } from "@/stores/productionStore";
import { useScalableRecipes } from "@/hooks/useScalableRecipes";
import { cn } from "@/lib/utils";

type ProductionView = 'overview' | 'scaling' | 'batches' | 'orders' | 'yield-tests';

const Production = () => {
  const [activeView, setActiveView] = useState<ProductionView>('overview');
  const [showScaler, setShowScaler] = useState(false);
  
  // Load recipes from database into the store
  const { isLoading: recipesLoading } = useScalableRecipes();
  
  const { batches, scalableRecipes, generatedOrders } = useProductionStore();
  
  const activeBatches = batches.filter(b => b.status === 'in-progress').length;
  const plannedBatches = batches.filter(b => b.status === 'planned').length;
  const pendingOrders = generatedOrders.filter(o => o.status === 'draft').length;

  const views = [
    { id: 'overview' as const, label: 'Overview', icon: Factory },
    { id: 'scaling' as const, label: 'Recipe Scaling', icon: Scale },
    { id: 'batches' as const, label: 'Batch Tracking', icon: Package2 },
    { id: 'orders' as const, label: 'Order Generation', icon: ShoppingCart },
    { id: 'yield-tests' as const, label: 'Yield Tests', icon: Beef },
  ];

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
            <h1 className="page-title font-display">Production Management</h1>
            <p className="page-subtitle">Scale recipes, track batches, generate orders</p>
          </div>
          <button onClick={() => setShowScaler(true)} className="btn-primary">
            <Scale className="w-4 h-4 mr-2" />
            Scale Recipe
          </button>
        </motion.div>

        {/* View Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeView === view.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              )}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </motion.div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Scale className="w-4 h-4" />
                  <span className="text-xs">Scalable Recipes</span>
                </div>
                <p className="stat-value">{scalableRecipes.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="stat-card"
              >
                <div className="flex items-center gap-2 text-warning mb-2">
                  <Package2 className="w-4 h-4" />
                  <span className="text-xs">Active Batches</span>
                </div>
                <p className="stat-value">{activeBatches}</p>
                <p className="text-xs text-muted-foreground">{plannedBatches} planned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="stat-card"
              >
                <div className="flex items-center gap-2 text-primary mb-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs">Pending Orders</span>
                </div>
                <p className="stat-value">{pendingOrders}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="stat-card"
              >
                <div className="flex items-center gap-2 text-success mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Today's Production</span>
                </div>
                <p className="stat-value">{batches.filter(b => b.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">batches completed</p>
              </motion.div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowScaler(true)}
                className="card-interactive p-5 text-left"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-3">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Scale a Recipe</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Calculate ingredients for any batch size with yield factors
                </p>
                <span className="text-sm text-primary font-medium flex items-center gap-1">
                  Open Scaler <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => setActiveView('batches')}
                className="card-interactive p-5 text-left"
              >
                <div className="p-3 rounded-xl bg-warning/10 w-fit mb-3">
                  <Package2 className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold mb-1">Track Batches</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Lot codes, production dates, and expiry tracking
                </p>
                <span className="text-sm text-primary font-medium flex items-center gap-1">
                  View Batches <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setActiveView('orders')}
                className="card-interactive p-5 text-left"
              >
                <div className="p-3 rounded-xl bg-success/10 w-fit mb-3">
                  <ShoppingCart className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold mb-1">Generate Orders</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Auto-create purchase orders from prep lists
                </p>
                <span className="text-sm text-primary font-medium flex items-center gap-1">
                  Create Order <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>
            </div>

            {/* Recent Batches Preview */}
            <div className="card-elevated p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-header mb-0">Recent Batches</h2>
                <button 
                  onClick={() => setActiveView('batches')}
                  className="text-sm text-primary font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {batches.slice(0, 3).map((batch, idx) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <Package2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{batch.recipeName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{batch.batchCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{batch.quantity} {batch.unit}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        batch.status === 'completed' ? 'bg-success/10 text-success' :
                        batch.status === 'in-progress' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scaling View */}
        {activeView === 'scaling' && (
          <div className="card-elevated p-6">
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Recipe Scaling Tool</h3>
              <p className="text-muted-foreground mb-4">
                Scale recipes by servings or yield weight with automatic waste calculations
              </p>
              <button onClick={() => setShowScaler(true)} className="btn-primary">
                <Scale className="w-4 h-4 mr-2" />
                Open Recipe Scaler
              </button>
            </div>
          </div>
        )}

        {/* Batches View */}
        {activeView === 'batches' && (
          <BatchTracker onCreateBatch={() => setShowScaler(true)} />
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <OrderGenerator />
        )}

        {/* Yield Tests View */}
        {activeView === 'yield-tests' && (
          <YieldTestTracker />
        )}

        {/* Recipe Scaler Modal */}
        <RecipeScaler
          isOpen={showScaler}
          onClose={() => setShowScaler(false)}
        />
      </div>
    </AppLayout>
  );
};

export default Production;
