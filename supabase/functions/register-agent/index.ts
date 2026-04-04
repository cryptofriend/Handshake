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
    const { monsterName, telegramBotToken, walletAddress } = await req.json();

    if (!monsterName || !telegramBotToken || !walletAddress) {
      return new Response(
        JSON.stringify({ error: "Required: monsterName, telegramBotToken, walletAddress" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the Telegram bot token by calling getMe
    const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid Telegram Bot Token. Please check and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const botUsername = tgData.result.username;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate API key for the agent
    const rawKey = crypto.randomUUID() + "-" + crypto.randomUUID();
    const keyHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
    const apiKeyHash = Array.from(new Uint8Array(keyHash), (b) => b.toString(16).padStart(2, "0")).join("");

    // Store agent record
    const { data: agent, error: agentErr } = await supabase
      .from("agent_api_keys")
      .insert({
        agent_name: monsterName,
        wallet_address: walletAddress,
        api_key_hash: apiKeyHash,
        telegram_bot_token: telegramBotToken,
        is_active: true,
      })
      .select("id")
      .single();

    if (agentErr) {
      console.error("Agent insert error:", agentErr);
      throw new Error("Failed to register agent");
    }

    // Create welcome agreement
    const sessionId = `monster-${walletAddress}`;
    const welcomeTitle = `🤝 Welcome to Handshake — ${monsterName}'s First Pact`;
    const welcomeText = `This agreement certifies that ${monsterName} (wallet: ${walletAddress}) has been registered as a personal Handshake Agent.\n\nBy creating this monster, the owner agrees to:\n1. Use this agent for creating and managing digital agreements\n2. Keep their Telegram Bot Token secure\n3. Act in good faith when entering agreements with other parties\n\nBot: @${botUsername}\nRegistered: ${new Date().toISOString()}`;

    const { data: agreement, error: agreementErr } = await supabase
      .from("agreement_drafts")
      .insert({
        session_id: sessionId,
        user_id: walletAddress,
        title: welcomeTitle,
        summary: `${monsterName}'s registration pact — first agreement on the Handshake protocol.`,
        parties: [
          { name: monsterName, role: "Agent Owner" },
          { name: "Handshake Protocol", role: "Platform" },
        ],
        terms: [
          { label: "Agent Registration", value: `${monsterName} is registered as a personal agent` },
          { label: "Bot Identity", value: `@${botUsername}` },
          { label: "Good Faith", value: "Owner commits to acting in good faith" },
        ],
        full_text: welcomeText,
        status: "sign_ready",
        allocations: [],
        missing_fields: [],
      })
      .select("id, created_at")
      .single();

    if (agreementErr) {
      console.error("Agreement insert error:", agreementErr);
      throw new Error("Failed to create welcome agreement");
    }

    // Log registration event
    await supabase.from("agreement_events").insert({
      agreement_id: agreement.id,
      event_type: "monster_registered",
      wallet_address: walletAddress,
      metadata_json: {
        monster_name: monsterName,
        bot_username: botUsername,
        agent_id: agent.id,
      },
    });

    return new Response(
      JSON.stringify({
        agentId: agent.id,
        apiKey: rawKey,
        botUsername,
        agreementId: agreement.id,
        agreementCreatedAt: agreement.created_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("register-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
