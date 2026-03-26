import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agreementId, participantId, eventType, telegramUserId, walletAddress, metadata } = await req.json();

    if (!agreementId || !eventType) {
      return new Response(
        JSON.stringify({ error: "agreementId and eventType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If wallet_connected event, also update participant record
    if (eventType === "wallet_connected" && participantId && walletAddress) {
      await supabase
        .from("agreement_participants")
        .update({ wallet_address: walletAddress })
        .eq("id", participantId);
    }

    // If signature_completed, update participant
    if (eventType === "signature_completed" && participantId) {
      await supabase
        .from("agreement_participants")
        .update({
          signed_at: new Date().toISOString(),
          signature_status: "signed",
          ...(walletAddress ? { wallet_address: walletAddress } : {}),
        })
        .eq("id", participantId);
    }

    const { error } = await supabase.from("agreement_events").insert({
      agreement_id: agreementId,
      participant_id: participantId || null,
      event_type: eventType,
      telegram_user_id: telegramUserId || null,
      wallet_address: walletAddress || null,
      metadata_json: metadata || {},
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("log-agreement-event error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
