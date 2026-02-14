import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) throw new Error("Not authenticated");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Not authorized — admin role required");

    const { action, email, userId } = await req.json();

    if (action === "delete_user") {
      // Find user by email if no userId
      let targetId = userId;
      if (!targetId && email) {
        const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) throw listErr;
        const found = users.find((u) => u.email === email);
        if (!found) throw new Error(`No user found with email: ${email}`);
        targetId = found.id;
      }
      if (!targetId) throw new Error("Provide email or userId");

      // Delete related data first (profiles, memberships, roles, etc.)
      await supabase.from("module_permissions").delete().eq("user_id", targetId);
      await supabase.from("user_roles").delete().eq("user_id", targetId);
      await supabase.from("org_memberships").delete().eq("user_id", targetId);
      await supabase.from("profiles").delete().eq("user_id", targetId);
      await supabase.from("signup_events").delete().eq("user_id", targetId);
      await supabase.from("referral_codes").delete().eq("user_id", targetId);

      // Delete auth user
      const { error: delErr } = await supabase.auth.admin.deleteUser(targetId);
      if (delErr) throw delErr;

      return new Response(
        JSON.stringify({ success: true, message: `Deleted user ${email || targetId}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_users") {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      const simplified = users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        confirmed: !!u.email_confirmed_at,
        name: u.user_metadata?.full_name || "",
      }));

      return new Response(
        JSON.stringify({ success: true, users: simplified }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Unknown action");
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
