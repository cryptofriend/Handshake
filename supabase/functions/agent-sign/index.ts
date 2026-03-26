import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hash)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-agent-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing x-agent-key header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agreementId, inviteToken } = await req.json();
    if (!agreementId) {
      return new Response(
        JSON.stringify({ error: "agreementId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify API key
    const keyHash = await hashKey(apiKey);
    const { data: agentKey, error: keyError } = await supabase
      .from("agent_api_keys")
      .select("*")
      .eq("api_key_hash", keyHash)
      .eq("is_active", true)
      .maybeSingle();

    if (keyError || !agentKey) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify agreement exists
    const { data: agreement, error: agError } = await supabase
      .from("agreement_drafts")
      .select("*")
      .eq("id", agreementId)
      .maybeSingle();

    if (agError || !agreement) {
      return new Response(
        JSON.stringify({ error: "Agreement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve participant if invite token provided
    let participantId: string | null = null;
    if (inviteToken) {
      const { data: invite } = await supabase
        .from("agreement_invites")
        .select("participant_id")
        .eq("invite_token", inviteToken)
        .eq("agreement_id", agreementId)
        .maybeSingle();
      participantId = invite?.participant_id || null;
    }

    // Check if already signed
    const { data: existingSig } = await supabase
      .from("agreement_signatures")
      .select("id")
      .eq("agreement_id", agreementId)
      .eq("wallet_address", agentKey.wallet_address)
      .maybeSingle();

    if (existingSig) {
      return new Response(
        JSON.stringify({ error: "Agent has already signed this agreement", signature_id: existingSig.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create proof hash
    const proofData = `${agreementId}:${agentKey.wallet_address}:${Date.now()}`;
    const proofHash = await hashKey(proofData);
    const txHash = `agent:${proofHash.slice(0, 32)}`;

    // Insert signature
    const { data: sig, error: sigError } = await supabase
      .from("agreement_signatures")
      .insert({
        agreement_id: agreementId,
        wallet_address: agentKey.wallet_address,
        party_name: agentKey.agent_name,
        tx_hash: txHash,
        blockchain_status: "confirmed",
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sigError) throw sigError;

    // Update participant if resolved
    if (participantId) {
      await supabase
        .from("agreement_participants")
        .update({
          signed_at: new Date().toISOString(),
          signature_status: "signed",
          wallet_address: agentKey.wallet_address,
        })
        .eq("id", participantId);
    }

    // Log event
    await supabase.from("agreement_events").insert({
      agreement_id: agreementId,
      participant_id: participantId,
      event_type: "signature_completed",
      wallet_address: agentKey.wallet_address,
      metadata_json: { agent_name: agentKey.agent_name, tx_hash: txHash, method: "api_key" },
    });

    // Update last_used_at
    await supabase
      .from("agent_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", agentKey.id);

    return new Response(
      JSON.stringify({
        ok: true,
        signature: {
          id: sig.id,
          agreement_id: agreementId,
          wallet_address: agentKey.wallet_address,
          agent_name: agentKey.agent_name,
          tx_hash: txHash,
          signed_at: sig.signed_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("agent-sign error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
