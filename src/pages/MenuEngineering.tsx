import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Menu as MenuIcon,
  TrendingUp,
  Star,
  AlertTriangle,
  Puzzle,
  DollarSign,
  Percent,
  BarChart3,
  Archive,
  Plus,
  MoreVertical,
  Camera,
  Upload,
  FileText,
  Edit2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useMenuStore } from "@/stores/menuStore";
import { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils";
import MenuMatrixChart from "@/components/menu/MenuMatrixChart";
import MenuItemEditDialog from "@/components/menu/MenuItemEditDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const profitabilityConfig = {
  'star': { icon: Star, label: 'Star', color: 'text-warning', bg: 'bg-warning/10', desc: 'High popularity, high margin' },
  'plow-horse': { icon: TrendingUp, label: 'Plow Horse', color: 'text-primary', bg: 'bg-primary/10', desc: 'High popularity, low margin' },
  'puzzle': { icon: Puzzle, label: 'Puzzle', color: 'text-success', bg: 'bg-success/10', desc: 'Low popularity, high margin' },
  'dog': { icon: AlertTriangle, label: 'Dog', color: 'text-destructive', bg: 'bg-destructive/10', desc: 'Low popularity, low margin' },
};

const MenuEngineering = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewMenuDialogOpen, setIsNewMenuDialogOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    menus, 
    getActiveMenu, 
    getArchivedMenus, 
    getMenuAnalytics,
    posConnections,
    updateMenuItem,
    createMenu,
    activateMenu,
    deleteMenuItem,
    addMenuItem,
  } = useMenuStore();
  
  const activeMenu = getActiveMenu();
  const archivedMenus = getArchivedMenus();
  const analytics = activeMenu ? getMenuAnalytics(activeMenu.id) : null;
  const connectedPOS = posConnections.find(p => p.isConnected);

  const handleScanMenu = () => {
    // Trigger file input for camera/image capture
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };

  const handleUploadPDF = () => {
    // Trigger file input for PDF upload
    if (fileInputRef.current) {
      fileInputRef.current.accept = ".pdf,image/*";
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`Menu file "${file.name}" selected. AI parsing coming soon!`);
      // TODO: Implement menu parsing with AI
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleItemSave = (item: MenuItem) => {
    if (activeMenu) {
      updateMenuItem(activeMenu.id, item);
    }
  };

  const handleItemDelete = (itemId: string) => {
    if (activeMenu && deleteMenuItem) {
      deleteMenuItem(activeMenu.id, itemId);
    }
  };

  const handleCreateMenu = () => {
    if (newMenuName.trim()) {
      const newMenu = createMenu(newMenuName.trim());
      activateMenu(newMenu.id);
      setNewMenuName("");
      setIsNewMenuDialogOpen(false);
    }
  };

  const handleAddItem = () => {
    if (!activeMenu || !addMenuItem) return;
    
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      category: "Mains",
      sellPrice: 0,
      foodCost: 0,
      foodCostPercent: 0,
      contributionMargin: 0,
      popularity: 0,
      profitability: "puzzle",
      isActive: true,
      menuId: activeMenu.id,
      allergens: [],
    };
    
    addMenuItem(activeMenu.id, newItem);
    setEditingItem(newItem);
    setIsEditDialogOpen(true);
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
            <button 
              className="btn-primary"
              onClick={() => setIsNewMenuDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Menu
            </button>
          </div>
        </motion.div>

        {/* Scan/Upload Menu Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-elevated p-6"
        >
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Scan or Upload Menu</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a PDF or image of your menu to auto-populate items, categories, and pricing
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary" onClick={handleScanMenu}>
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Menu
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
                  onClick={handleUploadPDF}
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelected}
                />
              </div>
            </div>
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

        {/* No Active Menu State */}
        {!activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-elevated p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <MenuIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Active Menu</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a new menu to start tracking costs and analyzing profitability of your dishes.
            </p>
            <Button onClick={() => setIsNewMenuDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Menu
            </Button>
          </motion.div>
        )}

        {/* Active Menu Content */}
        {activeMenu && (
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
                      v{activeMenu.version} • {activeMenu.items.length} items • Since {activeMenu.effectiveFrom.toLocaleDateString()}
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
                  <p className="text-2xl font-bold">
                    {activeMenu.items.length > 0 
                      ? (activeMenu.items.reduce((sum, i) => sum + i.foodCostPercent, 0) / activeMenu.items.length).toFixed(1)
                      : "0.0"}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${analytics?.totalRevenue.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Gross Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-success">${analytics?.grossProfit.toLocaleString() || 0}</p>
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

            {/* Menu Matrix Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <h2 className="section-header mb-0">Menu Matrix</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on any item to edit. Bubble size = % of total sales.
                </p>
              </div>
              <div className="p-4">
                <MenuMatrixChart 
                  items={activeMenu.items} 
                  onItemClick={handleItemClick}
                />
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
                    Click any row to edit pricing and details
                  </p>
                </div>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {activeMenu.items.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p>No menu items yet. Add your first item to get started.</p>
                </div>
              ) : (
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
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeMenu.items.map((item) => {
                        const config = profitabilityConfig[item.profitability];
                        const Icon = config.icon;

                        return (
                          <tr 
                            key={item.id} 
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => handleItemClick(item)}
                          >
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
                            <td className="px-4 py-3">
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                        {' • '}{menu.items.length} items
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

      {/* Edit Item Dialog */}
      <MenuItemEditDialog
        item={editingItem}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleItemSave}
        onDelete={handleItemDelete}
      />

      {/* New Menu Dialog */}
      <Dialog open={isNewMenuDialogOpen} onOpenChange={setIsNewMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Menu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="menuName">Menu Name</Label>
            <Input
              id="menuName"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="e.g., Spring Menu 2026"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMenuDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMenu} disabled={!newMenuName.trim()}>
              Create Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MenuEngineering;
