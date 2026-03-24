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

    // Validate required fields
    const { title, summary, parties, terms, fullText } = body;

    if (!title || !parties || !Array.isArray(parties) || parties.length < 2) {
      return new Response(
        JSON.stringify({
          error: "Required: title, parties (array with at least 2 entries)",
        }),
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
    const signUrl = `/sign/${agreementId}`;

    return new Response(
      JSON.stringify({
        agreementId,
        signUrl,
        createdAt: data.created_at,
        parties: parties.map((p: any) => ({
          name: p.name || p,
          role: p.role || null,
          signUrl,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-agreement error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
