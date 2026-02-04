import { useState, useEffect, useRef } from "react";
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
  Save,
  Camera,
  Loader2,
  SprayCan,
  Package,
  Image
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface SafetyLog {
  id: string;
  log_type: "temperature" | "cleaning" | "receiving" | "delivery";
  location: string | null;
  readings: Record<string, unknown> | null;
  status: "pass" | "warning" | "fail" | null;
  recorded_by_name: string | null;
  time: string;
  date: string;
  notes: string | null;
  corrective_action: string | null;
  reference_image_url?: string | null;
  verification_image_url?: string | null;
  ai_verification_status?: string | null;
  ai_verification_notes?: string | null;
}

interface CleaningArea {
  id: string;
  name: string;
  location: string | null;
  reference_image_url: string | null;
  cleaning_frequency: string;
  instructions: string | null;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  products: string | null;
  rep_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  credit_status: string | null;
}

const logTypes = [
  { value: "temperature", label: "Temperature Check", icon: Thermometer },
  { value: "cleaning", label: "Cleaning Log", icon: SprayCan },
  { value: "receiving", label: "Receiving Log", icon: Package },
];

const statusStyles = {
  pass: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2, label: "Passed" },
  warning: { bg: "bg-warning/10", text: "text-warning", icon: AlertTriangle, label: "Warning" },
  fail: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle, label: "Failed" },
};

const creditStyles: Record<string, { bg: string; text: string }> = {
  done: { bg: "bg-success/10", text: "text-success" },
  approved: { bg: "bg-success/10", text: "text-success" },
  applied: { bg: "bg-warning/10", text: "text-warning" },
  pending: { bg: "bg-muted", text: "text-muted-foreground" },
};

const categories = ["All", "Meat", "Fish", "Cheese", "Pantry", "Veg", "Supplies"];

const FoodSafety = () => {
  const { user, canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState("logs");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [supplierCategory, setSupplierCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data states
  const [logs, setLogs] = useState<SafetyLog[]>([]);
  const [cleaningAreas, setCleaningAreas] = useState<CleaningArea[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  
  // Edit states
  const [editingLog, setEditingLog] = useState<SafetyLog | null>(null);
  const [editingArea, setEditingArea] = useState<CleaningArea | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; item: SafetyLog | CleaningArea | Supplier } | null>(null);
  
  // Verification states
  const [verifyingArea, setVerifyingArea] = useState<CleaningArea | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ status: string; notes: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceFileRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [logForm, setLogForm] = useState({
    log_type: "temperature" as SafetyLog["log_type"],
    location: "",
    readings: {} as Record<string, string>,
    status: "pass" as "pass" | "warning" | "fail",
    notes: "",
    corrective_action: "",
  });
  
  const [areaForm, setAreaForm] = useState({
    name: "",
    location: "",
    cleaning_frequency: "daily",
    instructions: "",
    reference_image_url: "",
  });
  
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    category: "Meat",
    products: "",
    rep_name: "",
    phone: "",
    email: "",
    website: "",
    credit_status: "pending",
  });
  
  const hasEditPermission = canEdit("food-safety");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [logsRes, areasRes, suppliersRes] = await Promise.all([
      supabase.from("food_safety_logs").select("*").order("date", { ascending: false }).order("time", { ascending: false }),
      supabase.from("cleaning_areas").select("*").order("name"),
      supabase.from("suppliers").select("*").order("name"),
    ]);

    if (logsRes.data) {
      setLogs(logsRes.data.map(log => ({
        ...log,
        readings: (log.readings || {}) as Record<string, unknown>,
        log_type: log.log_type as SafetyLog["log_type"],
        status: log.status as SafetyLog["status"],
      })));
    }
    if (areasRes.data) setCleaningAreas(areasRes.data);
    if (suppliersRes.data) setSuppliers(suppliersRes.data);
    
    setLoading(false);
  };

  // Log CRUD
  const handleSaveLog = async () => {
    if (!logForm.location.trim()) {
      toast.error("Location is required");
      return;
    }

    const payload = {
      log_type: logForm.log_type,
      location: logForm.location,
      readings: logForm.readings,
      status: logForm.status,
      notes: logForm.notes || null,
      corrective_action: logForm.corrective_action || null,
      recorded_by: user?.id,
      recorded_by_name: user?.email?.split("@")[0] || "Unknown",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0],
    };

    if (editingLog) {
      const { error } = await supabase.from("food_safety_logs").update(payload).eq("id", editingLog.id);
      if (error) {
        toast.error("Failed to update log");
        return;
      }
      toast.success("Log updated");
    } else {
      const { error } = await supabase.from("food_safety_logs").insert(payload);
      if (error) {
        toast.error("Failed to create log");
        return;
      }
      toast.success("Log created");
    }

    resetLogForm();
    fetchData();
  };

  const resetLogForm = () => {
    setLogDialogOpen(false);
    setEditingLog(null);
    setLogForm({
      log_type: "temperature",
      location: "",
      readings: {},
      status: "pass",
      notes: "",
      corrective_action: "",
    });
  };

  // Area CRUD
  const handleSaveArea = async () => {
    if (!areaForm.name.trim()) {
      toast.error("Area name is required");
      return;
    }

    const payload = {
      name: areaForm.name,
      location: areaForm.location || null,
      cleaning_frequency: areaForm.cleaning_frequency,
      instructions: areaForm.instructions || null,
      reference_image_url: areaForm.reference_image_url || null,
    };

    if (editingArea) {
      const { error } = await supabase.from("cleaning_areas").update(payload).eq("id", editingArea.id);
      if (error) {
        toast.error("Failed to update area");
        return;
      }
      toast.success("Area updated");
    } else {
      const { error } = await supabase.from("cleaning_areas").insert(payload);
      if (error) {
        toast.error("Failed to create area");
        return;
      }
      toast.success("Area created");
    }

    resetAreaForm();
    fetchData();
  };

  const resetAreaForm = () => {
    setAreaDialogOpen(false);
    setEditingArea(null);
    setAreaForm({
      name: "",
      location: "",
      cleaning_frequency: "daily",
      instructions: "",
      reference_image_url: "",
    });
  };

  // Supplier CRUD
  const handleSaveSupplier = async () => {
    if (!supplierForm.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    const payload = {
      name: supplierForm.name,
      category: supplierForm.category,
      products: supplierForm.products || null,
      rep_name: supplierForm.rep_name || null,
      phone: supplierForm.phone || null,
      email: supplierForm.email || null,
      website: supplierForm.website || null,
      credit_status: supplierForm.credit_status,
    };

    if (editingSupplier) {
      const { error } = await supabase.from("suppliers").update(payload).eq("id", editingSupplier.id);
      if (error) {
        toast.error("Failed to update supplier");
        return;
      }
      toast.success("Supplier updated");
    } else {
      const { error } = await supabase.from("suppliers").insert(payload);
      if (error) {
        toast.error("Failed to create supplier");
        return;
      }
      toast.success("Supplier created");
    }

    resetSupplierForm();
    fetchData();
  };

  const resetSupplierForm = () => {
    setSupplierDialogOpen(false);
    setEditingSupplier(null);
    setSupplierForm({
      name: "",
      category: "Meat",
      products: "",
      rep_name: "",
      phone: "",
      email: "",
      website: "",
      credit_status: "pending",
    });
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deletingItem) return;

    let error;
    if (deletingItem.type === "log") {
      ({ error } = await supabase.from("food_safety_logs").delete().eq("id", (deletingItem.item as SafetyLog).id));
    } else if (deletingItem.type === "area") {
      ({ error } = await supabase.from("cleaning_areas").delete().eq("id", (deletingItem.item as CleaningArea).id));
    } else if (deletingItem.type === "supplier") {
      ({ error } = await supabase.from("suppliers").delete().eq("id", (deletingItem.item as Supplier).id));
    }

    if (error) {
      toast.error("Failed to delete");
      return;
    }

    toast.success("Deleted successfully");
    setDeleteDialogOpen(false);
    setDeletingItem(null);
    fetchData();
  };

  // Photo upload
  const uploadPhoto = async (file: File, folder: string): Promise<string | null> => {
    const fileName = `${folder}/${user?.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cleaning-photos").upload(fileName, file);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from("cleaning-photos").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading reference photo...");
    const url = await uploadPhoto(file, "references");
    toast.dismiss();
    
    if (url) {
      setAreaForm({ ...areaForm, reference_image_url: url });
      toast.success("Reference photo uploaded");
    }
  };

  const handleVerificationPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading verification photo...");
    const url = await uploadPhoto(file, "verifications");
    toast.dismiss();
    
    if (url) {
      setVerificationImage(url);
      toast.success("Photo uploaded");
    }
  };

  // AI Verification
  const handleVerify = async () => {
    if (!verifyingArea?.reference_image_url || !verificationImage) {
      toast.error("Both reference and verification photos are required");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-cleaning", {
        body: {
          referenceImageUrl: verifyingArea.reference_image_url,
          verificationImageUrl: verificationImage,
          areaName: verifyingArea.name,
        },
      });

      if (error) throw error;

      setVerificationResult({
        status: data.status,
        notes: data.notes,
      });

      // Create a cleaning log with verification
      await supabase.from("food_safety_logs").insert({
        log_type: "cleaning",
        location: verifyingArea.name,
        status: data.status === "approved" ? "pass" : "fail",
        recorded_by: user?.id,
        recorded_by_name: user?.email?.split("@")[0] || "Unknown",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
        reference_image_url: verifyingArea.reference_image_url,
        verification_image_url: verificationImage,
        ai_verification_status: data.status,
        ai_verification_notes: data.notes,
        notes: `AI Verification: ${data.notes}`,
      });

      toast.success(data.status === "approved" ? "Cleaning approved!" : "Cleaning needs attention");
      fetchData();
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerifyDialogOpen(false);
    setVerifyingArea(null);
    setVerificationImage(null);
    setVerificationResult(null);
  };

  // Filtered data
  const filteredLogs = logs.filter(log => 
    logTypeFilter === "all" || log.log_type === logTypeFilter
  );

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = supplierCategory === "All" || s.category === supplierCategory;
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.products?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const passedCount = logs.filter(l => l.status === "pass").length;
  const warningCount = logs.filter(l => l.status === "warning" || l.status === "fail").length;

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
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-2">
              <SprayCan className="w-4 h-4" />
              <span className="hidden sm:inline">Cleaning</span>
            </TabsTrigger>
            <TabsTrigger value="receiving" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Receiving</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
          </TabsList>

          {/* Safety Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {["all", ...logTypes.map(t => t.value)].map(type => (
                  <button
                    key={type}
                    onClick={() => setLogTypeFilter(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      logTypeFilter === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {type === "all" ? "All" : logTypes.find(t => t.value === type)?.label}
                  </button>
                ))}
              </div>
              {hasEditPermission && (
                <Button onClick={() => setLogDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Log
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-success/10 w-fit">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="stat-value">{passedCount}</p>
                  <p className="stat-label">Passed</p>
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
            </div>

            {/* Logs List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="card-elevated overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const style = statusStyles[log.status || "pass"];
                    const StatusIcon = style.icon;
                    const typeInfo = logTypes.find(t => t.value === log.log_type);
                    
                    return (
                      <div 
                        key={log.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className={cn("p-2.5 rounded-xl", style.bg)}>
                          <StatusIcon className={cn("w-5 h-5", style.text)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{log.location}</p>
                          <p className="text-sm text-muted-foreground">{typeInfo?.label}</p>
                        </div>

                        {log.ai_verification_status && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            log.ai_verification_status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          )}>
                            AI {log.ai_verification_status}
                          </span>
                        )}

                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-foreground">{log.recorded_by_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {log.time?.slice(0, 5)}
                          </p>
                        </div>

                        {hasEditPermission && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingLog(log);
                                setLogForm({
                                  log_type: log.log_type,
                                  location: log.location || "",
                                  readings: log.readings as Record<string, string> || {},
                                  status: log.status || "pass",
                                  notes: log.notes || "",
                                  corrective_action: log.corrective_action || "",
                                });
                                setLogDialogOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-muted"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingItem({ type: "log", item: log });
                                setDeleteDialogOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No logs found
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Cleaning Schedule Tab */}
          <TabsContent value="cleaning" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-header mb-0">Cleaning Areas</h2>
              {hasEditPermission && (
                <Button onClick={() => setAreaDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Area
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Set up cleaning areas with reference photos. Staff can verify cleaning by taking a photo that AI will compare against the reference.
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cleaningAreas.map((area) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-elevated p-4"
                  >
                    {area.reference_image_url ? (
                      <img 
                        src={area.reference_image_url} 
                        alt={area.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <h3 className="font-semibold">{area.name}</h3>
                    <p className="text-sm text-muted-foreground">{area.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Frequency: {area.cleaning_frequency}
                    </p>

                    <div className="flex gap-2 mt-3">
                      {area.reference_image_url && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setVerifyingArea(area);
                            setVerifyDialogOpen(true);
                          }}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      {hasEditPermission && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingArea(area);
                              setAreaForm({
                                name: area.name,
                                location: area.location || "",
                                cleaning_frequency: area.cleaning_frequency,
                                instructions: area.instructions || "",
                                reference_image_url: area.reference_image_url || "",
                              });
                              setAreaDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeletingItem({ type: "area", item: area });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}

                {cleaningAreas.length === 0 && (
                  <div className="col-span-full card-elevated p-12 text-center">
                    <SprayCan className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No cleaning areas set up</p>
                    {hasEditPermission && (
                      <Button variant="outline" className="mt-4" onClick={() => setAreaDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Area
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Receiving Log Tab */}
          <TabsContent value="receiving" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-header mb-0">Receiving Logs</h2>
              {hasEditPermission && (
                <Button onClick={() => {
                  setLogForm({ ...logForm, log_type: "receiving" });
                  setLogDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Delivery
                </Button>
              )}
            </div>

            <div className="card-elevated overflow-hidden">
              <div className="divide-y divide-border">
                {logs.filter(l => l.log_type === "receiving").map((log) => {
                  const style = statusStyles[log.status || "pass"];
                  const StatusIcon = style.icon;
                  
                  return (
                    <div 
                      key={log.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn("p-2.5 rounded-xl", style.bg)}>
                        <StatusIcon className={cn("w-5 h-5", style.text)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{log.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.date), "MMM d, yyyy")}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground">{log.recorded_by_name}</p>
                        <p className="text-xs text-muted-foreground">{log.time?.slice(0, 5)}</p>
                      </div>

                      {hasEditPermission && (
                        <button
                          onClick={() => {
                            setDeletingItem({ type: "log", item: log });
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {logs.filter(l => l.log_type === "receiving").length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No receiving logs
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {hasEditPermission && (
                <Button onClick={() => setSupplierDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSupplierCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    supplierCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="card-elevated p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        {supplier.credit_status && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs capitalize",
                            creditStyles[supplier.credit_status]?.bg,
                            creditStyles[supplier.credit_status]?.text
                          )}>
                            {supplier.credit_status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{supplier.products}</p>
                      {supplier.rep_name && (
                        <p className="text-xs text-muted-foreground">Rep: {supplier.rep_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {supplier.phone && (
                        <a href={`tel:${supplier.phone}`} className="p-2 rounded-lg hover:bg-muted">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {supplier.email && (
                        <a href={`mailto:${supplier.email}`} className="p-2 rounded-lg hover:bg-muted">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {supplier.website && (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {hasEditPermission && (
                        <>
                          <button
                            onClick={() => {
                              setEditingSupplier(supplier);
                              setSupplierForm({
                                name: supplier.name,
                                category: supplier.category,
                                products: supplier.products || "",
                                rep_name: supplier.rep_name || "",
                                phone: supplier.phone || "",
                                email: supplier.email || "",
                                website: supplier.website || "",
                                credit_status: supplier.credit_status || "pending",
                              });
                              setSupplierDialogOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-muted"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingItem({ type: "supplier", item: supplier });
                              setDeleteDialogOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {filteredSuppliers.length === 0 && (
                  <div className="card-elevated p-12 text-center">
                    <Truck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No suppliers found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Log Dialog */}
        <Dialog open={logDialogOpen} onOpenChange={resetLogForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLog ? "Edit Log" : "New Safety Log"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Log Type</Label>
                <Select
                  value={logForm.log_type}
                  onValueChange={(v: SafetyLog["log_type"]) => setLogForm({ ...logForm, log_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location / Item *</Label>
                <Input
                  value={logForm.location}
                  onChange={(e) => setLogForm({ ...logForm, location: e.target.value })}
                  placeholder="e.g., Walk-in Cooler, Chicken Delivery"
                />
              </div>
              {logForm.log_type === "temperature" && (
                <div className="space-y-2">
                  <Label>Temperature Reading</Label>
                  <Input
                    value={logForm.readings.value as string || ""}
                    onChange={(e) => setLogForm({ ...logForm, readings: { value: e.target.value } })}
                    placeholder="e.g., 36°F"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={logForm.status}
                  onValueChange={(v: "pass" | "warning" | "fail") => setLogForm({ ...logForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              {logForm.status !== "pass" && (
                <div className="space-y-2">
                  <Label>Corrective Action</Label>
                  <Textarea
                    value={logForm.corrective_action}
                    onChange={(e) => setLogForm({ ...logForm, corrective_action: e.target.value })}
                    placeholder="What was done to fix the issue?"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetLogForm}>Cancel</Button>
              <Button onClick={handleSaveLog}>{editingLog ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Area Dialog */}
        <Dialog open={areaDialogOpen} onOpenChange={resetAreaForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingArea ? "Edit Cleaning Area" : "New Cleaning Area"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Area Name *</Label>
                <Input
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  placeholder="e.g., Prep Station 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={areaForm.location}
                  onChange={(e) => setAreaForm({ ...areaForm, location: e.target.value })}
                  placeholder="e.g., Main Kitchen"
                />
              </div>
              <div className="space-y-2">
                <Label>Cleaning Frequency</Label>
                <Select
                  value={areaForm.cleaning_frequency}
                  onValueChange={(v) => setAreaForm({ ...areaForm, cleaning_frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference Photo</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={referenceFileRef}
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => referenceFileRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Reference
                  </Button>
                  {areaForm.reference_image_url && (
                    <img src={areaForm.reference_image_url} alt="Reference" className="w-16 h-16 object-cover rounded" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={areaForm.instructions}
                  onChange={(e) => setAreaForm({ ...areaForm, instructions: e.target.value })}
                  placeholder="Cleaning instructions..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetAreaForm}>Cancel</Button>
              <Button onClick={handleSaveArea}>{editingArea ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Supplier Dialog */}
        <Dialog open={supplierDialogOpen} onOpenChange={resetSupplierForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={supplierForm.category}
                    onValueChange={(v) => setSupplierForm({ ...supplierForm, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Products</Label>
                <Input
                  value={supplierForm.products}
                  onChange={(e) => setSupplierForm({ ...supplierForm, products: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rep Name</Label>
                  <Input
                    value={supplierForm.rep_name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, rep_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={supplierForm.website}
                    onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Credit Status</Label>
                <Select
                  value={supplierForm.credit_status}
                  onValueChange={(v) => setSupplierForm({ ...supplierForm, credit_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetSupplierForm}>Cancel</Button>
              <Button onClick={handleSaveSupplier}>{editingSupplier ? "Save" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Verification Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={resetVerification}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Verify Cleaning: {verifyingArea?.name}</DialogTitle>
              <DialogDescription>
                Take a photo of the cleaned area. AI will compare it to the reference photo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Reference (Clean)</Label>
                  {verifyingArea?.reference_image_url && (
                    <img 
                      src={verifyingArea.reference_image_url} 
                      alt="Reference"
                      className="w-full h-40 object-cover rounded-lg mt-1"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Your Photo</Label>
                  {verificationImage ? (
                    <img 
                      src={verificationImage} 
                      alt="Verification"
                      className="w-full h-40 object-cover rounded-lg mt-1"
                    />
                  ) : (
                    <div 
                      className="w-full h-40 bg-muted rounded-lg mt-1 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Take Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleVerificationPhotoCapture}
                  />
                </div>
              </div>

              {verificationResult && (
                <div className={cn(
                  "p-4 rounded-lg",
                  verificationResult.status === "approved" ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.status === "approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="font-semibold capitalize">{verificationResult.status}</span>
                  </div>
                  <p className="text-sm">{verificationResult.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetVerification}>Cancel</Button>
              {!verificationResult && (
                <Button 
                  onClick={handleVerify} 
                  disabled={!verificationImage || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify with AI
                    </>
                  )}
                </Button>
              )}
              {verificationResult && (
                <Button onClick={resetVerification}>Done</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default FoodSafety;
