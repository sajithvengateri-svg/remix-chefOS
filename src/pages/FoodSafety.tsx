import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Truck,
  Phone,
  Mail,
  ExternalLink,
  Search,
  Pencil,
  Trash2,
  X,
  Save
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SafetyLog {
  id: string;
  type: "temperature" | "cleaning" | "receiving" | "cooking";
  location: string;
  value?: string;
  status: "passed" | "warning" | "failed";
  recordedBy: string;
  time: string;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  products: string;
  repName?: string;
  phone?: string;
  email?: string;
  website?: string;
  creditStatus?: "done" | "applied" | "approved" | "pending";
}

const mockLogs: SafetyLog[] = [
  { id: "1", type: "temperature", location: "Walk-in Cooler", value: "36°F", status: "passed", recordedBy: "James", time: "8:00 AM" },
  { id: "2", type: "temperature", location: "Freezer", value: "-5°F", status: "passed", recordedBy: "James", time: "8:05 AM" },
  { id: "3", type: "temperature", location: "Prep Cooler", value: "42°F", status: "warning", recordedBy: "Maria", time: "10:00 AM" },
  { id: "4", type: "cooking", location: "Chicken Internal Temp", value: "168°F", status: "passed", recordedBy: "Alex", time: "11:30 AM" },
  { id: "5", type: "receiving", location: "Produce Delivery", value: "Visual OK", status: "passed", recordedBy: "Maria", time: "7:00 AM" },
  { id: "6", type: "cleaning", location: "Prep Station 1", status: "passed", recordedBy: "James", time: "3:00 PM" },
];

const initialSuppliers: Supplier[] = [
  // Meat
  { id: "1", name: "Food & Wine Concepts", category: "Meat", products: "Beef, Chicken, Duck", repName: "Daniel", phone: "0412 107 281", email: "sales@fwconcepts.com.au", website: "https://www.fwconcepts.com.au", creditStatus: "done" },
  { id: "2", name: "Stanbroke Meats", category: "Meat", products: "Beef", repName: "Jimmy", phone: "0447 773 372", email: "jamesb@stanbrokefoods.com", website: "https://www.stanbroke.com", creditStatus: "done" },
  { id: "3", name: "Haverick Meats", category: "Meat", products: "Meats", repName: "Mark", phone: "0448 554 220", email: "mark@haverickmeats.com.au", website: "https://www.haverickmeats.com.au" },
  { id: "4", name: "Mount Byron Pork", category: "Meat", products: "Pork", repName: "Adrian", phone: "0408 076 940", email: "mtbyronporkbeef@gmail.com" },
  { id: "5", name: "Gooralie Pork", category: "Meat", products: "Pork", repName: "John", phone: "0420 904 678", email: "john@gooralie.com.au", website: "https://www.gooraliefreerangepork.com.au" },
  { id: "6", name: "Schultz Farm Pork", category: "Meat", products: "Suckling Pig", repName: "Von", website: "https://www.schultzfamilyfarms.com.au" },
  { id: "7", name: "Hand Sourced", category: "Meat", products: "Chicken, Duck", repName: "Shirley", phone: "0419 714 274", email: "shirley@handsourced.com.au", website: "https://www.handsourced.com.au" },
  { id: "8", name: "Burrawong Gaian", category: "Meat", products: "Duck", repName: "Beth/Hayden", phone: "0411 161 942", email: "burrawonggaian26@gmail.com", website: "http://burrawonggaian.com" },
  { id: "9", name: "PA Halal", category: "Meat", products: "Goat", repName: "Mohammad", phone: "0421 839 880", website: "https://www.pahalalbutcher.com.au" },
  // Fish
  { id: "11", name: "Franks Seafood", category: "Fish", products: "Fish, Seafood", repName: "Micheal", phone: "0492 281 938", email: "sales@franksseafood.net.au", website: "https://franksseafood.net.au" },
  { id: "12", name: "Oceanmade", category: "Fish", products: "Fish, Seafood", repName: "Jason", phone: "0413 570 553", email: "jason@oceanmade.com.au", website: "http://www.oceanmade.com.au", creditStatus: "done" },
  { id: "13", name: "Fish Factory", category: "Fish", products: "Fish, Seafood", website: "https://www.fishfactory.com.au" },
  { id: "14", name: "Custom Seafood", category: "Fish", products: "Fish, Seafood", repName: "Gai Quickley", phone: "0401 261 961", email: "gquilkey@customseafood.com.au", website: "https://customseafood.com.au" },
  { id: "15", name: "Two Hands", category: "Fish", products: "Fish, Seafood", repName: "Andrew/Shaun", phone: "0404 374 708", email: "shaun.stewart@twohands.world", website: "https://www.2hs.info" },
  // Cheese
  { id: "17", name: "Calendar Cheese Company", category: "Cheese", products: "Cheese", repName: "Marcel", phone: "0434 724 522", email: "mnogaski@calendarcheese.com.au", website: "https://www.calendarcheese.com.au" },
  { id: "18", name: "Gourmet Goods", category: "Cheese", products: "Cheese", repName: "Pierre", phone: "0434 907 436", email: "info@ggoods.com.au", website: "https://ggoods.com.au", creditStatus: "done" },
  // Pantry
  { id: "21", name: "Fino Foods", category: "Pantry", products: "Cheese, Pantry", repName: "Karen", phone: "0448 483 311", website: "https://www.finofoods.com.au", creditStatus: "applied" },
  { id: "22", name: "Emporium Aquila", category: "Pantry", products: "Cheese, Pantry", repName: "Nicola di Carolo", phone: "0404 213 940", email: "nicola@emporiumaquila.com.au", website: "https://emporiumaquila.com.au" },
  { id: "23", name: "Inalca Foods", category: "Pantry", products: "Cheese", repName: "Alun", phone: "0437 993 360", website: "https://inalcafb.com.au" },
  { id: "24", name: "Moco Food Service", category: "Pantry", products: "Pantry", repName: "Daniel Bridge", phone: "0407 643 684", website: "https://www.mocofoodservices.com.au" },
  { id: "25", name: "Superior Foods", category: "Pantry", products: "Pantry", repName: "Anna", website: "https://superiorfs.com.au" },
  { id: "26", name: "Eustralis Foods", category: "Pantry", products: "Chocolate", repName: "Zack", phone: "0421 009 046", email: "zacharie@eustralis.com.au", website: "http://www.eustralis.com.au" },
  { id: "27", name: "ACIT", category: "Pantry", products: "Olive Oil", repName: "Mark", phone: "0409 723 573", email: "Mark.woodward@acitgroup.com.au", website: "https://acitgroup.com.au" },
  { id: "28", name: "Truffle Lady", category: "Pantry", products: "Truffle", repName: "Debbie", phone: "0419 774 070", email: "debbieoliver@live.com.au", website: "https://debbieoliver.com.au" },
  // Veg
  { id: "31", name: "Midyimeco", category: "Veg", products: "Peppers", repName: "Richard", phone: "0415 151 229", email: "midyimeco@gmail.com", website: "https://www.midyimeco.com.au" },
  { id: "32", name: "Fruit Thyme", category: "Veg", products: "Vegetables", repName: "Colm", phone: "0412 270 118", email: "orders@fruitthyme.com", website: "https://fruitthyme.com", creditStatus: "approved" },
  { id: "33", name: "Little Acre", category: "Veg", products: "Mushrooms", repName: "Sof", phone: "0410 892 416", email: "sales@littleacre.com.au", website: "https://littleacre.com.au", creditStatus: "applied" },
  { id: "34", name: "Falls Farm", category: "Veg", products: "Salad, Produce", repName: "Bob", phone: "0439 375 983", email: "hello@thefallsfarm.com", website: "https://thefallsfarm.com" },
  // Supplies
  { id: "37", name: "Total Choice", category: "Supplies", products: "Chemicals", repName: "Gary", phone: "0413 709 289", website: "https://www.totalchoice.com.au" },
  { id: "38", name: "QCC", category: "Supplies", products: "Hospitality Supplies", repName: "Paul Aldridge", phone: "0449 635 343", email: "palldridge@qcc.com.au", website: "https://www.qcc.com.au" },
  { id: "39", name: "Reward Hospitality", category: "Supplies", products: "Hospitality Supplies", repName: "Christine Hill", phone: "0429 091 127", email: "CHill@RewardH.com.au", website: "https://www.rewardhospitality.com.au" },
  { id: "40", name: "Ember Industries", category: "Supplies", products: "Firepits, Equipment", repName: "Emmett", phone: "0422 753 090", email: "emmet@live.com.au", website: "https://www.emberindustriesaustralia.com" },
];

const categories = ["All", "Meat", "Fish", "Cheese", "Pantry", "Veg", "Supplies"];
const categoryOptions = ["Meat", "Fish", "Cheese", "Pantry", "Veg", "Supplies"];
const creditStatusOptions = ["done", "applied", "approved", "pending"];

const statusStyles = {
  passed: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
  warning: { bg: "bg-warning/10", text: "text-warning", icon: AlertTriangle },
  failed: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
};

const creditStyles: Record<string, { bg: string; text: string }> = {
  done: { bg: "bg-success/10", text: "text-success" },
  approved: { bg: "bg-success/10", text: "text-success" },
  applied: { bg: "bg-warning/10", text: "text-warning" },
  pending: { bg: "bg-muted", text: "text-muted-foreground" },
};

const typeLabels = {
  temperature: "Temperature Check",
  cleaning: "Cleaning Log",
  receiving: "Receiving Log",
  cooking: "Cooking Temperature",
};

const emptySupplier: Supplier = {
  id: "",
  name: "",
  category: "Meat",
  products: "",
  repName: "",
  phone: "",
  email: "",
  website: "",
  creditStatus: "pending",
};

const FoodSafety = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [supplierCategory, setSupplierCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  
  // Edit/Add modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Supplier>(emptySupplier);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const passedCount = mockLogs.filter(l => l.status === "passed").length;
  const warningCount = mockLogs.filter(l => l.status === "warning").length;

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = supplierCategory === "All" || s.category === supplierCategory;
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.products.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.repName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingSupplier(null);
    setFormData({ ...emptySupplier, id: `supplier-${Date.now()}` });
    setEditDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (editingSupplier) {
      // Update existing
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? formData : s));
      toast.success("Supplier updated");
    } else {
      // Add new
      setSuppliers(prev => [...prev, formData]);
      toast.success("Supplier added");
    }
    setEditDialogOpen(false);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      toast.success("Supplier deleted");
    }
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  const updateFormField = (field: keyof Supplier, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Food Safety</h1>
            <p className="page-subtitle">HACCP compliance, logs & approved suppliers</p>
          </div>
          <Button 
            className="btn-primary"
            onClick={activeTab === "suppliers" ? handleAddNew : undefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === "logs" ? "New Log Entry" : "Add Supplier"}
          </Button>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Safety Logs
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Approved Suppliers
            </TabsTrigger>
          </TabsList>

          {/* Safety Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-success/10 w-fit">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="stat-value">{passedCount}</p>
                  <p className="stat-label">Passed Today</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-warning/10 w-fit">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="stat-value">{warningCount}</p>
                  <p className="stat-label">Warnings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Thermometer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="stat-value">12</p>
                  <p className="stat-label">Temp Logs Due</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-accent/10 w-fit">
                  <FileCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="stat-value">98%</p>
                  <p className="stat-label">Compliance Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Logs List */}
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="section-header mb-0">Today's Logs</h2>
              </div>
              <div className="divide-y divide-border">
                {mockLogs.map((log) => {
                  const style = statusStyles[log.status];
                  const StatusIcon = style.icon;
                  
                  return (
                    <div 
                      key={log.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className={cn("p-2.5 rounded-xl", style.bg)}>
                        <StatusIcon className={cn("w-5 h-5", style.text)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{log.location}</p>
                        <p className="text-sm text-muted-foreground">{typeLabels[log.type]}</p>
                      </div>

                      {log.value && (
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{log.value}</p>
                        </div>
                      )}

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground">{log.recordedBy}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Approved Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers, products, reps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSupplierCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      supplierCategory === cat 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-secondary"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Suppliers Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="stat-value">{suppliers.length}</p>
                  <p className="stat-label">Total Suppliers</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-success/10 w-fit">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="stat-value">{suppliers.filter(s => s.creditStatus === "done" || s.creditStatus === "approved").length}</p>
                  <p className="stat-label">Credit Approved</p>
                </div>
              </div>
            </div>

            {/* Suppliers List */}
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h2 className="section-header mb-0">
                  {supplierCategory === "All" ? "All Suppliers" : supplierCategory} ({filteredSuppliers.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {filteredSuppliers.map((supplier) => (
                  <div 
                    key={supplier.id}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <Truck className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{supplier.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {supplier.category}
                          </span>
                          {supplier.creditStatus && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              creditStyles[supplier.creditStatus]?.bg || "bg-muted",
                              creditStyles[supplier.creditStatus]?.text || "text-muted-foreground"
                            )}>
                              {supplier.creditStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{supplier.products}</p>
                        {supplier.repName && (
                          <p className="text-sm text-muted-foreground">Rep: {supplier.repName}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {supplier.phone && (
                          <a 
                            href={`tel:${supplier.phone}`}
                            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {supplier.email && (
                          <a 
                            href={`mailto:${supplier.email}`}
                            className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {supplier.website && (
                          <a 
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                            title="Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier)}
                          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit/Add Supplier Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormField("name", e.target.value)}
                    placeholder="Supplier name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => updateFormField("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="creditStatus">Credit Status</Label>
                  <Select 
                    value={formData.creditStatus || "pending"} 
                    onValueChange={(value) => updateFormField("creditStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creditStatusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="products">Products</Label>
                  <Input
                    id="products"
                    value={formData.products}
                    onChange={(e) => updateFormField("products", e.target.value)}
                    placeholder="e.g., Beef, Chicken, Pork"
                  />
                </div>
                
                <div>
                  <Label htmlFor="repName">Rep Name</Label>
                  <Input
                    id="repName"
                    value={formData.repName || ""}
                    onChange={(e) => updateFormField("repName", e.target.value)}
                    placeholder="Contact person"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => updateFormField("phone", e.target.value)}
                    placeholder="0400 000 000"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateFormField("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ""}
                    onChange={(e) => updateFormField("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingSupplier ? "Save Changes" : "Add Supplier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Supplier</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{supplierToDelete?.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default FoodSafety;
