import { useState, useCallback } from "react";

const BOTTOM_NAV_KEY = "chefos_bottom_nav_prefs";

// The 7 active carousel items
export const allNavItems = [
  { path: "/dashboard", label: "Home", icon: "Home" },
  { path: "/prep", label: "Prep", icon: "ClipboardList" },
  { path: "/recipes", label: "Recipes", icon: "ChefHat" },
  { path: "/ingredients", label: "Ingredients", icon: "Utensils" },
  { path: "/menu-engineering", label: "Menu", icon: "Menu" },
  { path: "/equipment", label: "Equipment", icon: "Wrench" },
  { path: "/team", label: "Team", icon: "Users2" },
];

const defaultPrimaryPaths = allNavItems.map(item => item.path);

export interface BottomNavPrefs {
  primaryPaths: string[];
}

export const useBottomNavPrefs = () => {
  const [prefs, setPrefs] = useState<BottomNavPrefs>(() => {
    return { primaryPaths: defaultPrimaryPaths };
  });

  const updatePrimaryPaths = useCallback((paths: string[]) => {
    const newPrefs = { ...prefs, primaryPaths: paths };
    setPrefs(newPrefs);
    localStorage.setItem(BOTTOM_NAV_KEY, JSON.stringify(newPrefs));
  }, [prefs]);

  const resetToDefaults = useCallback(() => {
    const defaultPrefs = { primaryPaths: defaultPrimaryPaths };
    setPrefs(defaultPrefs);
    localStorage.removeItem(BOTTOM_NAV_KEY);
  }, []);

  const primaryItems = prefs.primaryPaths
    .map(path => allNavItems.find(item => item.path === path))
    .filter(Boolean) as typeof allNavItems;

  return {
    prefs,
    primaryPaths: prefs.primaryPaths,
    primaryItems,
    updatePrimaryPaths,
    resetToDefaults,
    allNavItems,
    defaultPrimaryPaths,
  };
};
