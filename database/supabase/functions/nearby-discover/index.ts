import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lng, radiusHours, destinations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Kenya travel expert AI. Given a tourist's current GPS coordinates and a travel radius (in driving hours), generate personalized nearby discovery data. Return a JSON object with these exact keys:

1. "hiddenGems": Array of 3-5 objects with { name, description, lat, lng, type, distanceMinutes, whyHidden }. These are lesser-known spots tourists typically miss.

2. "timeSensitive": Array of 2-4 objects with { title, description, type, urgency, timeWindow, lat, lng }. Events or natural phenomena happening RIGHT NOW or today. Types: "event", "wildlife", "weather", "cultural". Urgency: "now", "today", "this_week".

3. "detourSuggestions": Array of 2-3 objects with { name, description, lat, lng, addedMinutes, worthIt, highlights }. Quick detours that add minimal time but maximum value.

4. "whatTouristsMiss": Array of 3-5 objects with { title, description, category, insiderTip }. Categories: "food", "viewpoint", "interaction", "timing", "route".

Be specific to KENYA. Use real place names and realistic coordinates near the given location. Make time-sensitive items feel current and urgent. Hidden gems should be genuinely off the beaten path. Consider the current month for seasonal relevance.`;

    const userPrompt = `Tourist location: ${lat}, ${lng}
Travel radius: ${radiusHours} hour(s) driving
Known destinations nearby: ${destinations?.map((d: any) => d.name).join(", ") || "none specified"}
Current date: ${new Date().toISOString().split("T")[0]}

Generate nearby discovery recommendations.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_discoveries",
              description: "Return nearby discovery data for the tourist",
              parameters: {
                type: "object",
                properties: {
                  hiddenGems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        lat: { type: "number" },
                        lng: { type: "number" },
                        type: { type: "string" },
                        distanceMinutes: { type: "number" },
                        whyHidden: { type: "string" },
                      },
                      required: ["name", "description", "lat", "lng", "type", "distanceMinutes", "whyHidden"],
                    },
                  },
                  timeSensitive: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        type: { type: "string", enum: ["event", "wildlife", "weather", "cultural"] },
                        urgency: { type: "string", enum: ["now", "today", "this_week"] },
                        timeWindow: { type: "string" },
                        lat: { type: "number" },
                        lng: { type: "number" },
                      },
                      required: ["title", "description", "type", "urgency", "timeWindow", "lat", "lng"],
                    },
                  },
                  detourSuggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        lat: { type: "number" },
                        lng: { type: "number" },
                        addedMinutes: { type: "number" },
                        worthIt: { type: "string" },
                        highlights: { type: "array", items: { type: "string" } },
                      },
                      required: ["name", "description", "lat", "lng", "addedMinutes", "worthIt", "highlights"],
                    },
                  },
                  whatTouristsMiss: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        category: { type: "string", enum: ["food", "viewpoint", "interaction", "timing", "route"] },
                        insiderTip: { type: "string" },
                      },
                      required: ["title", "description", "category", "insiderTip"],
                    },
                  },
                },
                required: ["hiddenGems", "timeSensitive", "detourSuggestions", "whatTouristsMiss"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_discoveries" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const discoveries = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(discoveries), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nearby-discover error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
