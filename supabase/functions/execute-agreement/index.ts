import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agreement_id, participants, terms } = await req.json();

    if (!agreement_id || !participants) {
      return new Response(JSON.stringify({ error: "Missing agreement_id or participants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Update agreement status
    await supabase
      .from("agreement_drafts")
      .update({ status: "executed", updated_at: new Date().toISOString() })
      .eq("id", agreement_id);

    // Log execution event
    await supabase.from("agreement_events").insert({
      agreement_id,
      event_type: "executed",
      metadata_json: { participants, terms, executed_at: new Date().toISOString() },
    });

    console.log(`Agreement ${agreement_id} executed`, { participants, terms });

    return new Response(
      JSON.stringify({
        success: true,
        agreement_id,
        status: "executed",
        executed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Execute agreement error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
