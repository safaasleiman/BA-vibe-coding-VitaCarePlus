import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vaccinationName } = await req.json();

    if (!vaccinationName) {
      return new Response(
        JSON.stringify({ error: "Impfungsname fehlt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching info for vaccination: ${vaccinationName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein Experte für Impfungen in Deutschland und kennst die STIKO-Empfehlungen. 
Antworte immer auf Deutsch und gib präzise, medizinisch korrekte Informationen.
Halte die Antworten kurz und verständlich für Laien.`;

    const userPrompt = `Gib mir Informationen zur Impfung "${vaccinationName}" in Deutschland.
Ich brauche folgende Informationen:
1. Wogegen schützt diese Impfung? (kurze Beschreibung der Krankheit und deren Risiken)
2. Für wen wird die Impfung empfohlen? (Altersgruppen, Risikogruppen)
3. Wie ist das Impfschema? (Anzahl der Dosen, Abstände)
4. Wann sollte eine Auffrischung erfolgen?
5. Wichtige Hinweise oder Nebenwirkungen

Antworte strukturiert und kurz.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "vaccination_info",
              description: "Strukturierte Informationen zu einer Impfung",
              parameters: {
                type: "object",
                properties: {
                  protection: {
                    type: "string",
                    description: "Wogegen schützt die Impfung (Krankheitsbeschreibung)"
                  },
                  recommendedFor: {
                    type: "string",
                    description: "Für wen wird die Impfung empfohlen"
                  },
                  schedule: {
                    type: "string",
                    description: "Impfschema (Anzahl Dosen, Abstände)"
                  },
                  booster: {
                    type: "string",
                    description: "Auffrischungsempfehlung"
                  },
                  notes: {
                    type: "string",
                    description: "Wichtige Hinweise oder typische Nebenwirkungen"
                  }
                },
                required: ["protection", "recommendedFor", "schedule", "booster", "notes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "vaccination_info" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Nutzungslimit erreicht. Bitte Credits aufladen." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const vaccinationInfo = JSON.parse(toolCall.function.arguments);
      console.log("Parsed vaccination info:", vaccinationInfo);
      
      return new Response(
        JSON.stringify({ success: true, info: vaccinationInfo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if no tool call
    const content = data.choices?.[0]?.message?.content;
    return new Response(
      JSON.stringify({ success: true, rawContent: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in vaccination-info function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
