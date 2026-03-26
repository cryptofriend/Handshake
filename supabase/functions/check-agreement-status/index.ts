import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const agreementId = url.searchParams.get("agreementId");

    if (!agreementId) {
      return new Response(
        JSON.stringify({ error: "agreementId query param is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: agreement, error: agError } = await supabase
      .from("agreement_drafts")
      .select("id, title, summary, status, parties, terms, created_at")
      .eq("id", agreementId)
      .maybeSingle();

    if (agError || !agreement) {
      return new Response(
        JSON.stringify({ error: "Agreement not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: signatures } = await supabase
      .from("agreement_signatures")
      .select("id, wallet_address, party_name, tx_hash, blockchain_status, signed_at")
      .eq("agreement_id", agreementId);

    const { data: participants } = await supabase
      .from("agreement_participants")
      .select("id, name, role, signature_status, wallet_address, signed_at")
      .eq("agreement_id", agreementId);

    const sigCount = (signatures || []).length;
    const partyCount = ((agreement.parties as any[]) || []).length;
    const isFullySigned = sigCount >= partyCount && partyCount > 0;

    return new Response(
      JSON.stringify({
        agreement: {
          ...agreement,
          computed_status: isFullySigned ? "fully_signed" : sigCount > 0 ? "partially_signed" : agreement.status,
        },
        signatures: signatures || [],
        participants: participants || [],
        summary: {
          total_parties: partyCount,
          total_signatures: sigCount,
          fully_signed: isFullySigned,
          pending_signatures: Math.max(0, partyCount - sigCount),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-agreement-status error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
