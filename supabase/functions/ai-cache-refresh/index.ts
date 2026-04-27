import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Intent =
  | "DESTINATIONS" | "WILDLIFE" | "CULTURAL_EVENTS" | "HERITAGE" | "GUIDES"
  | "EXPERIENCES" | "FOOD" | "TRANSPORT" | "SAFETY" | "MARKETPLACE" | "UNKNOWN";

type StructuredResult = { type: string; results: unknown[]; source: "internal" };

const createSupabase = (): SupabaseClient => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("SUPABASE not configured");
  return createClient(url, key, { auth: { persistSession: false } });
};

const safeQuery = async (fn: () => Promise<{ data: any[] | null; error: any }>) => {
  try {
    const { data, error } = await fn();
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
};

const queryDatabase = async (supabase: SupabaseClient, intent: Intent): Promise<StructuredResult> => {
  switch (intent) {
    case "WILDLIFE": {
      const results = await safeQuery(() => supabase.from("wildlife_sightings")
        .select("species, location_name, park_name, description, created_at, lat, lng, verified")
        .order("created_at", { ascending: false }).limit(10));
      return { type: "wildlife_results", results, source: "internal" };
    }
    case "CULTURAL_EVENTS": {
      const results = await safeQuery(() => supabase.from("community_events")
        .select("title, start_date, end_date, location_name, county, event_type, price, description, lat, lng")
        .eq("is_published", true).eq("is_past", false).order("start_date", { ascending: true }).limit(10));
      return { type: "cultural_event_results", results, source: "internal" };
    }
    case "GUIDES": {
      const results = await safeQuery(() => supabase.from("guides")
        .select("name, county, location, languages, price_per_day, rating, is_available, is_verified")
        .eq("is_published", true).eq("is_available", true).limit(10));
      return { type: "guide_results", results, source: "internal" };
    }
    case "HERITAGE": {
      const results = await safeQuery(() => supabase.from("cultural_programmes")
        .select("title, description, price_amount, price_currency, start_dates, duration_weeks, slug")
        .eq("is_published", true).limit(10));
      return { type: "heritage_results", results, source: "internal" };
    }
    case "EXPERIENCES": {
      const results = await safeQuery(() => supabase.from("experiences")
        .select("title, short_description, category, duration_minutes, price_amount, price_currency, location_name, county, rating")
        .eq("is_published", true).limit(10));
      return { type: "experience_results", results, source: "internal" };
    }
    case "FOOD": {
      const results = await safeQuery(() => supabase.from("food_listings")
        .select("name, description, price_range, county, location, is_community_kitchen, cuisine_type")
        .eq("is_published", true).limit(10));
      return { type: "food_results", results, source: "internal" };
    }
    case "TRANSPORT": {
      const routes = await safeQuery(() => supabase.from("transport_routes")
        .select("name, route_type, distance_km, duration_minutes, origin, destination, highlights, warnings")
        .eq("is_published", true).limit(10));
      const vehicles = await safeQuery(() => supabase.from("transport_vehicles")
        .select("name, vehicle_type, price_per_day, price_display, is_available, capacity")
        .eq("is_published", true).eq("is_available", true).limit(10));
      return { type: "transport_results", results: [...routes, ...vehicles], source: "internal" };
    }
    case "SAFETY": {
      const results = await safeQuery(() => supabase.from("safety_alerts")
        .select("title, severity, description, county, created_at")
        .eq("is_active", true).order("created_at", { ascending: false }).limit(10));
      return { type: "safety_results", results, source: "internal" };
    }
    case "MARKETPLACE": {
      const results = await safeQuery(() => supabase.from("marketplace_products")
        .select("name, description, price_display, category, county, community_impact, safety, is_available")
        .eq("is_published", true).eq("is_available", true).limit(10));
      return { type: "marketplace_results", results, source: "internal" };
    }
    case "DESTINATIONS": {
      const results = await safeQuery(() => supabase.from("destinations")
        .select("name, county, category, rating, best_time, price, description, highlights, lat, lng").limit(10));
      return { type: "destination_results", results, source: "internal" };
    }
    default:
      return { type: "unknown_results", results: [], source: "internal" };
  }
};

const getCacheKey = (intent: string, prompt: string) =>
  `${intent}:${prompt.toLowerCase().slice(0, 120)}`;

const setCached = async (supabase: SupabaseClient, key: string, value: StructuredResult, ttlMs = 1000 * 60 * 10) => {
  try {
    await supabase.from("ai_query_cache").upsert({
      cache_key: key,
      payload: value,
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: "cache_key" });
  } catch {
    // ignore
  }
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
      const data = await queryDatabase(supabase, intent);
      const key = getCacheKey(intent, intent);
      await setCached(supabase, key, data);
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
