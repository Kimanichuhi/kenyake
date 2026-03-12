import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabase } from "../trip-assistant/database_service.ts";
import { routeQuery } from "../trip-assistant/query_router.ts";
import { setCached, getCacheKey } from "../trip-assistant/cache_service.ts";
import type { Intent } from "../trip-assistant/intent_classifier.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intents } = await req.json();
    const list = (Array.isArray(intents) ? intents : []) as Intent[];
    if (list.length === 0) {
      return new Response(JSON.stringify({ error: "intents array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createSupabase();
    const refreshed: Record<string, number> = {};

    for (const intent of list) {
      const data = await routeQuery(supabase, intent);
      const key = getCacheKey(intent, intent);
      await setCached(supabase, key, data, 1000 * 60 * 10);
      refreshed[intent] = data.results.length;
    }

    return new Response(JSON.stringify({ refreshed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cache-refresh error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
