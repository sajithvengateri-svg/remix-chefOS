import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtractedMenuItem {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_base64, file_type } = await req.json();

    if (!file_base64) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at extracting menu item data from restaurant menus (PDFs, images, scans).

Extract all menu items from this menu. For each item, provide:
- name: The dish/item name
- description: A brief description if visible (optional)
- price: The price as a number (optional, without currency symbols)
- category: The menu section/category (e.g., "Starters", "Mains", "Desserts", "Drinks")

Return a JSON object with a "menu_items" array. Each item should have:
{
  "name": "item name",
  "description": "description or null",
  "price": number or null,
  "category": "category name",
  "confidence": 0.0 to 1.0 (how confident you are in the extraction)
}

Be thorough and extract ALL items visible in the menu. Group items by their categories as shown in the menu.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all menu items from this menu document.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file_type || "application/pdf"};base64,${file_base64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_menu_items",
              description: "Extract menu items from a menu document",
              parameters: {
                type: "object",
                properties: {
                  menu_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        price: { type: "number" },
                        category: { type: "string" },
                        confidence: { type: "number" },
                      },
                      required: ["name", "confidence"],
                    },
                  },
                },
                required: ["menu_items"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_menu_items" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to process menu with AI");
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call response from AI");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Menu extraction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
