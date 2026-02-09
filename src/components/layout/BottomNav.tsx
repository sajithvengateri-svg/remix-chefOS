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
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import chefOSIcon from "@/assets/chefos-icon.png";
import { motion, AnimatePresence } from "framer-motion";
import { useBottomNavPrefs } from "@/hooks/useBottomNavPrefs";

interface BottomNavProps {
  className?: string;
}

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

const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();
  const [showSecondary, setShowSecondary] = useState(false);
  const { primaryItems, secondaryItems } = useBottomNavPrefs();

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
                {secondaryItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== "/" && location.pathname.startsWith(item.path));
                  const Icon = iconMap[item.icon] || Menu;
                  
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
          {primaryItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = iconMap[item.icon] || Menu;
            const isHome = item.path === "/dashboard";
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn("bottom-nav-item", isActive && "active")}
              >
                {isHome ? (
                  <img src={chefOSIcon} alt="Home" className="w-6 h-6 rounded object-contain" />
                ) : (
                  <Icon className="w-5 h-5" />
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
