import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Package,
  AlertTriangle,
  TrendingDown,
  ArrowUpDown
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  parLevel: number;
  cost: number;
  lastUpdated: string;
  status: "ok" | "low" | "critical";
}

const mockInventory: InventoryItem[] = [
  { id: "1", name: "All-Purpose Flour", category: "Dry Goods", currentStock: 25, unit: "lbs", parLevel: 50, cost: 0.45, lastUpdated: "2 hrs ago", status: "low" },
  { id: "2", name: "Butter (Unsalted)", category: "Dairy", currentStock: 8, unit: "lbs", parLevel: 20, cost: 4.50, lastUpdated: "1 hr ago", status: "low" },
  { id: "3", name: "Heavy Cream", category: "Dairy", currentStock: 6, unit: "qts", parLevel: 10, cost: 3.25, lastUpdated: "3 hrs ago", status: "ok" },
  { id: "4", name: "Fresh Salmon", category: "Proteins", currentStock: 2, unit: "lbs", parLevel: 15, cost: 12.99, lastUpdated: "30 min ago", status: "critical" },
  { id: "5", name: "Olive Oil (EVOO)", category: "Oils", currentStock: 4, unit: "L", parLevel: 6, cost: 15.00, lastUpdated: "1 day ago", status: "ok" },
  { id: "6", name: "Shallots", category: "Produce", currentStock: 3, unit: "lbs", parLevel: 5, cost: 3.00, lastUpdated: "4 hrs ago", status: "ok" },
  { id: "7", name: "Duck Breast", category: "Proteins", currentStock: 1, unit: "lbs", parLevel: 8, cost: 18.50, lastUpdated: "2 hrs ago", status: "critical" },
  { id: "8", name: "White Wine", category: "Beverages", currentStock: 6, unit: "btl", parLevel: 12, cost: 8.00, lastUpdated: "5 hrs ago", status: "low" },
];

const categories = ["All", "Proteins", "Produce", "Dairy", "Dry Goods", "Oils", "Beverages"];

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalCount = mockInventory.filter(i => i.status === "critical").length;
  const lowCount = mockInventory.filter(i => i.status === "low").length;

  const statusStyles = {
    ok: "bg-success/10 text-success",
    low: "bg-warning/10 text-warning",
    critical: "bg-destructive/10 text-destructive",
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
            <h1 className="page-title font-display">Inventory</h1>
            <p className="page-subtitle">{mockInventory.length} items tracked</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </motion.div>

        {/* Alert Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div className="card-elevated p-4 border-l-4 border-l-destructive">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{criticalCount} Critical Items</p>
                <p className="text-sm text-muted-foreground">Need immediate attention</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4 border-l-4 border-l-warning">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{lowCount} Low Stock Items</p>
                <p className="text-sm text-muted-foreground">Below par level</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elevated overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Item <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Par Level</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Cost/Unit</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.category}</td>
                    <td className="p-4 font-medium">{item.currentStock} {item.unit}</td>
                    <td className="p-4 text-muted-foreground">{item.parLevel} {item.unit}</td>
                    <td className="p-4">${item.cost.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        statusStyles[item.status]
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Inventory;
