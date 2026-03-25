import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_SYSTEM_PROMPT = `You are Handshake, the agreement-drafting intelligence inside Handshake Monster.

Your job is to turn messy human language into clear, structured, reviewable agreements.

Rules:
- do not invent missing terms
- do not treat vague discussion as signed agreement
- identify ambiguity clearly
- be concise
- return both natural-language reply and structured agreement JSON

Classify every input as one of:
- needs_clarification
- draft_ready
- sign_ready

Only classify as "sign_ready" when ALL of these are true:
- parties are identified (at least 2)
- deliverables/commitments are clear
- payment terms are clear (if relevant)
- deadline/timing is clear (if relevant)
- terms is non-empty
- there are no essential missing fields

Do not mark an agreement sign_ready unless it is concrete enough for real review.

Always return valid JSON only with:
- reply
- status
- agreement
- actions

Do not output markdown.
Do not output explanation outside JSON.

The JSON shape must be:
{
  "reply": "string",
  "status": "needs_clarification | draft_ready | sign_ready",
  "agreement": {
    "id": null,
    "title": "string",
    "summary": "string",
    "parties": [{ "name": "string", "role": "string or null" }],
    "terms": ["string"],
    "missingFields": ["string"],
    "signReady": false,
    "allocations": [{ "party": "string", "percentage": number, "label": "string" }],
    "fullText": "string"
  },
  "actions": {
    "openAgreementUrl": null
  }
}

When status is "sign_ready":
- signReady must be true
- missingFields must be empty
- fullText must contain the complete formal agreement text with these sections:
  HANDSHAKE AGREEMENT v1.0
  PARTIES (numbered list with roles)
  ROLES & COMMITMENTS
  TERMS (all agreed terms as bullet points)
  OWNERSHIP MODEL (if allocations exist)
  PROOF MODEL: "This agreement is intended to be signed on-chain via TON wallet."
  AMENDMENT RULE
- allocations should reflect any ownership/revenue split mentioned, or empty array if none
- parties must have at least 2 entries with name and role

When status is "draft_ready":
- Include a brief fullText draft
- missingFields lists what is still needed

When status is "needs_clarification":
- agreement can be null or partial
- fullText can be empty`;

async function getSystemPrompt(supabase: any): Promise<string> {
  try {
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "handshake_system_prompt")
      .single();
    if (data?.value) return data.value;
  } catch {
    // fall through to default
  }
  return DEFAULT_SYSTEM_PROMPT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userId, message, history } = await req.json();

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "sessionId and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store user message
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId || null,
      role: "user",
      content: message,
    });

    // Build conversation context
    const systemPrompt = await getSystemPrompt(supabase);
    const conversationMessages = [
      { role: "system", content: systemPrompt },
    ];

    // Add history if provided
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        conversationMessages.push({
          role: msg.role === "agent" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    // Add current message
    conversationMessages.push({ role: "user", content: message });

    // Call Lovable AI
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: conversationMessages,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON response from Handshake AI
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: treat as plain text reply
      parsed = {
        reply: rawContent,
        status: "needs_clarification",
        agreement: null,
        actions: { openAgreementUrl: null },
      };
    }

    // Validate structure
    const reply = parsed.reply || rawContent;
    const status = ["needs_clarification", "draft_ready", "sign_ready"].includes(
      parsed.status
    )
      ? parsed.status
      : "needs_clarification";
    const agreement = parsed.agreement || null;
    const actions = parsed.actions || { openAgreementUrl: null };

    // Store agreement draft if present
    let agreementId = null;
    if (agreement) {
      const { data: draftData, error: draftError } = await supabase
        .from("agreement_drafts")
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          title: agreement.title || "Untitled",
          summary: agreement.summary || "",
          parties: agreement.parties || [],
          terms: agreement.terms || [],
          missing_fields: agreement.missingFields || [],
          status,
          full_response: parsed,
          full_text: agreement.fullText || "",
          allocations: agreement.allocations || [],
        })
        .select("id")
        .single();

      if (!draftError && draftData) {
        agreementId = draftData.id;
        // Generate agreement URL if sign_ready
        if (status === "sign_ready") {
          actions.openAgreementUrl = `/sign/${agreementId}`;
        }
      }
    }

    // Store agent reply
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId || null,
      role: "agent",
      content: reply,
      handshake_status: status,
      agreement_id: agreementId,
      raw_response: parsed,
    });

    // Return structured response
    const responsePayload = {
      reply,
      status,
      agreement: agreement
        ? {
            id: agreementId,
            title: agreement.title,
            summary: agreement.summary,
            parties: agreement.parties,
            terms: agreement.terms,
            missingFields: agreement.missingFields,
            signReady: status === "sign_ready",
          }
        : null,
      actions,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
