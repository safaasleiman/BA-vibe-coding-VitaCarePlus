import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Kein Bild übermittelt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysiere Impfpass-Foto...');

    const systemPrompt = `Du bist ein Experte für die Analyse von deutschen Impfpässen und Impfdokumenten. 
Analysiere das Bild sorgfältig und extrahiere alle erkennbaren Impfungen.

Für jede Impfung extrahiere folgende Informationen (soweit erkennbar):
- vaccine_name: Der vollständige Name des Impfstoffs (z.B. "Infanrix hexa", "Priorix")
- vaccine_type: Die Art der Impfung (z.B. "Tetanus", "Masern-Mumps-Röteln", "COVID-19", "FSME", "Hepatitis B")
- vaccination_date: Das Impfdatum im Format YYYY-MM-DD
- batch_number: Die Chargennummer (falls lesbar)
- doctor_name: Name des impfenden Arztes oder der Praxis (falls lesbar)

Gib nur Impfungen zurück, die du klar erkennen kannst. Bei unsicheren Daten lieber weglassen.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analysiere diesen Impfpass und extrahiere alle Impfungen.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_vaccinations',
              description: 'Extrahiere alle Impfungen aus dem Impfpass-Bild',
              parameters: {
                type: 'object',
                properties: {
                  vaccinations: {
                    type: 'array',
                    description: 'Liste aller erkannten Impfungen',
                    items: {
                      type: 'object',
                      properties: {
                        vaccine_name: { 
                          type: 'string',
                          description: 'Name des Impfstoffs'
                        },
                        vaccine_type: { 
                          type: 'string',
                          description: 'Art der Impfung (z.B. Tetanus, COVID-19)'
                        },
                        vaccination_date: { 
                          type: 'string',
                          description: 'Impfdatum im Format YYYY-MM-DD'
                        },
                        batch_number: { 
                          type: 'string',
                          description: 'Chargennummer (optional)'
                        },
                        doctor_name: { 
                          type: 'string',
                          description: 'Name des Arztes (optional)'
                        }
                      },
                      required: ['vaccine_name', 'vaccine_type', 'vaccination_date']
                    }
                  },
                  notes: {
                    type: 'string',
                    description: 'Zusätzliche Hinweise zur Bildqualität oder unklaren Einträgen'
                  }
                },
                required: ['vaccinations']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_vaccinations' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI-Kontingent erschöpft. Bitte laden Sie Ihr Guthaben auf.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI-Anfrage fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.log('Keine Impfungen erkannt oder unerwartetes Format');
      return new Response(
        JSON.stringify({ 
          vaccinations: [],
          notes: 'Keine Impfungen erkannt. Bitte stellen Sie sicher, dass das Bild gut lesbar ist.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Erkannte Impfungen:', result.vaccinations?.length || 0);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-vaccination-record:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
