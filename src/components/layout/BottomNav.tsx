import { Link, useLocation } from "react-router-dom";
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
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import chefOSIcon from "@/assets/chefos-icon.png";
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
  const { primaryItems } = useBottomNavPrefs();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      <nav className="bg-background/95 backdrop-blur-lg border-t border-border safe-bottom">
        <div className="flex">
          {primaryItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = iconMap[item.icon] || Menu;
            const isHome = item.path === "/dashboard";
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {isHome ? (
                  <img 
                    src={chefOSIcon} 
                    alt="Home" 
                    className={cn(
                      "w-6 h-6 rounded object-contain transition-transform",
                      isActive && "scale-110"
                    )} 
                  />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                )}
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
