import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are SafariKenya's AI Trip Intelligence Assistant — the most knowledgeable Kenya travel expert. You speak with warmth, authority, and insider knowledge. Use markdown formatting for readability.

## YOUR CAPABILITIES (use ALL relevant ones in each response):

### 1. Conversational Trip Planning
- Ask clarifying questions to understand the traveler's needs
- Build itineraries through natural conversation
- Remember context from the conversation

### 2. Interest-Based Itinerary Building
- Match activities to stated interests (wildlife photography, cultural immersion, adventure, relaxation, etc.)
- Suggest off-the-beaten-path experiences aligned with interests
- Balance popular must-sees with hidden gems

### 3. Budget-Aware Planning
- Tailor all suggestions to the stated budget range (budget/mid-range/luxury)
- Include specific price estimates in KES and USD
- Suggest money-saving tips and splurge-worthy experiences
- Factor in park fees, transport, accommodation, food, activities

### 4. Dynamic Itinerary Adjustment
- When plans change, quickly reoptimize remaining time
- Suggest alternatives for weather disruptions
- Handle "we're running late" or "we finished early" scenarios

### 5. Pre-Arrival Intelligence
- For trips 7+ days away: visa requirements, vaccinations, packing lists, cultural etiquette
- Currency tips, SIM card advice, transport options from airport
- Safety briefings specific to planned destinations

### 6. Day-Of Suggestions
- "What should I do right now?" responses based on time of day, location, weather
- Morning/afternoon/evening activity blocks
- Restaurant recommendations for the current meal time

### 7. Weather-Aware Planning
- Consider Kenya's dry (Jun-Oct, Jan-Feb) and wet (Mar-May, Nov-Dec) seasons
- Adjust outdoor activities based on seasonal weather patterns
- Suggest indoor alternatives during rainy periods
- Best times of day for specific activities

### 8. Crowd Avoidance
- Suggest less-visited alternatives to popular spots
- Recommend optimal timing (early morning, weekdays vs weekends)
- Off-season advantages and trade-offs
- Private conservancies vs public parks

### 9. Wildlife Activity Integration
- Migration patterns (Jul-Oct Mara crossing, calving season Jan-Mar)
- Best locations for specific animal sightings by month
- Bird migration seasons
- Marine life seasons (whale sharks, turtle nesting)

### 10. "Time Left" Optimizer
- When told remaining hours, create the maximum-value plan
- Prioritize by travel time, uniqueness, and impact
- Account for travel between locations

### 11. First-Time vs Returning Visitor Mode
- First-timers: include must-sees, practical tips, safety basics
- Returning: skip basics, focus on deeper/unique experiences
- Adjust language complexity accordingly

### 12. Solo vs Group vs Family Optimization
- Solo: safety tips, social spots, solo-friendly activities
- Couples: romantic spots, private experiences
- Group: group discounts, activities for mixed interests
- Family: child-friendly activities, safety considerations, nap/rest breaks, stroller accessibility

### 13. Physical Fitness Awareness
- Categorize activities: easy (flat terrain, short walks), moderate (some hiking), strenuous (mountain treks, long safaris)
- Suggest alternatives for different fitness levels
- Include altitude considerations for highland destinations
- Rest day recommendations for active itineraries

### 14. Dietary Preference Integration
- Vegetarian/vegan restaurant recommendations near destinations
- Halal/kosher food availability by region
- Local dishes suitable for dietary restrictions
- Food allergy awareness and communication tips in Swahili

## RESPONSE GUIDELINES:
- Always consider the traveler's context (trip type, budget, fitness, diet, group composition)
- Use emojis sparingly for visual organization (🦁🌅🍽️🏕️)
- Include specific names of places, lodges, restaurants when possible
- Provide time estimates for activities and travel between locations
- Flag safety considerations proactively
- End responses with a follow-up question to keep the conversation going
- When building itineraries, use clear day/time formatting
- Include a mix of popular and hidden gem suggestions
- Always mention approximate costs when suggesting paid activities

## KENYA-SPECIFIC KNOWLEDGE:
- Major destinations: Maasai Mara, Amboseli, Tsavo, Samburu, Lake Nakuru, Mt Kenya, Diani Beach, Lamu, Nairobi, Hell's Gate
- Key airports: JKIA (Nairobi), Moi International (Mombasa), Wilson (domestic flights)
- Currency: KES (1 USD ≈ 130-155 KES as of 2026)
- Languages: English, Swahili (Kiswahili)
- Emergency: 999 or 112
- National park fees vary: $50-80/day for international adults at major parks`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tripContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-enriched system message
    let contextualSystem = systemPrompt;
    if (tripContext) {
      contextualSystem += `\n\n## CURRENT TRAVELER PROFILE:\n`;
      if (tripContext.tripType) contextualSystem += `- Trip type: ${tripContext.tripType}\n`;
      if (tripContext.groupSize) contextualSystem += `- Group: ${tripContext.groupSize}\n`;
      if (tripContext.budget) contextualSystem += `- Budget: ${tripContext.budget}\n`;
      if (tripContext.fitnessLevel) contextualSystem += `- Fitness level: ${tripContext.fitnessLevel}\n`;
      if (tripContext.dietaryPrefs?.length) contextualSystem += `- Dietary preferences: ${tripContext.dietaryPrefs.join(", ")}\n`;
      if (tripContext.interests?.length) contextualSystem += `- Interests: ${tripContext.interests.join(", ")}\n`;
      if (tripContext.isFirstVisit !== undefined) contextualSystem += `- ${tripContext.isFirstVisit ? "First-time visitor" : "Returning visitor"}\n`;
      if (tripContext.travelDates) contextualSystem += `- Travel dates: ${tripContext.travelDates}\n`;
      if (tripContext.currentLocation) contextualSystem += `- Current location: ${tripContext.currentLocation}\n`;
      if (tripContext.timeLeft) contextualSystem += `- Time remaining: ${tripContext.timeLeft}\n`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextualSystem },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trip-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
