import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return new Response(
        JSON.stringify({ connected: false, details_submitted: false, payouts_enabled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: profile.stripe_account_id,
    });

    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
    const pendingBalance = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;

    return new Response(
      JSON.stringify({
        connected: true,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        available_balance: availableBalance,
        pending_balance: pendingBalance,
        currency: balance.available[0]?.currency || "eur",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
