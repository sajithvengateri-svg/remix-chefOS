import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at reading equipment asset labels and extracting structured data.
    
Analyze the provided image of an equipment asset label and extract as much information as possible.

Return a JSON object with these fields (use null for any field you cannot determine):
{
  "name": "Equipment name/type",
  "manufacturer": "Brand/manufacturer name",
  "model": "Model number",
  "serial_number": "Serial number",
  "voltage": "Voltage rating if shown",
  "power": "Power rating (watts/amps) if shown", 
  "manufacture_date": "Manufacturing date if shown (YYYY-MM-DD format)",
  "warranty_info": "Any warranty information",
  "certifications": "Safety certifications (UL, CE, etc.)",
  "additional_specs": "Any other technical specifications",
  "notes": "Any other relevant text from the label"
}

Focus on accuracy. Only extract information you can clearly read from the label.`;

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
                text: "Please analyze this equipment asset label and extract all available information.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_equipment_data",
              description: "Extract structured equipment data from an asset label image",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Equipment name or type" },
                  manufacturer: { type: "string", description: "Brand or manufacturer name" },
                  model: { type: "string", description: "Model number" },
                  serial_number: { type: "string", description: "Serial number" },
                  voltage: { type: "string", description: "Voltage rating" },
                  power: { type: "string", description: "Power rating (watts/amps)" },
                  manufacture_date: { type: "string", description: "Manufacturing date in YYYY-MM-DD format" },
                  warranty_info: { type: "string", description: "Warranty information" },
                  certifications: { type: "string", description: "Safety certifications" },
                  additional_specs: { type: "string", description: "Other technical specifications" },
                  notes: { type: "string", description: "Any other relevant information from the label" },
                },
                required: ["name"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_equipment_data" } },
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
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call result from AI");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("scan-asset-label error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
