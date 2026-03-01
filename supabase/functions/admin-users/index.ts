import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the calling user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin using service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIST all users
    if (req.method === "GET" && action === "list") {
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("*")
        .order("xp", { ascending: false });

      // Get auth users for email info
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers();
      
      const usersWithEmail = (profiles || []).map(p => {
        const authUser = authUsers?.find(u => u.id === p.user_id);
        return {
          ...p,
          email: authUser?.email || "N/A",
        };
      });

      return new Response(JSON.stringify({ users: usersWithEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE a user
    if (req.method === "POST" && action === "delete") {
      const { target_user_id } = await req.json();
      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "target_user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Don't allow deleting yourself
      if (target_user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot delete your own admin account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete all user data
      await Promise.all([
        adminClient.from("ai_activities").delete().eq("user_id", target_user_id),
        adminClient.from("daily_activities").delete().eq("user_id", target_user_id),
        adminClient.from("study_sessions").delete().eq("user_id", target_user_id),
        adminClient.from("user_inventory").delete().eq("user_id", target_user_id),
        adminClient.from("user_streaks").delete().eq("user_id", target_user_id),
        adminClient.from("weekly_goals").delete().eq("user_id", target_user_id),
        adminClient.from("user_roles").delete().eq("user_id", target_user_id),
        adminClient.from("profiles").delete().eq("user_id", target_user_id),
      ]);

      // Delete auth user
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(target_user_id);
      if (deleteError) {
        console.error("Error deleting auth user:", deleteError);
        return new Response(JSON.stringify({ error: "Failed to delete user auth" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
