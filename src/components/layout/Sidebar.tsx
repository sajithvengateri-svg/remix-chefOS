import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import chefOSLogo from "@/assets/chefos-logo.png";
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
  BookOpen,
  Calendar,
  Wrench,
  LogOut,
  Store,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavOrder } from "@/hooks/useNavOrder";

interface SidebarProps {
  className?: string;
}

const mainNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", module: "dashboard" },
  { path: "/recipes", icon: ChefHat, label: "Recipe Bank", module: "recipes" },
  { path: "/menu-engineering", icon: Menu, label: "Menu Engineering", module: "menu-engineering" },
  { path: "/ingredients", icon: Utensils, label: "Ingredients", module: "ingredients" },
  { path: "/invoices", icon: Receipt, label: "Invoices", module: "invoices" },
  { path: "/inventory", icon: Package, label: "Inventory", module: "inventory" },
  { path: "/prep", icon: ClipboardList, label: "Prep Lists", module: "prep" },
  { path: "/production", icon: Factory, label: "Production", module: "production" },
  { path: "/marketplace", icon: Store, label: "Marketplace", module: "marketplace" },
  { path: "/allergens", icon: AlertTriangle, label: "Allergens", module: "allergens" },
];

const secondaryNavItems = [
  { path: "/roster", icon: Users, label: "Roster", module: "roster" },
  { path: "/calendar", icon: Calendar, label: "Calendar", module: "calendar" },
  { path: "/kitchen-sections", icon: LayoutGrid, label: "Kitchen Sections", module: "calendar" },
  { path: "/equipment", icon: Wrench, label: "Equipment", module: "equipment" },
  { path: "/cheatsheets", icon: BookOpen, label: "Cheatsheets", module: "cheatsheets" },
  { path: "/food-safety", icon: Shield, label: "Food Safety", module: "food-safety" },
  { path: "/training", icon: GraduationCap, label: "Training", module: "training" },
  { path: "/team", icon: Users, label: "Team", module: "team" },
];

const defaultMainPaths = mainNavItems.map(item => item.path);
const defaultSecondaryPaths = secondaryNavItems.map(item => item.path);

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const { profile, role, canView, signOut, isHeadChef } = useAuth();

  const { mainNavOrder, secondaryNavOrder } = useNavOrder(defaultMainPaths, defaultSecondaryPaths);

  // Sort items based on saved order
  const sortedMainItems = useMemo(() => {
    return [...mainNavItems]
      .filter(item => canView(item.module))
      .sort((a, b) => {
        const indexA = mainNavOrder.indexOf(a.path);
        const indexB = mainNavOrder.indexOf(b.path);
        return indexA - indexB;
      });
  }, [mainNavOrder, canView]);

  const sortedSecondaryItems = useMemo(() => {
    return [...secondaryNavItems]
      .filter(item => canView(item.module))
      .sort((a, b) => {
        const indexA = secondaryNavOrder.indexOf(a.path);
        const indexB = secondaryNavOrder.indexOf(b.path);
        return indexA - indexB;
      });
  }, [secondaryNavOrder, canView]);

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
      {/* Logo - Links to Dashboard */}
      <Link to="/dashboard" className="block p-6 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
        <div className="flex items-center gap-3">
          <img src={chefOSLogo} alt="ChefOS" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="font-display text-lg font-semibold text-sidebar-foreground">ChefOS</h1>
            <p className="text-xs text-muted-foreground">Kitchen Operating System</p>
          </div>
        </div>
      </Link>

      {/* User Profile */}
      {profile && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.full_name}
              </p>
              <Badge variant={isHeadChef ? "default" : "secondary"} className="text-xs">
                {isHeadChef ? "Head Chef" : "Line Chef"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </p>
          {sortedMainItems.map((item) => (
            <NavLink key={item.path} path={item.path} icon={item.icon} label={item.label} />
          ))}
        </div>

        <div>
          <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Operations
          </p>
          {sortedSecondaryItems.map((item) => (
            <NavLink key={item.path} path={item.path} icon={item.icon} label={item.label} />
          ))}
        </div>
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className={cn("nav-item", location.pathname === "/settings" && "active")}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-2 h-auto text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
