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
  TrendingUp,
} from "lucide-react";

const AdminSeedData = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const seedOptions = [
    { id: "ingredients", label: "Ingredients", icon: Package, count: 15 },
    { id: "recipes", label: "Recipes", icon: ChefHat, count: 5 },
    { id: "demand", label: "Demand Insights", icon: Tag, count: 7 },
  ];

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSeed = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select at least one section to seed");
      return;
    }

    setIsSeeding(true);
    const results: string[] = [];

    try {
      for (const section of selectedSections) {
        let action = "";
        switch (section) {
          case "ingredients":
            action = "seed_ingredients";
            break;
          case "recipes":
            action = "seed_recipes";
            break;
          case "demand":
            action = "seed_demand_insights";
            break;
          default:
            continue;
        }

        const { data, error } = await supabase.functions.invoke("seed-data", {
          body: { action },
        });

        if (error) {
          toast.error(`Failed to seed ${section}: ${error.message}`);
        } else if (data?.success) {
          results.push(`${data.count} ${section}`);
        } else {
          toast.error(`Failed to seed ${section}: ${data?.error || "Unknown error"}`);
        }
      }

      if (results.length > 0) {
        toast.success(`Seeded: ${results.join(", ")}`);
      }
    } catch (error: any) {
      toast.error(`Seed failed: ${error.message}`);
    }

    setIsSeeding(false);
  };

  const handleClearData = async (table: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("seed-data", {
        body: { action: "clear_table", data: { table } },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Unknown error");
      
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
    { label: "Demand Insights", count: counts?.demand || 0, icon: TrendingUp },
    { label: "Vendors", count: counts?.vendors || 0, icon: Building2 },
    { label: "Vendor Deals", count: counts?.deals || 0, icon: Tag },
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
      const [ingredients, recipes, vendors, deals, demand] = await Promise.all([
        supabase.from("ingredients").select("*", { count: "exact", head: true }),
        supabase.from("recipes").select("*", { count: "exact", head: true }),
        supabase.from("vendor_profiles").select("*", { count: "exact", head: true }),
        supabase.from("vendor_deals").select("*", { count: "exact", head: true }),
        supabase.from("demand_insights").select("*", { count: "exact", head: true }),
      ]);

      setData({
        ingredients: ingredients.count || 0,
        recipes: recipes.count || 0,
        vendors: vendors.count || 0,
        deals: deals.count || 0,
        demand: demand.count || 0,
      });
    };

    fetchCounts();
  }, []);

  return { data };
};

export default AdminSeedData;
