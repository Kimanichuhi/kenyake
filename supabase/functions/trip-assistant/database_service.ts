import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Intent } from "./intent_classifier.ts";

export type StructuredResult = {
  type: string;
  results: unknown[];
  source: "internal";
};

export const createSupabase = (): SupabaseClient => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY not configured");
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

export const queryDatabase = async (
  supabase: SupabaseClient,
  intent: Intent,
): Promise<StructuredResult> => {
  switch (intent) {
    case "WILDLIFE": {
      const results = await safeQuery(() =>
        supabase
          .from("wildlife_sightings")
          .select("species, location_name, park_name, description, created_at, lat, lng, verified")
          .order("created_at", { ascending: false })
          .limit(10),
      );
      return { type: "wildlife_results", results, source: "internal" };
    }
    case "CULTURAL_EVENTS": {
      const results = await safeQuery(() =>
        supabase
          .from("community_events")
          .select("title, start_date, end_date, location_name, county, event_type, price, description, lat, lng")
          .eq("is_published", true)
          .eq("is_past", false)
          .order("start_date", { ascending: true })
          .limit(10),
      );
      return { type: "cultural_event_results", results, source: "internal" };
    }
    case "GUIDES": {
      const results = await safeQuery(() =>
        supabase
          .from("guides")
          .select("name, county, location, languages, price_per_day, rating, is_available, is_verified")
          .eq("is_published", true)
          .eq("is_available", true)
          .limit(10),
      );
      return { type: "guide_results", results, source: "internal" };
    }
    case "EXPERIENCES": {
      const results = await safeQuery(() =>
        supabase
          .from("experiences")
          .select("title, short_description, category, duration_minutes, price_amount, price_currency, location_name, county, rating")
          .eq("is_published", true)
          .limit(10),
      );
      return { type: "experience_results", results, source: "internal" };
    }
    case "FOOD": {
      const results = await safeQuery(() =>
        supabase
          .from("food_listings")
          .select("name, description, price_range, county, location, is_community_kitchen, cuisine_type")
          .eq("is_published", true)
          .limit(10),
      );
      return { type: "food_results", results, source: "internal" };
    }
    case "TRANSPORT": {
      const routes = await safeQuery(() =>
        supabase
          .from("transport_routes")
          .select("name, route_type, distance_km, duration_minutes, origin, destination, highlights, warnings")
          .eq("is_published", true)
          .limit(10),
      );
      const vehicles = await safeQuery(() =>
        supabase
          .from("transport_vehicles")
          .select("name, vehicle_type, price_per_day, price_display, is_available, capacity")
          .eq("is_published", true)
          .eq("is_available", true)
          .limit(10),
      );
      return { type: "transport_results", results: [...routes, ...vehicles], source: "internal" };
    }
    case "SAFETY": {
      const results = await safeQuery(() =>
        supabase
          .from("safety_alerts")
          .select("title, severity, description, county, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(10),
      );
      return { type: "safety_results", results, source: "internal" };
    }
    case "MARKETPLACE": {
      const results = await safeQuery(() =>
        supabase
          .from("marketplace_products")
          .select("name, description, price_display, category, county, community_impact, safety, is_available")
          .eq("is_published", true)
          .eq("is_available", true)
          .limit(10),
      );
      return { type: "marketplace_results", results, source: "internal" };
    }
    case "DESTINATIONS": {
      // Destinations are currently client-side; return empty if not available in DB.
      return { type: "destination_results", results: [], source: "internal" };
    }
    default:
      return { type: "unknown_results", results: [], source: "internal" };
  }
};
