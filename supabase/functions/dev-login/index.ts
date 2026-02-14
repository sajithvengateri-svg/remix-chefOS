import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Test accounts for dev quick-login
const DEV_ACCOUNTS: Record<string, { email: string; password: string; redirect: string }> = {
  admin: { email: "admin@chefos.app", password: "ChefOS2026!", redirect: "/admin" },
  chef: { email: "durbooz@gmail.com", password: "ChefOS2026!", redirect: "/dashboard" },
  vendor: { email: "sajith.vengateri@gmail.com", password: "ChefOS2026!", redirect: "/vendor/dashboard" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const { persona, action } = await req.json();

    // Action: reset-passwords — uses service role to set known passwords for dev accounts
    if (action === "reset-passwords") {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const results: Record<string, string> = {};

      for (const [key, acct] of Object.entries(DEV_ACCOUNTS)) {
        // Find user by email
        const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
        const user = users?.find(u => u.email === acct.email);
        if (!user) {
          results[key] = `not found (${acct.email})`;
          continue;
        }
        const { error: updateErr } = await adminClient.auth.admin.updateUserById(user.id, {
          password: acct.password,
        });
        results[key] = updateErr ? updateErr.message : "ok";
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: login as persona
    const account = DEV_ACCOUNTS[persona];
    if (!account) {
      return new Response(
        JSON.stringify({ error: `Unknown persona: ${persona}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, hint: "Run with action:'reset-passwords' first" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: { id: data.user?.id, email: data.user?.email },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
