import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashData(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hash)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agreementId, walletAddress, proof, partyName, participantId } = await req.json();

    if (!agreementId || !walletAddress || !proof) {
      return new Response(
        JSON.stringify({ error: "agreementId, walletAddress, and proof are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify agreement exists
    const { data: agreement, error: agError } = await supabase
      .from("agreement_drafts")
      .select("id, title")
      .eq("id", agreementId)
      .maybeSingle();

    if (agError || !agreement) {
      return new Response(
        JSON.stringify({ error: "Agreement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already signed
    const { data: existingSig } = await supabase
      .from("agreement_signatures")
      .select("id")
      .eq("agreement_id", agreementId)
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (existingSig) {
      return new Response(
        JSON.stringify({ error: "Already signed", signature_id: existingSig.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a proof hash from the ton_proof data
    const proofPayload = proof.payload || "";
    const proofTimestamp = proof.timestamp || Math.floor(Date.now() / 1000);
    const proofDomain = proof.domain?.value || "";
    const proofSignature = proof.signature || "";

    const proofString = `${agreementId}:${walletAddress}:${proofPayload}:${proofTimestamp}:${proofSignature.slice(0, 32)}`;
    const txHash = `proof:${await hashData(proofString)}`;

    // Insert signature
    const { data: sig, error: sigError } = await supabase
      .from("agreement_signatures")
      .insert({
        agreement_id: agreementId,
        wallet_address: walletAddress,
        party_name: partyName || "Signer",
        tx_hash: txHash,
        blockchain_status: "confirmed",
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sigError) throw sigError;

    // Update participant if provided
    if (participantId) {
      await supabase
        .from("agreement_participants")
        .update({
          signed_at: new Date().toISOString(),
          signature_status: "signed",
          wallet_address: walletAddress,
        })
        .eq("id", participantId);
    }

    // Log event
    await supabase.from("agreement_events").insert({
      agreement_id: agreementId,
      participant_id: participantId || null,
      event_type: "signature_completed",
      wallet_address: walletAddress,
      metadata_json: {
        method: "ton_proof",
        tx_hash: txHash,
        proof_payload: proofPayload,
        proof_timestamp: proofTimestamp,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        signature: {
          id: sig.id,
          agreement_id: agreementId,
          wallet_address: walletAddress,
          tx_hash: txHash,
          signed_at: sig.signed_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-ton-proof error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
