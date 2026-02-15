import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import chefOSIcon from "@/assets/chefos-icon.png";
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
import { useFeatureReleases } from "@/hooks/useFeatureReleases";


interface SidebarProps {
  className?: string;
}

// All possible nav items with their module slugs
const allNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", module: "dashboard" },
  { path: "/prep", icon: ClipboardList, label: "Prep Lists", module: "prep" },
  { path: "/recipes", icon: ChefHat, label: "Recipe Bank", module: "recipes" },
  { path: "/ingredients", icon: Utensils, label: "Ingredients", module: "ingredients" },
  { path: "/invoices", icon: Receipt, label: "Invoices", module: "invoices" },
  { path: "/menu-engineering", icon: Menu, label: "Menu Engineering", module: "menu-engineering" },
  { path: "/equipment", icon: Wrench, label: "Equipment", module: "equipment" },
  { path: "/team", icon: Users, label: "Team", module: "team" },
  { path: "/inventory", icon: Package, label: "Inventory", module: "inventory" },
  { path: "/production", icon: Factory, label: "Production", module: "production" },
  { path: "/marketplace", icon: Store, label: "Marketplace", module: "marketplace" },
  { path: "/allergens", icon: AlertTriangle, label: "Allergens", module: "allergens" },
  { path: "/roster", icon: Users, label: "Roster", module: "roster" },
  { path: "/calendar", icon: Calendar, label: "Calendar", module: "calendar" },
  { path: "/kitchen-sections", icon: LayoutGrid, label: "Kitchen Sections", module: "kitchen-sections" },
  { path: "/cheatsheets", icon: BookOpen, label: "Cheatsheets", module: "cheatsheets" },
  { path: "/food-safety", icon: Shield, label: "Food Safety", module: "food-safety" },
  { path: "/training", icon: GraduationCap, label: "Training", module: "training" },
];


const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const { profile, role, canView, signOut, isHeadChef } = useAuth();
  const { data: releases } = useFeatureReleases();

  // Build a set of released module slugs
  const releasedModules = useMemo(() => {
    const set = new Set<string>();
    releases?.forEach((r) => {
      if (r.status === "released") set.add(r.module_slug);
    });
    return set;
  }, [releases]);

  // Split into released (active) vs coming soon based on feature_releases DB
  const activeItems = useMemo(() => {
    return allNavItems.filter(
      (item) => releasedModules.has(item.module) && canView(item.module)
    );
  }, [releasedModules, canView]);

  const comingSoonItems = useMemo(() => {
    return allNavItems.filter(
      (item) => !releasedModules.has(item.module)
    );
  }, [releasedModules]);

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
          <img src={chefOSIcon} alt="ChefOS" className="w-10 h-10 rounded-xl object-contain" />
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
            Core
          </p>
          {activeItems.map((item) => (
            <NavLink key={item.path} path={item.path} icon={item.icon} label={item.label} />
          ))}
        </div>

        {comingSoonItems.length > 0 && (
          <div>
            <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Coming Soon
            </p>
            {comingSoonItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-item opacity-50 pointer-events-none flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
              </Link>
            ))}
          </div>
        )}
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
