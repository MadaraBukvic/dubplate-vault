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

  try {
    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabaseClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const trackId = session.metadata?.track_id;
    const buyerId = session.metadata?.buyer_id;

    if (!trackId || !buyerId || buyerId !== user.id) {
      throw new Error("Invalid session metadata");
    }

    // Use service role for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if purchase already recorded (idempotency)
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("track_id", trackId)
      .eq("buyer_id", buyerId)
      .eq("stripe_payment_id", session.payment_intent as string)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, message: "Already recorded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        buyer_id: buyerId,
        track_id: trackId,
        stripe_payment_id: session.payment_intent as string,
      })
      .select()
      .single();

    if (purchaseError) throw new Error(`Purchase creation failed: ${purchaseError.message}`);

    // Create license record
    await supabaseAdmin.from("licenses").insert({
      purchase_id: purchase.id,
    });

    // Increment copies_sold on track
    const { data: track } = await supabaseAdmin
      .from("tracks")
      .select("copies_sold")
      .eq("id", trackId)
      .single();

    if (track) {
      await supabaseAdmin
        .from("tracks")
        .update({ copies_sold: track.copies_sold + 1 })
        .eq("id", trackId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
