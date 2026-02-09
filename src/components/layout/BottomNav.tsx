import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChefHat, 
  ClipboardList,
  DollarSign,
  Menu,
  ChevronUp,
  ChevronDown,
  Package,
  Shield,
  GraduationCap,
  Users,
  AlertTriangle,
  BookOpen,
  Calendar,
  Wrench,
  Store,
  LayoutGrid,
  Receipt,
  Utensils,
  Factory,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import chefOSIcon from "@/assets/chefos-icon.png";
import { motion, AnimatePresence } from "framer-motion";

interface BottomNavProps {
  className?: string;
}

// Primary nav items (always visible)
const primaryNavItems = [
  { path: "/dashboard", icon: null, label: "Home", isLogo: true },
  { path: "/prep", icon: ClipboardList, label: "Prep" },
  { path: "/recipes", icon: ChefHat, label: "Recipes" },
  { path: "/ingredients", icon: DollarSign, label: "Costing" },
  { path: "/menu-engineering", icon: Menu, label: "Menu" },
];

// Secondary nav items (scroll wheel)
const secondaryNavItems = [
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/invoices", icon: Receipt, label: "Invoices" },
  { path: "/production", icon: Factory, label: "Production" },
  { path: "/marketplace", icon: Store, label: "Marketplace" },
  { path: "/allergens", icon: AlertTriangle, label: "Allergens" },
  { path: "/roster", icon: Users, label: "Roster" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/kitchen-sections", icon: LayoutGrid, label: "Sections" },
  { path: "/equipment", icon: Wrench, label: "Equipment" },
  { path: "/cheatsheets", icon: BookOpen, label: "Cheatsheets" },
  { path: "/food-safety", icon: Shield, label: "Safety" },
  { path: "/training", icon: GraduationCap, label: "Training" },
  { path: "/team", icon: Users, label: "Team" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();
  const [showSecondary, setShowSecondary] = useState(false);

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      {/* Secondary scroll wheel */}
      <AnimatePresence>
        {showSecondary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/95 backdrop-blur-lg border-t border-border overflow-hidden"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 px-2 py-3 min-w-max">
                {secondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== "/" && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowSecondary(false)}
                      className={cn(
                        "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all min-w-[72px]",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button for secondary nav */}
      <button
        onClick={() => setShowSecondary(!showSecondary)}
        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background border border-border rounded-full p-1.5 shadow-lg z-10"
      >
        {showSecondary ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Primary bottom nav */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around">
          {primaryNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn("bottom-nav-item", isActive && "active")}
              >
                {item.isLogo ? (
                  <img src={chefOSIcon} alt="Home" className="w-6 h-6 rounded object-contain" />
                ) : (
                  item.icon && <item.icon className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
