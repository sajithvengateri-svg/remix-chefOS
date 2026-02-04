import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  ClipboardList, 
  Shield,
  GraduationCap,
  Receipt,
  Settings,
  Utensils,
  Factory,
  Menu,
  Users,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const mainNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/recipes", icon: ChefHat, label: "Recipe Bank" },
  { path: "/ingredients", icon: Utensils, label: "Ingredients" },
  { path: "/invoices", icon: Receipt, label: "Invoices" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/prep", icon: ClipboardList, label: "Prep Lists" },
  { path: "/production", icon: Factory, label: "Production" },
  { path: "/allergens", icon: AlertTriangle, label: "Allergens" },
];

const secondaryNavItems = [
  { path: "/menu-engineering", icon: Menu, label: "Menu Engineering" },
  { path: "/roster", icon: Users, label: "Roster" },
  { path: "/cheatsheets", icon: BookOpen, label: "Cheatsheets" },
  { path: "/food-safety", icon: Shield, label: "Food Safety" },
  { path: "/training", icon: GraduationCap, label: "Training" },
];

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();

  const NavLink = ({ path, icon: Icon, label }: { path: string; icon: typeof LayoutDashboard; label: string }) => {
    const isActive = location.pathname === path || 
      (path !== "/" && location.pathname.startsWith(path));
    
    return (
      <Link
        to={path}
        className={cn("nav-item", isActive && "active")}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col",
      className
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-sidebar-foreground">ChefFlow</h1>
            <p className="text-xs text-muted-foreground">Kitchen Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          {mainNavItems.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}
        </div>

        <div>
          <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Operations
          </p>
          {secondaryNavItems.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/settings"
          className="nav-item"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
