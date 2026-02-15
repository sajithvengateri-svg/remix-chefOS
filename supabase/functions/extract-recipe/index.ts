import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  matched_ingredient_id?: string;
  matched_ingredient_name?: string;
  estimated_cost?: number;
}

interface ExtractedRecipe {
  name: string;
  description: string;
  category: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  ingredients: ExtractedIngredient[];
  instructions: string[];
  allergens: string[];
}

function buildSystemPrompt(ingredientNames: string) {
  return `You are a professional chef and recipe data extractor. Extract recipe information from images, documents, or text of handwritten or printed recipes.

Your task is to:
1. Extract the recipe name, description, category, servings, prep time, and cook time
2. Extract all ingredients with their quantities and units
3. Extract step-by-step cooking instructions
4. Identify any allergens present

For ingredients, try to match them to these existing ingredients in our database (for auto-costing):
${ingredientNames || "No existing ingredients in database yet"}

Categories should be one of: Mains, Appetizers, Soups, Salads, Desserts, Sauces

Common allergens to look for: Gluten, Dairy, Eggs, Fish, Shellfish, Tree Nuts, Peanuts, Soy, Sesame

Return ONLY valid JSON matching this structure:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "category": "Mains",
  "servings": 4,
  "prep_time": 15,
  "cook_time": 30,
  "ingredients": [
    {
      "name": "ingredient name as written",
      "quantity": 500,
      "unit": "g",
      "matched_ingredient_name": "matching ingredient from database if found"
    }
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "allergens": ["Gluten", "Dairy"]
}`;
}

function parseIngredientsList(raw: unknown): { id: string; name: string; unit: string; cost_per_unit: number }[] {
  try {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return JSON.parse(raw || "[]");
    return [];
  } catch {
    return [];
  }
}

function enrichIngredients(
  extracted: ExtractedIngredient[],
  dbIngredients: { id: string; name: string; unit: string; cost_per_unit: number }[]
): ExtractedIngredient[] {
  return extracted.map((ing) => {
    const matchedIng = dbIngredients.find(
      (dbIng) =>
        dbIng.name.toLowerCase() === ing.name.toLowerCase() ||
        dbIng.name.toLowerCase() === ing.matched_ingredient_name?.toLowerCase() ||
        dbIng.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(dbIng.name.toLowerCase())
    );

    if (matchedIng) {
      return {
        ...ing,
        matched_ingredient_id: matchedIng.id,
        matched_ingredient_name: matchedIng.name,
        estimated_cost: matchedIng.cost_per_unit * ing.quantity,
      };
    }
    return ing;
  });
}

function parseAIResponse(content: string): ExtractedRecipe {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                    content.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, content];
  const jsonStr = jsonMatch[1] || content;
  return JSON.parse(jsonStr.trim());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contentType = req.headers.get("content-type") || "";
    let messages: unknown[];
    let ingredientsList: { id: string; name: string; unit: string; cost_per_unit: number }[] = [];

    if (contentType.includes("application/json")) {
      // === TEXT / URL mode ===
      const body = await req.json();
      const text = body.text || "";
      ingredientsList = parseIngredientsList(body.ingredients);

      if (!text.trim()) {
        return new Response(
          JSON.stringify({ error: "No text provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ingredientNames = ingredientsList.map(i => `${i.name} (${i.unit})`).join(", ");
      const systemPrompt = buildSystemPrompt(ingredientNames);

      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please extract all recipe information from this text. If there are multiple recipes, extract the first/main one. Be thorough with ingredients.\n\n${text}`,
        },
      ];
    } else {
      // === IMAGE / FILE mode (existing) ===
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const existingIngredients = formData.get("ingredients") as string;

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = file.type || "image/jpeg";

      ingredientsList = parseIngredientsList(existingIngredients);
      const ingredientNames = ingredientsList.map(i => `${i.name} (${i.unit})`).join(", ");
      const systemPrompt = buildSystemPrompt(ingredientNames);

      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: "text",
              text: "Please extract all recipe information from this image. If there are multiple recipes, extract the first/main one. Be thorough with ingredients - include all of them with quantities and units.",
            },
          ],
        },
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 4000,
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
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let extractedRecipe: ExtractedRecipe;
    try {
      extractedRecipe = parseAIResponse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse recipe data");
    }

    const enrichedRecipe = {
      ...extractedRecipe,
      ingredients: enrichIngredients(extractedRecipe.ingredients, ingredientsList),
    };

    return new Response(
      JSON.stringify({ success: true, recipe: enrichedRecipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("extract-recipe error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
