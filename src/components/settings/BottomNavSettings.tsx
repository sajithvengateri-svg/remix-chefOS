import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChefHat, 
  ClipboardList,
  DollarSign,
  Menu,
  Package,
  Shield,
  GraduationCap,
  Users,
  Users2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Wrench,
  Store,
  LayoutGrid,
  Receipt,
  Factory,
  Settings,
  Home,
  GripVertical,
  RotateCcw,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBottomNavPrefs, allNavItems } from "@/hooks/useBottomNavPrefs";
import { toast } from "sonner";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Home,
  ClipboardList,
  ChefHat,
  DollarSign,
  Menu,
  Package,
  Receipt,
  Factory,
  Store,
  AlertTriangle,
  Users,
  Users2,
  Calendar,
  LayoutGrid,
  Wrench,
  BookOpen,
  Shield,
  GraduationCap,
  Settings,
};

const BottomNavSettings = () => {
  const { primaryPaths, updatePrimaryPaths, resetToDefaults } = useBottomNavPrefs();
  const [selectedPaths, setSelectedPaths] = useState<string[]>(primaryPaths);

  const toggleItem = (path: string) => {
    if (selectedPaths.includes(path)) {
      // Remove if already selected (but keep at least 5)
      if (selectedPaths.length <= 5) {
        toast.error("You need exactly 5 items in your quick menu");
        return;
      }
      setSelectedPaths(prev => prev.filter(p => p !== path));
    } else {
      // Add if not selected (max 5)
      if (selectedPaths.length >= 5) {
        toast.error("Remove an item first to add a new one");
        return;
      }
      setSelectedPaths(prev => [...prev, path]);
    }
  };

  const handleSave = () => {
    if (selectedPaths.length !== 5) {
      toast.error("Please select exactly 5 items");
      return;
    }
    updatePrimaryPaths(selectedPaths);
    toast.success("Bottom menu updated!");
  };

  const handleReset = () => {
    resetToDefaults();
    setSelectedPaths(["/dashboard", "/prep", "/recipes", "/ingredients", "/menu-engineering"]);
    toast.success("Reset to defaults");
  };

  const hasChanges = JSON.stringify(selectedPaths) !== JSON.stringify(primaryPaths);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            Mobile Bottom Menu
          </CardTitle>
          <CardDescription>
            Choose 5 items to show in your quick access menu. The rest will appear in the scroll wheel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected count */}
          <div className="flex items-center justify-between">
            <Badge variant={selectedPaths.length === 5 ? "default" : "destructive"}>
              {selectedPaths.length} / 5 selected
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              {hasChanges && (
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Item grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {allNavItems.map((item) => {
              const Icon = iconMap[item.icon] || Menu;
              const isSelected = selectedPaths.includes(item.path);
              const selectionIndex = selectedPaths.indexOf(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => toggleItem(item.path)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {selectionIndex + 1}
                    </span>
                  )}
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Preview of your bottom menu:</p>
            <div className="flex items-center justify-around bg-muted/50 rounded-xl p-3">
              {selectedPaths.slice(0, 5).map((path) => {
                const item = allNavItems.find(i => i.path === path);
                if (!item) return null;
                const Icon = iconMap[item.icon] || Menu;
                
                return (
                  <div key={path} className="flex flex-col items-center gap-1">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BottomNavSettings;
