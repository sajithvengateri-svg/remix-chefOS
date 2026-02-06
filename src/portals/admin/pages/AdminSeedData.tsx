import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Database,
  Play,
  Loader2,
  ChefHat,
  Package,
  Users,
  Building2,
  Tag,
  Trash2,
} from "lucide-react";

const AdminSeedData = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const seedOptions = [
    { id: "ingredients", label: "Ingredients", icon: Package, count: 50 },
    { id: "recipes", label: "Recipes", icon: ChefHat, count: 20 },
    { id: "vendors", label: "Vendor Profiles", icon: Building2, count: 10 },
    { id: "deals", label: "Vendor Deals", icon: Tag, count: 15 },
    { id: "users", label: "Test Users", icon: Users, count: 5 },
  ];

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const seedIngredients = async () => {
    const ingredients = [
      { name: "Olive Oil", category: "Oils & Fats", unit: "L", cost_per_unit: 12.5 },
      { name: "Butter", category: "Dairy", unit: "kg", cost_per_unit: 18.0 },
      { name: "Garlic", category: "Produce", unit: "kg", cost_per_unit: 8.5 },
      { name: "Onion", category: "Produce", unit: "kg", cost_per_unit: 2.5 },
      { name: "Chicken Breast", category: "Meat", unit: "kg", cost_per_unit: 14.0 },
      { name: "Salmon Fillet", category: "Seafood", unit: "kg", cost_per_unit: 32.0 },
      { name: "Parmesan Cheese", category: "Dairy", unit: "kg", cost_per_unit: 45.0 },
      { name: "Heavy Cream", category: "Dairy", unit: "L", cost_per_unit: 8.0 },
      { name: "Fresh Basil", category: "Herbs", unit: "bunch", cost_per_unit: 3.5 },
      { name: "Lemon", category: "Produce", unit: "each", cost_per_unit: 0.8 },
    ];

    const { error } = await supabase.from("ingredients").insert(ingredients);
    if (error) throw error;
    return ingredients.length;
  };

  const seedRecipes = async () => {
    const recipes = [
      {
        name: "Classic Risotto",
        category: "Main",
        description: "Creamy Italian rice dish",
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        sell_price: 28.0,
        cost_per_serving: 6.5,
      },
      {
        name: "Grilled Salmon",
        category: "Main",
        description: "Fresh Atlantic salmon with herbs",
        prep_time: 10,
        cook_time: 15,
        servings: 2,
        sell_price: 35.0,
        cost_per_serving: 12.0,
      },
      {
        name: "Caesar Salad",
        category: "Starter",
        description: "Classic romaine with house dressing",
        prep_time: 15,
        cook_time: 0,
        servings: 2,
        sell_price: 16.0,
        cost_per_serving: 3.5,
      },
      {
        name: "Tiramisu",
        category: "Dessert",
        description: "Italian coffee-flavored dessert",
        prep_time: 30,
        cook_time: 0,
        servings: 8,
        sell_price: 14.0,
        cost_per_serving: 2.8,
      },
      {
        name: "Beef Bourguignon",
        category: "Main",
        description: "French braised beef stew",
        prep_time: 30,
        cook_time: 180,
        servings: 6,
        sell_price: 32.0,
        cost_per_serving: 8.5,
      },
    ];

    const { error } = await supabase.from("recipes").insert(recipes);
    if (error) throw error;
    return recipes.length;
  };

  const seedVendorDeals = async () => {
    // First get vendor IDs
    const { data: vendors } = await supabase.from("vendor_profiles").select("id").limit(3);
    if (!vendors?.length) {
      toast.error("No vendors found. Seed vendors first.");
      return 0;
    }

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const deals = vendors.flatMap((vendor) => [
      {
        vendor_id: vendor.id,
        title: "Summer Special",
        description: "10% off all produce orders",
        discount_percent: 10,
        start_date: today.toISOString().split("T")[0],
        end_date: nextMonth.toISOString().split("T")[0],
        is_active: true,
        min_order_value: 100,
        applicable_categories: ["Produce", "Herbs"],
      },
      {
        vendor_id: vendor.id,
        title: "Bulk Meat Discount",
        description: "$50 off orders over $500",
        discount_amount: 50,
        start_date: today.toISOString().split("T")[0],
        end_date: nextMonth.toISOString().split("T")[0],
        is_active: true,
        min_order_value: 500,
        applicable_categories: ["Meat", "Seafood"],
      },
    ]);

    const { error } = await supabase.from("vendor_deals").insert(deals);
    if (error) throw error;
    return deals.length;
  };

  const handleSeed = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select at least one section to seed");
      return;
    }

    setIsSeeding(true);
    const results: string[] = [];

    try {
      if (selectedSections.includes("ingredients")) {
        const count = await seedIngredients();
        results.push(`${count} ingredients`);
      }

      if (selectedSections.includes("recipes")) {
        const count = await seedRecipes();
        results.push(`${count} recipes`);
      }

      if (selectedSections.includes("deals")) {
        const count = await seedVendorDeals();
        results.push(`${count} vendor deals`);
      }

      toast.success(`Seeded: ${results.join(", ")}`);
    } catch (error: any) {
      toast.error(`Seed failed: ${error.message}`);
    }

    setIsSeeding(false);
  };

  const handleClearData = async (table: string) => {
    try {
      // Use a type assertion to allow dynamic table names
      const { error } = await (supabase.from(table as any).delete() as any).neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      toast.success(`Cleared ${table} table`);
    } catch (error: any) {
      toast.error(`Failed to clear ${table}: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Seed Data
        </h1>
        <p className="text-muted-foreground mt-1">
          Populate the database with test data for development
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seed Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Test Data</CardTitle>
            <CardDescription>
              Select which data types to seed into the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {seedOptions.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={option.id}
                    checked={selectedSections.includes(option.id)}
                    onCheckedChange={() => toggleSection(option.id)}
                  />
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
                <Badge variant="secondary">~{option.count} items</Badge>
              </motion.div>
            ))}

            <Button
              onClick={handleSeed}
              disabled={isSeeding || selectedSections.length === 0}
              className="w-full mt-4"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Seed Selected Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Clear Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Clear test data from specific tables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { table: "ingredients", label: "Clear Ingredients" },
              { table: "recipes", label: "Clear Recipes" },
              { table: "vendor_deals", label: "Clear Vendor Deals" },
              { table: "inventory", label: "Clear Inventory" },
            ].map((item) => (
              <Button
                key={item.table}
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={() => handleClearData(item.table)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <DataStatusGrid />
        </CardContent>
      </Card>
    </div>
  );
};

const DataStatusGrid = () => {
  const { data: counts } = useDataCounts();

  const items = [
    { label: "Ingredients", count: counts?.ingredients || 0, icon: Package },
    { label: "Recipes", count: counts?.recipes || 0, icon: ChefHat },
    { label: "Vendors", count: counts?.vendors || 0, icon: Building2 },
    { label: "Vendor Deals", count: counts?.deals || 0, icon: Tag },
    { label: "Users", count: counts?.users || 0, icon: Users },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center p-4 rounded-lg bg-muted/50"
        >
          <item.icon className="w-6 h-6 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{item.count}</p>
          <p className="text-sm text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

const useDataCounts = () => {
  const [data, setData] = useState<any>(null);

  // Use useEffect properly for data fetching
  React.useEffect(() => {
    const fetchCounts = async () => {
      const [ingredients, recipes, vendors, deals, users] = await Promise.all([
        supabase.from("ingredients").select("*", { count: "exact", head: true }),
        supabase.from("recipes").select("*", { count: "exact", head: true }),
        supabase.from("vendor_profiles").select("*", { count: "exact", head: true }),
        supabase.from("vendor_deals").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      setData({
        ingredients: ingredients.count || 0,
        recipes: recipes.count || 0,
        vendors: vendors.count || 0,
        deals: deals.count || 0,
        users: users.count || 0,
      });
    };

    fetchCounts();
  }, []);

  return { data };
};

export default AdminSeedData;
