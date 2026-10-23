import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  prompt: string;
  imageData?: string;
  mode: "troubleshoot" | "tutorial";
  history?: { role: string; content: string }[];
  sessionId?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  troubleshoot: `You are an expert IT support specialist. The user is sharing their screen and asking for help troubleshooting an issue. Analyze what you see on screen and provide clear, step-by-step guidance to resolve their problem. Be specific about what buttons to click, menus to navigate, or settings to change. If you can see an error message, address it directly. Keep responses concise but complete.`,
  tutorial: `You are a patient, expert software instructor. The user is sharing their screen and wants to learn how to do something. Provide a clear, numbered tutorial based on what you see on their screen right now. Walk them through each step. If you can see what application they're in, tailor your instructions to that exact interface. Be encouraging and specific.`,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      prompt,
      imageData,
      mode = "troubleshoot",
      history = [],
      sessionId,
    } = (await req.json()) as AnalyzeRequest;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "No OPENAI_API_KEY secret is configured. Add it as an edge function secret to enable screen analysis.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.troubleshoot;

    const messages: {
      role: string;
      content: string | object[];
    }[] = [{ role: "system", content: systemPrompt }];

    for (const h of history.slice(-8)) {
      messages.push({ role: h.role, content: h.content });
    }

    const userContent: object[] = [{ type: "text", text: prompt }];
    if (imageData) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageData.startsWith("data:")
            ? imageData
            : `data:image/jpeg;base64,${imageData}`,
          detail: "high",
        },
      });
    }
    messages.push({ role: "user", content: userContent });

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          max_tokens: 1200,
          temperature: 0.4,
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(
        JSON.stringify({
          error: `The AI service returned an error (${openaiResponse.status}). ${errText.slice(0, 300)}`,
        }),
        {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openaiData = await openaiResponse.json();
    const answer =
      openaiData?.choices?.[0]?.message?.content ??
      "I was unable to generate a response. Please try again.";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (sessionId && supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from("messages").insert([
        { session_id: sessionId, role: "assistant", content: answer },
      ]);
    }

    return new Response(
      JSON.stringify({ response: answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
