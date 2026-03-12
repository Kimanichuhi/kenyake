import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { StructuredResult } from "./database_service.ts";

const memoryCache = new Map<string, { data: StructuredResult; expiresAt: number }>();
const DEFAULT_TTL_MS = 1000 * 60 * 3;

export const getCacheKey = (intent: string, prompt: string) =>
  `${intent}:${prompt.toLowerCase().slice(0, 120)}`;

export const getCached = async (
  supabase: SupabaseClient,
  key: string,
): Promise<StructuredResult | null> => {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const { data } = await supabase.from("ai_query_cache").select("payload, expires_at").eq("cache_key", key).maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
    return data.payload as StructuredResult;
  } catch {
    return null;
  }
};

export const setCached = async (
  supabase: SupabaseClient,
  key: string,
  value: StructuredResult,
  ttlMs = DEFAULT_TTL_MS,
) => {
  memoryCache.set(key, { data: value, expiresAt: Date.now() + ttlMs });
  try {
    await supabase.from("ai_query_cache").upsert({
      cache_key: key,
      payload: value,
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: "cache_key" });
  } catch {
    // Ignore if table is missing
  }
};
