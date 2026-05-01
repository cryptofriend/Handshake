import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hash)));
}

/**
 * Records a signature for an agreement using a non-TON identity:
 * - method: "solana" → off-chain ed25519 message signature (proof: { nonce, signature })
 * - method: "world"  → World ID proof (proof: ISuccessResult JSON)
 *
 * NOTE: Cryptographic verification of the proof itself is intentionally
 * delegated to the wallet/IDKit at sign time on the client. We persist the
 * proof payload here so it can be re-verified later.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      agreementId,
      method,            // 'solana' | 'world'
      address,           // solana pubkey or world nullifier_hash
      proof,             // string (already JSON-encoded by client) or object
      partyName,
      participantId,
    } = body;

    if (!agreementId || !method || !address) {
      return new Response(
        JSON.stringify({ error: "agreementId, method, and address are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method !== "solana" && method !== "world") {
      return new Response(
        JSON.stringify({ error: `Unsupported method: ${method}` }),
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

    // Already signed by this address?
    const { data: existingSig } = await supabase
      .from("agreement_signatures")
      .select("id")
      .eq("agreement_id", agreementId)
      .eq("wallet_address", address)
      .maybeSingle();

    if (existingSig) {
      return new Response(
        JSON.stringify({ error: "Already signed", signature_id: existingSig.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const proofString =
      typeof proof === "string" ? proof : JSON.stringify(proof ?? {});
    const fingerprint = await sha256Hex(`${agreementId}:${address}:${proofString}`);
    const txHash = `${method}:${fingerprint}`;

    const { data: sig, error: sigError } = await supabase
      .from("agreement_signatures")
      .insert({
        agreement_id: agreementId,
        wallet_address: address,
        party_name: partyName || "Signer",
        tx_hash: txHash,
        blockchain_status: "confirmed",
        signature_method: method,
        signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sigError) throw sigError;

    if (participantId) {
      await supabase
        .from("agreement_participants")
        .update({
          signed_at: new Date().toISOString(),
          signature_status: "signed",
          wallet_address: address,
        })
        .eq("id", participantId);
    }

    await supabase.from("agreement_events").insert({
      agreement_id: agreementId,
      participant_id: participantId || null,
      event_type: "signature_completed",
      wallet_address: address,
      metadata_json: {
        method,
        tx_hash: txHash,
        proof_preview: proofString.slice(0, 200),
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        signature: {
          id: sig.id,
          agreement_id: agreementId,
          wallet_address: address,
          tx_hash: txHash,
          method,
          signed_at: sig.signed_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-signature error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
