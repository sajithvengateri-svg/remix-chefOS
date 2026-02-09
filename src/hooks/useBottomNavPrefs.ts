import { useState, useCallback } from "react";

const BOTTOM_NAV_KEY = "chefos_bottom_nav_prefs";

// All available nav items
export const allNavItems = [
  { path: "/dashboard", label: "Home", icon: "Home" },
  { path: "/prep", label: "Prep", icon: "ClipboardList" },
  { path: "/recipes", label: "Recipes", icon: "ChefHat" },
  { path: "/ingredients", label: "Costing", icon: "DollarSign" },
  { path: "/menu-engineering", label: "Menu", icon: "Menu" },
  { path: "/inventory", label: "Inventory", icon: "Package" },
  { path: "/invoices", label: "Invoices", icon: "Receipt" },
  { path: "/production", label: "Production", icon: "Factory" },
  { path: "/marketplace", label: "Marketplace", icon: "Store" },
  { path: "/allergens", label: "Allergens", icon: "AlertTriangle" },
  { path: "/roster", label: "Roster", icon: "Users" },
  { path: "/calendar", label: "Calendar", icon: "Calendar" },
  { path: "/kitchen-sections", label: "Sections", icon: "LayoutGrid" },
  { path: "/equipment", label: "Equipment", icon: "Wrench" },
  { path: "/cheatsheets", label: "Cheatsheets", icon: "BookOpen" },
  { path: "/food-safety", label: "Safety", icon: "Shield" },
  { path: "/training", label: "Training", icon: "GraduationCap" },
  { path: "/team", label: "Team", icon: "Users2" },
  { path: "/settings", label: "Settings", icon: "Settings" },
];

// Default primary items (shown in bottom bar)
const defaultPrimaryPaths = [
  "/dashboard",
  "/prep",
  "/recipes",
  "/ingredients",
  "/menu-engineering",
];

export interface BottomNavPrefs {
  primaryPaths: string[];
}

export const useBottomNavPrefs = () => {
  const [prefs, setPrefs] = useState<BottomNavPrefs>(() => {
    if (typeof window === "undefined") return { primaryPaths: defaultPrimaryPaths };
    
    const stored = localStorage.getItem(BOTTOM_NAV_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure we always have exactly 5 items
        if (parsed.primaryPaths?.length === 5) {
          return parsed;
        }
      } catch {
        // Fall through to default
      }
    }
    return { primaryPaths: defaultPrimaryPaths };
  });

  const updatePrimaryPaths = useCallback((paths: string[]) => {
    if (paths.length !== 5) return; // Must have exactly 5 items
    
    const newPrefs = { ...prefs, primaryPaths: paths };
    setPrefs(newPrefs);
    localStorage.setItem(BOTTOM_NAV_KEY, JSON.stringify(newPrefs));
  }, [prefs]);

  const resetToDefaults = useCallback(() => {
    const defaultPrefs = { primaryPaths: defaultPrimaryPaths };
    setPrefs(defaultPrefs);
    localStorage.removeItem(BOTTOM_NAV_KEY);
  }, []);

  // Get primary items based on preferences
  const primaryItems = prefs.primaryPaths
    .map(path => allNavItems.find(item => item.path === path))
    .filter(Boolean) as typeof allNavItems;

  // Get secondary items (everything not in primary)
  const secondaryItems = allNavItems.filter(
    item => !prefs.primaryPaths.includes(item.path)
  );

  return {
    prefs,
    primaryPaths: prefs.primaryPaths,
    primaryItems,
    secondaryItems,
    updatePrimaryPaths,
    resetToDefaults,
    allNavItems,
    defaultPrimaryPaths,
  };
};
