import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referenceImageUrl, verificationImageUrl, areaName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!referenceImageUrl || !verificationImageUrl) {
      return new Response(
        JSON.stringify({ error: "Both reference and verification images are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a food safety inspector AI that verifies cleaning compliance. 
Compare the reference image (showing the expected clean state) with the verification image (showing current state).
Determine if the area meets cleanliness standards.
Be strict but fair - look for:
- Visible debris, spills, or stains
- Proper organization
- Hygiene hazards
- Overall cleanliness matching reference

Respond ONLY with valid JSON in this exact format:
{
  "approved": true/false,
  "confidence": 0-100,
  "notes": "Brief explanation of decision"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare these two images of "${areaName || 'cleaning area'}". The first is the REFERENCE (expected clean state), the second is the VERIFICATION (current state to check). Determine if the current state meets the cleanliness standard shown in the reference.`
              },
              {
                type: "image_url",
                image_url: { url: referenceImageUrl }
              },
              {
                type: "image_url",
                image_url: { url: verificationImageUrl }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI verification failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Default to manual review needed
      result = {
        approved: false,
        confidence: 0,
        notes: "AI could not determine verification status. Manual review required."
      };
    }

    return new Response(
      JSON.stringify({
        status: result.approved ? "approved" : "rejected",
        confidence: result.confidence,
        notes: result.notes
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
