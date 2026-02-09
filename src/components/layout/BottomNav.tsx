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
import useEmblaCarousel from "embla-carousel-react";
import { allNavItems } from "@/hooks/useBottomNavPrefs";

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
  const [emblaRef] = useEmblaCarousel({ 
    loop: false, 
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      <nav className="bg-background/95 backdrop-blur-lg border-t border-border safe-bottom">
        {/* Carousel container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== "/" && location.pathname.startsWith(item.path));
              const Icon = iconMap[item.icon] || Menu;
              const isHome = item.path === "/dashboard";
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center justify-center py-2 transition-colors",
                    "w-[20%]", // 5 items visible at once (100% / 5 = 20%)
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
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center gap-1 pb-1">
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-0.5 rounded-full bg-primary/60" />
            <div className="w-2 h-0.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2 h-0.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2 h-0.5 rounded-full bg-muted-foreground/30" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
