import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Validate bearer token
    const authHeader = req.headers.get("authorization") || "";
    const expectedSecret = Deno.env.get("HANDSHAKE_PROXY_SECRET");
    if (!expectedSecret) {
      throw new Error("HANDSHAKE_PROXY_SECRET is not configured");
    }
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse incoming payload
    const { sessionId, userId, message, conversation, activeAgreementId } = await req.json();

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "sessionId and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Forward to Open Claw / Handshake upstream ---
    const upstreamUrl = Deno.env.get("OPENCLAW_API_URL");
    const upstreamSecret = Deno.env.get("OPENCLAW_API_SECRET");

    if (!upstreamUrl) {
      // Upstream not configured yet — return a placeholder response
      console.warn("OPENCLAW_API_URL not set, returning stub response");
      return new Response(
        JSON.stringify({
          reply:
            "The Handshake agent is not connected yet. Please configure the upstream API URL.",
          status: "needs_clarification",
          agreement: null,
          actions: { openAgreementUrl: null },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (upstreamSecret) {
      upstreamHeaders["Authorization"] = `Bearer ${upstreamSecret}`;
    }

    const upstreamResp = await fetch(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify({
        sessionId,
        userId: userId || null,
        message,
        conversation: conversation || [],
        activeAgreementId: activeAgreementId || null,
      }),
    });

    if (!upstreamResp.ok) {
      const errText = await upstreamResp.text();
      console.error("Upstream error:", upstreamResp.status, errText);
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstreamResp.status}` }),
        { status: upstreamResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await upstreamResp.json();

    // Pass through the response as-is (expected to match the agreed JSON shape)
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("handshake-respond error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
