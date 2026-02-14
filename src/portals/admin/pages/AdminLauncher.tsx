import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Rocket,
  ChefHat,
  Building2,
  Zap,
  Package,
  ExternalLink,
  LayoutDashboard,
  ClipboardList,
  Utensils,
  Receipt,
  Menu,
  Wrench,
  Users,
  Factory,
  Store,
  AlertTriangle,
  Calendar,
  LayoutGrid,
  BookOpen,
  Shield,
  GraduationCap,
} from "lucide-react";

// Map module slugs to icons and routes
const moduleConfig: Record<string, { icon: React.ElementType; path: string }> = {
  dashboard: { icon: LayoutDashboard, path: "/dashboard" },
  prep: { icon: ClipboardList, path: "/prep" },
  recipes: { icon: ChefHat, path: "/recipes" },
  ingredients: { icon: Utensils, path: "/ingredients" },
  invoices: { icon: Receipt, path: "/invoices" },
  "menu-engineering": { icon: Menu, path: "/menu-engineering" },
  equipment: { icon: Wrench, path: "/equipment" },
  team: { icon: Users, path: "/team" },
  inventory: { icon: Package, path: "/inventory" },
  production: { icon: Factory, path: "/production" },
  marketplace: { icon: Store, path: "/marketplace" },
  allergens: { icon: AlertTriangle, path: "/allergens" },
  roster: { icon: Users, path: "/roster" },
  calendar: { icon: Calendar, path: "/calendar" },
  "kitchen-sections": { icon: LayoutGrid, path: "/kitchen-sections" },
  cheatsheets: { icon: BookOpen, path: "/cheatsheets" },
  "food-safety": { icon: Shield, path: "/food-safety" },
  training: { icon: GraduationCap, path: "/training" },
};

interface FeatureRelease {
  id: string;
  module_slug: string;
  module_name: string;
  description: string | null;
  status: string;
  release_type: string;
  sort_order: number;
  released_at: string | null;
}

const statusColors: Record<string, string> = {
  development: "bg-muted text-muted-foreground",
  beta: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  released: "bg-green-500/20 text-green-700 dark:text-green-400",
};

const AdminLauncher = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<FeatureRelease[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from("feature_releases")
      .select("*")
      .eq("release_type", "new")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to load modules");
    } else {
      setModules(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, []);

  const toggleStatus = async (mod: FeatureRelease) => {
    const newStatus = mod.status === "released" ? "development" : "released";
    const updates: Partial<FeatureRelease> = { status: newStatus };
    if (newStatus === "released") {
      updates.released_at = new Date().toISOString();
    } else {
      updates.released_at = null;
    }

    const { error } = await supabase
      .from("feature_releases")
      .update(updates)
      .eq("id", mod.id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(`${mod.module_name} ${newStatus === "released" ? "enabled" : "disabled"}`);
      fetchModules();
    }
  };

  const releasedCount = modules.filter(m => m.status === "released").length;
  const progress = modules.length ? (releasedCount / modules.length) * 100 : 0;

  const quickLinks = [
    { label: "Chef Portal", path: "/dashboard", icon: ChefHat },
    { label: "Vendor Portal", path: "/vendor/dashboard", icon: Building2 },
    { label: "Run Tests", path: "/admin/testing", icon: Zap },
    { label: "Seed Data", path: "/admin/seed", icon: Package },
  ];

  if (loading) return <div className="p-6 text-muted-foreground">Loading modules...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          Launch Control
        </h1>
        <p className="text-muted-foreground mt-1">
          Enable and manage all ChefOS modules
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Module Readiness</CardTitle>
              <CardDescription>
                {releasedCount} of {modules.length} modules enabled
              </CardDescription>
            </div>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress.toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(link.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.label}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* All Modules Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All ChefOS Modules</CardTitle>
          <CardDescription>Toggle modules on/off to control what's available in the Chef portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((mod, index) => {
              const config = moduleConfig[mod.module_slug];
              const Icon = config?.icon || Package;
              const isEnabled = mod.status === "released";

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isEnabled ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${!isEnabled ? "text-muted-foreground" : ""}`}>
                        {mod.module_name}
                      </p>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[mod.status]}>
                      {mod.status === "released" ? "Live" : mod.status === "beta" ? "Beta" : "Dev"}
                    </Badge>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleStatus(mod)}
                    />
                    {config?.path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(config.path)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLauncher;
