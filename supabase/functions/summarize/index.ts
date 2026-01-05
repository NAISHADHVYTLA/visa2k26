import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const SummarizeRequestSchema = z.object({
  tnc: z.string().min(1).max(10000),
  benefitName: z.string().min(1).max(200),
  language: z.enum(["en", "ta"]).default("en"),
});

// Sanitize text to prevent prompt injection
function sanitizeText(text: string): string {
  // Remove control characters and excessive whitespace
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Parse and validate input
    const rawBody = await req.json();
    const parseResult = SummarizeRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: parseResult.error.issues.map(i => i.message).join(", ")
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { tnc, benefitName, language } = parseResult.data;
    
    // Sanitize inputs
    const sanitizedTnc = sanitizeText(tnc);
    const sanitizedBenefitName = sanitizeText(benefitName);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fallback to extracting first sentence
      const fallbackSummary = sanitizedTnc.split(".")[0] + ".";
      return new Response(
        JSON.stringify({ summary: fallbackSummary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const languageInstruction = language === "ta" 
      ? "Respond in simple, natural Tamil (தமிழ்). Use everyday words."
      : "Respond in simple, clear English.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful financial advisor who simplifies complex terms and conditions into easy-to-understand summaries. 
            
Rules:
- Keep summaries to 1-2 sentences maximum
- Be factual - never make up benefits that aren't mentioned
- Use friendly, conversational tone
- Focus on what the user actually gets
- ${languageInstruction}`
          },
          {
            role: "user",
            content: `Simplify this credit card benefit for a regular user:

Benefit: ${sanitizedBenefitName}

Terms & Conditions:
${sanitizedTnc}

Provide a 1-2 sentence summary that highlights what the cardholder actually gets.`
          }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fallback
      const fallbackSummary = sanitizedTnc.split(".")[0] + ".";
      return new Response(
        JSON.stringify({ summary: fallbackSummary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || sanitizedTnc.split(".")[0] + ".";

    console.log(`Summarized benefit "${sanitizedBenefitName}" in ${language} (user: ${user.id})`);

    return new Response(
      JSON.stringify({ summary: summary.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in summarize function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
