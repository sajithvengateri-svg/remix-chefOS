import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a Menu Engineering expert consultant. Analyze the provided menu data and give actionable recommendations to improve profitability and customer satisfaction.

Your analysis should cover:
1. **Quick Wins** - Immediate actions that can boost profit (price adjustments, repositioning)
2. **Item Optimization** - Specific items that need attention (Dogs to remove, Puzzles to promote)
3. **Pricing Strategy** - Where prices are too low/high relative to food costs
4. **Menu Balance** - Category distribution and gaps
5. **Seasonal Suggestions** - Items to add or rotate based on profitability patterns

Use the Menu Engineering Matrix terminology:
- Stars (High Profit, High Popularity) - Protect and feature
- Plow Horses (Low Profit, High Popularity) - Increase prices or reduce costs
- Puzzles (High Profit, Low Popularity) - Promote or reposition
- Dogs (Low Profit, Low Popularity) - Consider removing

Keep recommendations concise, specific, and actionable. Use bullet points.
Format currency in the same format as provided.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { menuItems, menuName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare menu data summary for AI
    const menuSummary = {
      name: menuName,
      totalItems: menuItems.length,
      byCategory: {} as Record<string, number>,
      byProfitability: { star: 0, "plow-horse": 0, puzzle: 0, dog: 0 },
      avgFoodCostPercent: 0,
      items: menuItems.map((item: any) => ({
        name: item.name,
        category: item.category,
        sellPrice: item.sellPrice,
        foodCost: item.foodCost,
        foodCostPercent: item.foodCostPercent,
        contributionMargin: item.contributionMargin,
        popularity: item.popularity,
        profitability: item.profitability,
      })),
    };

    // Calculate aggregates
    menuItems.forEach((item: any) => {
      menuSummary.byCategory[item.category] = (menuSummary.byCategory[item.category] || 0) + 1;
      menuSummary.byProfitability[item.profitability as keyof typeof menuSummary.byProfitability]++;
      menuSummary.avgFoodCostPercent += item.foodCostPercent || 0;
    });
    menuSummary.avgFoodCostPercent = menuSummary.avgFoodCostPercent / menuItems.length || 0;

    const userPrompt = `Analyze this menu and provide specific recommendations:

**Menu: ${menuSummary.name}**
- Total Items: ${menuSummary.totalItems}
- Average Food Cost: ${menuSummary.avgFoodCostPercent.toFixed(1)}%
- Stars: ${menuSummary.byProfitability.star} | Plow Horses: ${menuSummary.byProfitability["plow-horse"]} | Puzzles: ${menuSummary.byProfitability.puzzle} | Dogs: ${menuSummary.byProfitability.dog}

**Items by Category:**
${Object.entries(menuSummary.byCategory).map(([cat, count]) => `- ${cat}: ${count} items`).join("\n")}

**Detailed Item Data:**
${menuSummary.items.map((item: any) => 
  `- ${item.name} (${item.category}): $${item.sellPrice?.toFixed(2) || "N/A"} sell, ${item.foodCostPercent?.toFixed(1) || "N/A"}% food cost, ${item.popularity || 0} sales, Classification: ${item.profitability?.toUpperCase()}`
).join("\n")}

Provide 5-7 specific, actionable recommendations to improve this menu's profitability.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || "Unable to generate recommendations.";

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-menu error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
