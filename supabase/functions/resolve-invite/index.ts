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
    const { inviteToken, telegramUserId, walletAddress } = await req.json();

    if (!inviteToken) {
      return new Response(
        JSON.stringify({ error: "inviteToken is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Look up invite
    const { data: invite, error: inviteErr } = await supabase
      .from("agreement_invites")
      .select("*")
      .eq("invite_token", inviteToken)
      .maybeSingle();

    if (inviteErr || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agreementId = invite.agreement_id;
    const participantId = invite.participant_id;

    // 2. Mark invite as opened
    const now = new Date().toISOString();
    await supabase
      .from("agreement_invites")
      .update({
        opened_at: invite.opened_at || now,
        opened_by_telegram_user_id: invite.opened_by_telegram_user_id || telegramUserId || null,
        status: "opened",
      })
      .eq("id", invite.id);

    // 3. If participant_id exists, link telegram/wallet and update timestamps
    let participant = null;
    if (participantId) {
      const updates: Record<string, any> = {};
      if (!invite.opened_at) updates.opened_at = now;
      updates.viewed_at = now;
      if (telegramUserId) updates.telegram_user_id = telegramUserId;
      if (walletAddress) updates.wallet_address = walletAddress;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("agreement_participants")
          .update(updates)
          .eq("id", participantId);
      }

      const { data: p } = await supabase
        .from("agreement_participants")
        .select("*")
        .eq("id", participantId)
        .single();
      participant = p;
    }

    // 4. Fetch agreement
    const { data: agreement } = await supabase
      .from("agreement_drafts")
      .select("id, title, summary, status, parties, terms, full_text, allocations, created_at")
      .eq("id", agreementId)
      .single();

    if (!agreement) {
      return new Response(
        JSON.stringify({ error: "Agreement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Log deep_link_opened event
    await supabase.from("agreement_events").insert({
      agreement_id: agreementId,
      participant_id: participantId || null,
      event_type: "deep_link_opened",
      telegram_user_id: telegramUserId || null,
      wallet_address: walletAddress || null,
      metadata_json: { invite_token: inviteToken },
    });

    return new Response(
      JSON.stringify({
        agreement,
        participant,
        invite: {
          id: invite.id,
          status: "opened",
          participantId,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("resolve-invite error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
