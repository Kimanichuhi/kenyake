import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const createSupabase = (): SupabaseClient => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE not configured");
  return createClient(url, key, { auth: { persistSession: false } });
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return jsonResponse({ error: "Missing token or password" }, 400);
    }

    const supabase = createSupabase();

    const { data: invite, error: inviteError } = await supabase
      .from("admin_invites")
      .select("id, email, used_at, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !invite) {
      return jsonResponse({ error: "Invalid invite link" }, 400);
    }
    if (invite.used_at || new Date(invite.expires_at) < new Date()) {
      return jsonResponse({ error: "This invite link has expired" }, 400);
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
    });

    if (createError || !created?.user) {
      const message = createError?.message?.toLowerCase().includes("already")
        ? "This email already has an account — use the search box above to grant them admin access instead."
        : createError?.message || "Failed to create account";
      return jsonResponse({ error: message }, 400);
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) {
      return jsonResponse({ error: roleError.message || "Failed to grant admin role" }, 400);
    }

    await supabase.from("admin_invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

    return jsonResponse({ email: invite.email });
  } catch (e) {
    console.error("admin-accept-invite error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
