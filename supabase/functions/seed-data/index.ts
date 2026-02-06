import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, data } = await req.json();

    let result: any = { success: false };

    switch (action) {
      case 'seed_ingredients': {
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
          { name: "Arborio Rice", category: "Dry Goods", unit: "kg", cost_per_unit: 6.5 },
          { name: "Beef Tenderloin", category: "Meat", unit: "kg", cost_per_unit: 55.0 },
          { name: "Shallots", category: "Produce", unit: "kg", cost_per_unit: 12.0 },
          { name: "White Wine", category: "Alcohol", unit: "L", cost_per_unit: 15.0 },
          { name: "Vegetable Stock", category: "Stock", unit: "L", cost_per_unit: 4.5 },
        ];

        const { data: inserted, error } = await supabase.from("ingredients").insert(ingredients).select();
        result = { success: !error, count: inserted?.length || 0, error: error?.message };
        break;
      }

      case 'seed_recipes': {
        const recipes = [
          {
            name: "Classic Risotto",
            category: "Main",
            description: "Creamy Italian rice dish with parmesan",
            prep_time: 15,
            cook_time: 25,
            servings: 4,
            sell_price: 28.0,
            cost_per_serving: 6.5,
            is_public: true,
          },
          {
            name: "Grilled Salmon",
            category: "Main",
            description: "Fresh Atlantic salmon with lemon butter",
            prep_time: 10,
            cook_time: 15,
            servings: 2,
            sell_price: 35.0,
            cost_per_serving: 12.0,
            is_public: true,
          },
          {
            name: "Caesar Salad",
            category: "Starter",
            description: "Crisp romaine with house-made dressing",
            prep_time: 15,
            cook_time: 0,
            servings: 2,
            sell_price: 16.0,
            cost_per_serving: 3.5,
            is_public: true,
          },
          {
            name: "Tiramisu",
            category: "Dessert",
            description: "Italian coffee-flavored layered dessert",
            prep_time: 30,
            cook_time: 0,
            servings: 8,
            sell_price: 14.0,
            cost_per_serving: 2.8,
            is_public: true,
          },
          {
            name: "Beef Bourguignon",
            category: "Main",
            description: "French braised beef in red wine",
            prep_time: 30,
            cook_time: 180,
            servings: 6,
            sell_price: 32.0,
            cost_per_serving: 8.5,
            is_public: true,
          },
        ];

        const { data: inserted, error } = await supabase.from("recipes").insert(recipes).select();
        result = { success: !error, count: inserted?.length || 0, error: error?.message };
        break;
      }

      case 'seed_demand_insights': {
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay())); // Next Sunday

        const insights = [
          { ingredient_category: "Produce", postcode: "2000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 150, order_count: 12, unit: "kg", avg_price_paid: 5.5 },
          { ingredient_category: "Meat", postcode: "2000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 85, order_count: 8, unit: "kg", avg_price_paid: 28.0 },
          { ingredient_category: "Seafood", postcode: "2000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 45, order_count: 6, unit: "kg", avg_price_paid: 35.0 },
          { ingredient_category: "Dairy", postcode: "2000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 60, order_count: 10, unit: "L", avg_price_paid: 12.0 },
          { ingredient_category: "Herbs", postcode: "2000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 25, order_count: 15, unit: "bunch", avg_price_paid: 3.5 },
          { ingredient_category: "Produce", postcode: "3000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 120, order_count: 9, unit: "kg", avg_price_paid: 4.8 },
          { ingredient_category: "Meat", postcode: "3000", week_ending: weekEnd.toISOString().split('T')[0], total_quantity: 70, order_count: 7, unit: "kg", avg_price_paid: 26.0 },
        ];

        const { data: inserted, error } = await supabase.from("demand_insights").insert(insights).select();
        result = { success: !error, count: inserted?.length || 0, error: error?.message };
        break;
      }

      case 'clear_table': {
        const { table } = data;
        const allowedTables = ['ingredients', 'recipes', 'vendor_deals', 'inventory', 'demand_insights'];
        
        if (!allowedTables.includes(table)) {
          result = { success: false, error: `Table ${table} not allowed` };
          break;
        }

        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        result = { success: !error, error: error?.message };
        break;
      }

      default:
        result = { success: false, error: 'Unknown action' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
