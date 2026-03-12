import type { Intent } from "./intent_classifier.ts";
import type { StructuredResult } from "./database_service.ts";
import { queryDatabase } from "./database_service.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const routeQuery = async (
  supabase: SupabaseClient,
  intent: Intent,
): Promise<StructuredResult> => {
  return queryDatabase(supabase, intent);
};
