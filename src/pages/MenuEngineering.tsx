import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Menu as MenuIcon,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Puzzle,
  DollarSign,
  Percent,
  BarChart3,
  Archive,
  Plus,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useMenuStore } from "@/stores/menuStore";
import { cn } from "@/lib/utils";

const profitabilityConfig = {
  'star': { icon: Star, label: 'Star', color: 'text-warning', bg: 'bg-warning/10', desc: 'High popularity, high margin' },
  'plow-horse': { icon: TrendingUp, label: 'Plow Horse', color: 'text-primary', bg: 'bg-primary/10', desc: 'High popularity, low margin' },
  'puzzle': { icon: Puzzle, label: 'Puzzle', color: 'text-success', bg: 'bg-success/10', desc: 'Low popularity, high margin' },
  'dog': { icon: AlertTriangle, label: 'Dog', color: 'text-destructive', bg: 'bg-destructive/10', desc: 'Low popularity, low margin' },
};

const MenuEngineering = () => {
  const [showArchived, setShowArchived] = useState(false);
  
  const { 
    menus, 
    getActiveMenu, 
    getArchivedMenus, 
    getMenuAnalytics,
    posConnections 
  } = useMenuStore();
  
  const activeMenu = getActiveMenu();
  const archivedMenus = getArchivedMenus();
  const analytics = activeMenu ? getMenuAnalytics(activeMenu.id) : null;

  const connectedPOS = posConnections.find(p => p.isConnected);

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
            <h1 className="page-title font-display">Menu Engineering</h1>
            <p className="page-subtitle">Track costs, analyze profitability, optimize your menu</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Archived ({archivedMenus.length})</span>
            </button>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Menu
            </button>
          </div>
        </motion.div>

        {/* POS Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "card-elevated p-4 border-l-4",
            connectedPOS ? "border-l-success" : "border-l-warning"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", connectedPOS ? "bg-success/10" : "bg-warning/10")}>
                <BarChart3 className={cn("w-5 h-5", connectedPOS ? "text-success" : "text-warning")} />
              </div>
              <div>
                <p className="font-semibold">
                  {connectedPOS ? `Connected to ${connectedPOS.displayName}` : 'No POS Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {connectedPOS 
                    ? `Last sync: ${connectedPOS.lastSync?.toLocaleDateString()}`
                    : 'Connect your POS to import sales data automatically'}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm font-medium">
              {connectedPOS ? 'Manage' : 'Connect POS'}
            </button>
          </div>
        </motion.div>

        {/* Active Menu Overview */}
        {activeMenu && analytics && (
          <>
            {/* Menu Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-elevated p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <MenuIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{activeMenu.name}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      v{activeMenu.version} • {activeMenu.totalItems} items • Since {activeMenu.effectiveFrom.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs">Avg Food Cost</span>
                  </div>
                  <p className="text-2xl font-bold">{activeMenu.avgFoodCostPercent.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Gross Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-success">${analytics.grossProfit.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Star Items</span>
                  </div>
                  <p className="text-2xl font-bold">{activeMenu.items.filter(i => i.profitability === 'star').length}</p>
                </div>
              </div>
            </motion.div>

            {/* Profitability Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <h2 className="section-header mb-0">Menu Matrix</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Items classified by popularity and contribution margin
                </p>
              </div>

              {/* Matrix Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                {(['star', 'plow-horse', 'puzzle', 'dog'] as const).map(type => {
                  const config = profitabilityConfig[type];
                  const items = activeMenu.items.filter(i => i.profitability === type);
                  const Icon = config.icon;

                  return (
                    <div key={type} className="bg-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("p-1.5 rounded-lg", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div>
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-xs text-muted-foreground">{config.desc}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                            <span className="truncate">{item.name}</span>
                            <span className="text-muted-foreground">{item.foodCostPercent.toFixed(1)}%</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{items.length - 3} more
                          </p>
                        )}
                        {items.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            No items
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Menu Items Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card-elevated overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="section-header mb-0">All Menu Items</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to edit pricing and allergens
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Item</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium text-right">Sell Price</th>
                      <th className="px-4 py-3 font-medium text-right">Food Cost</th>
                      <th className="px-4 py-3 font-medium text-right">Cost %</th>
                      <th className="px-4 py-3 font-medium text-right">Margin</th>
                      <th className="px-4 py-3 font-medium text-right">Sales</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeMenu.items.map((item, idx) => {
                      const config = profitabilityConfig[item.profitability];
                      const Icon = config.icon;

                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-1.5 rounded-lg", config.bg)}>
                                <Icon className={cn("w-4 h-4", config.color)} />
                              </div>
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                          <td className="px-4 py-3 text-right font-semibold">${item.sellPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">${item.foodCost.toFixed(2)}</td>
                          <td className={cn(
                            "px-4 py-3 text-right font-medium",
                            item.foodCostPercent > 30 ? "text-destructive" : "text-success"
                          )}>
                            {item.foodCostPercent.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-success font-medium">
                            ${item.contributionMargin.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">{item.popularity}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              config.bg, config.color
                            )}>
                              {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        {/* Archived Menus */}
        {showArchived && archivedMenus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated overflow-hidden"
          >
            <div className="p-5 border-b border-border">
              <h2 className="section-header mb-0">Archived Menus</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Historical menus with preserved cost data
              </p>
            </div>
            <div className="divide-y divide-border">
              {archivedMenus.map(menu => (
                <div key={menu.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Archive className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{menu.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {menu.effectiveFrom.toLocaleDateString()} - {menu.effectiveTo?.toLocaleDateString()}
                        {' • '}{menu.totalItems} items • {menu.avgFoodCostPercent.toFixed(1)}% avg cost
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default MenuEngineering;
