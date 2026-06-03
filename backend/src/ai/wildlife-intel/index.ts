import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { queryType, species, park, month } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Kenya wildlife intelligence system with deep knowledge of East African ecology. Return structured JSON data only.

Current date context: ${new Date().toISOString().split("T")[0]}
Current month: ${new Date().toLocaleString("en", { month: "long" })}`;

    let userPrompt = "";
    let toolDef: any;

    if (queryType === "species_tracking") {
      userPrompt = `Generate tracking intelligence for species: ${species || "all Big Five"} in Kenya. Include best zones, current activity patterns, photography tips, conservation status, and behavior notes.`;
      toolDef = {
        name: "return_species_data",
        description: "Return species tracking intelligence",
        parameters: {
          type: "object",
          properties: {
            species: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  scientificName: { type: "string" },
                  category: { type: "string" },
                  conservationStatus: { type: "string" },
                  population: { type: "string" },
                  bestZones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, park: { type: "string" }, probability: { type: "string" }, lat: { type: "number" }, lng: { type: "number" } }, required: ["name", "park", "probability", "lat", "lng"] } },
                  currentBehavior: { type: "string" },
                  bestTimeOfDay: { type: "string" },
                  photographyTips: { type: "string" },
                  bestPhotoConditions: { type: "string" },
                  funFact: { type: "string" },
                },
                required: ["name", "scientificName", "category", "conservationStatus", "population", "bestZones", "currentBehavior", "bestTimeOfDay", "photographyTips", "bestPhotoConditions", "funFact"],
              },
            },
          },
          required: ["species"],
        },
      };
    } else if (queryType === "migration") {
      userPrompt = `Generate the current migration calendar and predictions for Kenya wildlife. Include wildebeest migration status, bird migrations, marine life seasons. Focus on what's happening NOW and upcoming months.`;
      toolDef = {
        name: "return_migration_data",
        description: "Return migration calendar data",
        parameters: {
          type: "object",
          properties: {
            wildebeestMigration: {
              type: "object",
              properties: {
                currentPhase: { type: "string" },
                currentLocation: { type: "string" },
                nextPhase: { type: "string" },
                crossingPrediction: { type: "string" },
                crossingAlert: { type: "boolean" },
                bestViewingSpots: { type: "array", items: { type: "object", properties: { name: { type: "string" }, lat: { type: "number" }, lng: { type: "number" }, tip: { type: "string" } }, required: ["name", "lat", "lng", "tip"] } },
              },
              required: ["currentPhase", "currentLocation", "nextPhase", "crossingPrediction", "crossingAlert", "bestViewingSpots"],
            },
            monthlyCalendar: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                  isCurrent: { type: "boolean" },
                },
                required: ["month", "highlights", "isCurrent"],
              },
            },
            birdMigrations: { type: "array", items: { type: "object", properties: { species: { type: "string" }, status: { type: "string" }, bestLocation: { type: "string" } }, required: ["species", "status", "bestLocation"] } },
          },
          required: ["wildebeestMigration", "monthlyCalendar", "birdMigrations"],
        },
      };
    } else if (queryType === "big_five") {
      userPrompt = `Generate Big Five probability data by zone and current season for Kenya. Include lion, leopard, elephant, buffalo, rhino. Rate each zone's probability as percentage.`;
      toolDef = {
        name: "return_big_five_data",
        description: "Return Big Five probability by zone",
        parameters: {
          type: "object",
          properties: {
            zones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                  lion: { type: "number" },
                  leopard: { type: "number" },
                  elephant: { type: "number" },
                  buffalo: { type: "number" },
                  rhino: { type: "number" },
                  overallRating: { type: "string" },
                  bestTime: { type: "string" },
                  crowdLevel: { type: "string" },
                },
                required: ["name", "lat", "lng", "lion", "leopard", "elephant", "buffalo", "rhino", "overallRating", "bestTime", "crowdLevel"],
              },
            },
          },
          required: ["zones"],
        },
      };
    } else if (queryType === "park_intel") {
      userPrompt = `Generate park intelligence for ${park || "all major Kenya parks"}. Include gate congestion estimates, best entry times, current wildlife highlights, and alerts.`;
      toolDef = {
        name: "return_park_intel",
        description: "Return park intelligence data",
        parameters: {
          type: "object",
          properties: {
            parks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  congestionLevel: { type: "string", enum: ["low", "moderate", "high", "very_high"] },
                  bestEntryTime: { type: "string" },
                  currentHighlights: { type: "array", items: { type: "string" } },
                  alerts: { type: "array", items: { type: "string" } },
                  gateWaitMinutes: { type: "number" },
                  entryFeeUSD: { type: "number" },
                },
                required: ["name", "congestionLevel", "bestEntryTime", "currentHighlights", "alerts", "gateWaitMinutes", "entryFeeUSD"],
              },
            },
          },
          required: ["parks"],
        },
      };
    } else if (queryType === "birding") {
      userPrompt = `Generate birdwatching zone intelligence for Kenya. Include top birding spots, seasonal species, rare sightings, and photography tips.`;
      toolDef = {
        name: "return_birding_data",
        description: "Return birdwatching intelligence",
        parameters: {
          type: "object",
          properties: {
            zones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                  speciesCount: { type: "number" },
                  keySpecies: { type: "array", items: { type: "string" } },
                  bestSeason: { type: "string" },
                  currentHighlight: { type: "string" },
                },
                required: ["name", "lat", "lng", "speciesCount", "keySpecies", "bestSeason", "currentHighlight"],
              },
            },
          },
          required: ["zones"],
        },
      };
    } else {
      return new Response(JSON.stringify({ error: "Unknown queryType" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools: [{ type: "function", function: toolDef }],
        tool_choice: { type: "function", function: { name: toolDef.name } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error: " + response.status);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("wildlife-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
