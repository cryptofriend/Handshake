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
    const body = await req.json();
    const { title, summary, parties, terms, fullText } = body;

    if (!title || !parties || !Array.isArray(parties) || parties.length < 2) {
      return new Response(
        JSON.stringify({ error: "Required: title, parties (array with at least 2 entries)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Required: terms (non-empty array)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!fullText) {
      return new Response(
        JSON.stringify({ error: "Required: fullText (complete agreement text)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allocations = body.allocations || [];
    const missingFields = body.missingFields || [];
    const sessionId = body.sessionId || `agent-${crypto.randomUUID()}`;
    const userId = body.userId || null;

    // 1. Create agreement draft
    const { data, error } = await supabase
      .from("agreement_drafts")
      .insert({
        session_id: sessionId,
        user_id: userId,
        title,
        summary: summary || "",
        parties,
        terms,
        missing_fields: missingFields,
        status: "sign_ready",
        full_text: fullText,
        allocations,
        full_response: body,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Insert error:", error);
      throw new Error("Failed to store agreement");
    }

    const agreementId = data.id;

    // 2. Create participant records and invite tokens for each party
    const participantResults = [];
    for (const party of parties) {
      const name = party.name || party;
      const role = party.role || null;

      // Create participant
      const { data: participant, error: pErr } = await supabase
        .from("agreement_participants")
        .insert({
          agreement_id: agreementId,
          name,
          role,
          signature_status: "pending",
        })
        .select("id")
        .single();

      if (pErr) {
        console.error("Participant insert error:", pErr);
        continue;
      }

      // Generate cryptographically strong invite token
      const tokenBytes = new Uint8Array(24);
      crypto.getRandomValues(tokenBytes);
      const inviteToken = Array.from(tokenBytes, (b) => b.toString(16).padStart(2, "0")).join("");

      // Create invite
      const { error: iErr } = await supabase
        .from("agreement_invites")
        .insert({
          agreement_id: agreementId,
          participant_id: participant.id,
          invite_token: inviteToken,
          status: "pending",
        });

      if (iErr) {
        console.error("Invite insert error:", iErr);
      }

      // Log invite_created event
      await supabase.from("agreement_events").insert({
        agreement_id: agreementId,
        participant_id: participant.id,
        event_type: "invite_created",
        metadata_json: { invite_token: inviteToken, party_name: name },
      });

      const signUrl = `/sign/${agreementId}?invite=${inviteToken}`;

      participantResults.push({
        participantId: participant.id,
        name,
        role,
        inviteToken,
        signUrl,
      });
    }

    return new Response(
      JSON.stringify({
        agreementId,
        signUrl: `/sign/${agreementId}`,
        createdAt: data.created_at,
        participants: participantResults,
        // Legacy compat
        parties: participantResults.map((p) => ({
          name: p.name,
          role: p.role,
          signUrl: p.signUrl,
          inviteToken: p.inviteToken,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-agreement error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
