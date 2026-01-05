import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const BenefitSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200),
  category: z.string().max(100),
  tnc: z.string().max(5000),
});

const RecommendRequestSchema = z.object({
  lifestyle: z.enum(["student", "professional", "traveler", "family"]),
  location: z.string().max(100).optional(),
  benefits: z.array(BenefitSchema).min(1).max(50),
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
    const parseResult = RecommendRequestSchema.safeParse(rawBody);
    
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

    const { lifestyle, location, benefits, language } = parseResult.data;
    
    // Sanitize location if provided
    const sanitizedLocation = location ? sanitizeText(location) : undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fallback: return first 3 benefits
      const fallbackRecs = benefits.slice(0, 3).map((b, i) => ({
        benefitId: b.id,
        rank: i + 1,
        reason: `This ${sanitizeText(b.category).toLowerCase()} benefit could be useful for your ${lifestyle} lifestyle.`
      }));
      return new Response(
        JSON.stringify({ recommendations: fallbackRecs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lifestyleContext: Record<string, string> = {
      student: "budget-conscious, values discounts and shopping benefits, may travel for studies",
      professional: "busy schedule, values convenience, travel frequently for work, appreciates concierge services",
      traveler: "travels often for leisure, values airport lounges, travel insurance, and hotel benefits",
      family: "values protection benefits, shopping discounts, family experiences, and security features"
    };

    const languageInstruction = language === "ta" 
      ? "Provide reasons in simple, natural Tamil (தமிழ்)."
      : "Provide reasons in simple, clear English.";

    // Sanitize benefit data before including in prompt
    const benefitsList = benefits.map((b, i) => {
      const sanitizedName = sanitizeText(b.name);
      const sanitizedCategory = sanitizeText(b.category);
      const sanitizedTnc = sanitizeText(b.tnc).substring(0, 150);
      return `${i + 1}. ID: ${b.id}\n   Name: ${sanitizedName}\n   Category: ${sanitizedCategory}\n   Summary: ${sanitizedTnc}...`;
    }).join("\n\n");

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
            content: `You are a personal financial advisor helping credit card users discover their most valuable benefits based on their lifestyle.

Rules:
- Select exactly 3 benefits that best match the user's lifestyle
- Rank them 1-3 (1 being most relevant)
- Provide a brief, personalized reason for each (1-2 sentences)
- Be factual - only mention benefits that actually exist
- ${languageInstruction}

Output format (JSON):
{
  "recommendations": [
    { "benefitId": "id", "rank": 1, "reason": "..." },
    { "benefitId": "id", "rank": 2, "reason": "..." },
    { "benefitId": "id", "rank": 3, "reason": "..." }
  ]
}`
          },
          {
            role: "user",
            content: `User Profile:
- Lifestyle: ${lifestyle} (${lifestyleContext[lifestyle]})
${sanitizedLocation ? `- Location: ${sanitizedLocation}` : ""}

Available Benefits:
${benefitsList}

Select the top 3 most relevant benefits for this user and explain why each matters to them.`
          }
        ],
        max_tokens: 500,
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
      const fallbackRecs = benefits.slice(0, 3).map((b, i) => ({
        benefitId: b.id,
        rank: i + 1,
        reason: `This ${sanitizeText(b.category).toLowerCase()} benefit is great for your ${lifestyle} lifestyle.`
      }));
      return new Response(
        JSON.stringify({ recommendations: fallbackRecs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Parse JSON from response
    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback
      recommendations = benefits.slice(0, 3).map((b, i) => ({
        benefitId: b.id,
        rank: i + 1,
        reason: `This ${sanitizeText(b.category).toLowerCase()} benefit matches your ${lifestyle} lifestyle perfectly.`
      }));
    }

    // Validate and ensure we have proper benefit IDs
    const validBenefitIds = new Set(benefits.map(b => b.id));
    const validatedRecs = recommendations
      .filter((rec: any) => validBenefitIds.has(rec.benefitId))
      .slice(0, 3);

    // If we don't have enough valid recs, add fallbacks
    if (validatedRecs.length < 3) {
      const usedIds = new Set(validatedRecs.map((r: any) => r.benefitId));
      const remaining = benefits.filter(b => !usedIds.has(b.id));
      while (validatedRecs.length < 3 && remaining.length > 0) {
        const b = remaining.shift()!;
        validatedRecs.push({
          benefitId: b.id,
          rank: validatedRecs.length + 1,
          reason: `This ${sanitizeText(b.category).toLowerCase()} benefit suits your ${lifestyle} needs.`
        });
      }
    }

    console.log(`Generated ${validatedRecs.length} recommendations for ${lifestyle} lifestyle (user: ${user.id})`);

    return new Response(
      JSON.stringify({ recommendations: validatedRecs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in recommend function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
