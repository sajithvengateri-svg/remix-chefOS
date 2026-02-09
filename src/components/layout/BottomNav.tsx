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
  Home,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import chefOSIcon from "@/assets/chefos-icon.png";
import { motion, AnimatePresence } from "framer-motion";
import { useBottomNavPrefs } from "@/hooks/useBottomNavPrefs";
import useEmblaCarousel from "embla-carousel-react";

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
  const [emblaRef] = useEmblaCarousel({ 
    loop: false, 
    align: "start",
    dragFree: true,
  });

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      {/* Secondary carousel panel */}
      <AnimatePresence>
        {showSecondary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background/98 backdrop-blur-xl border-t border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-sm font-medium text-muted-foreground">More Options</span>
              <button 
                onClick={() => setShowSecondary(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Carousel */}
            <div className="overflow-hidden pb-4" ref={emblaRef}>
              <div className="flex gap-2 px-4">
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
                        "flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "bg-muted/60 text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-6 h-6 mb-1.5" />
                      <span className="text-[11px] font-medium text-center leading-tight px-1">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Scroll hint */}
            <div className="flex justify-center gap-1 pb-3">
              {secondaryItems.slice(0, Math.min(5, Math.ceil(secondaryItems.length / 3))).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button for secondary nav */}
      <button
        onClick={() => setShowSecondary(!showSecondary)}
        className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2 bg-background border border-border rounded-full p-1.5 shadow-lg z-10 transition-transform",
          showSecondary && "rotate-180"
        )}
      >
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
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
