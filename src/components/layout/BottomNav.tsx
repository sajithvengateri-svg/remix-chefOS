import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  ChefHat, 
  Package, 
  Menu,
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  className?: string;
}

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/recipes", icon: ChefHat, label: "Recipes" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/menu-engineering", icon: Menu, label: "Menu" },
  { path: "/more", icon: MoreHorizontal, label: "More" },
];

const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className={cn("bottom-nav", className)}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn("bottom-nav-item", isActive && "active")}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
