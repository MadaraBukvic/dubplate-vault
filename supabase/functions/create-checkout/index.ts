import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_COMMISSION = 0.15; // 15%

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
    if (!user?.email) throw new Error("User not authenticated");

    const { trackId } = await req.json();
    if (!trackId) throw new Error("trackId is required");

    // Fetch track + producer profile using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: track, error: trackError } = await supabaseAdmin
      .from("tracks")
      .select("*, profiles!tracks_producer_id_fkey(display_name, stripe_account_id)")
      .eq("id", trackId)
      .single();

    if (trackError || !track) throw new Error("Track not found");

    // Check availability
    const remaining = track.max_copies - track.copies_sold;
    if (remaining <= 0) throw new Error("Track is sold out");

    // Check if user already purchased this track
    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("track_id", trackId)
      .maybeSingle();

    if (existingPurchase) throw new Error("You already own this track");

    // Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const producerName = track.profiles?.display_name || "Unknown Producer";
    const unitAmount = Math.round(track.price_eur * 100);
    const applicationFee = Math.round(unitAmount * PLATFORM_COMMISSION);
    const producerStripeAccountId = track.profiles?.stripe_account_id;

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: track.title,
              description: `Exclusive dubplate by ${producerName} · ${track.bpm} BPM · ${track.key} · ${track.genre}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/track/${trackId}`,
      metadata: {
        track_id: trackId,
        buyer_id: user.id,
      },
    };

    // If producer has Connect account, use payment splitting
    if (producerStripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: producerStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
