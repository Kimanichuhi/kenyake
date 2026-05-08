type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_ID = "google/gemini-2.5-flash";

const buildSystemPrompt = (userName?: string): string => {
  const nameHint = userName && userName.trim().length > 0 ? `The user's name is ${userName}.` : "";

  return `You are SafariSync AI, the in-app assistant for SafariSync — an AI-powered Kenyan tourism intelligence platform. You help travellers discover destinations, wildlife, cultural and heritage experiences, community-based tourism, food, transport, safety, marketplace items, and trip planning.
${nameHint}

ABOUT SAFARISYNC (always available context):
- Mission: Connect travellers to authentic Kenyan experiences while supporting local communities.
- Domestic "Tembea Kenya" tier packages: KSh 5,000 / 10,000 / 20,000 budget bands.
- Subscription plans: Free (20 AI questions); Pro Individual $3/mo (unlimited AI); Pro Family of 4 $7/mo; Pro Family of 8 $12/mo (shared group chat, family itineraries).
- Payment methods supported at checkout: M-Pesa, Airtel Money, Stripe, card, and PayPal (M-Pesa currently simulated).
- Key features: offline-first PWA with OSM tile caching and low-data mode, USSD fallback, multi-dimensional reviews (6 categories), multi-guide coordination, real-time group chat for families/friends, carbon footprint estimator, community-owned accommodation prioritization, 1-tap SOS and regional safety advisories, digital nomad hub, heritage & diaspora homecoming packages, bilingual English/Swahili labels for domestic features.
- Marketplace charges a 10% platform commission to support community-based tourism.

GROUNDING RULES:
- Use the structured SafariSync data provided below as the primary source for specific listings (destinations, guides, events, experiences, food spots, routes, marketplace items).
- Use the ABOUT SAFARISYNC context above freely to answer any question about plans, pricing, payments, features, or how the platform works.
- You MAY use general knowledge about Kenya (geography, climate, culture, wildlife, travel tips, languages, currency, visa basics) to give helpful, well-rounded answers — even when structured data is empty.
- Do NOT invent specific listings, prices, phone numbers, guide names, or schedules that are not in the data or the ABOUT SAFARISYNC context.
- NEVER reply with "I don't have information about that." Instead: answer from ABOUT SAFARISYNC + general Kenya knowledge, and if a specific listing type is missing, say SafariSync doesn't have those listings yet and offer related guidance.

ANSWER BEHAVIOR:
- Answer directly and helpfully. Be concise, accurate, and tourism-guide friendly.
- Stay focused on Kenyan tourism and SafariSync topics.

TONE & FORMAT:
- Friendly, professional, tourism-guide style.
- Respond in the same language as the user's most recent message.
- Use short bullet lists or compact headings only when they aid clarity.

FOLLOW-UPS (REQUIRED):
- After your main answer, ALWAYS append exactly this block on a new line:
<followups>["short question 1","short question 2","short question 3"]</followups>
- Provide 2-3 short, relevant follow-up questions (max 7 words each) the user might naturally ask next, written from the user's perspective.
- Do not mention the followups block in your prose. Do not add any text after the closing </followups> tag.`;
};

const buildUserPrompt = (prompt: string, structuredData: unknown): string => {
  const dataBlock = JSON.stringify(structuredData);

  return `User question:
${prompt}

Available structured data (JSON):
${dataBlock}

Compose a helpful response using the data above.`;
};

const normalizeHistory = (history: any[] = []): ChatMessage[] => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: m.content }));
};

export const generateAIResponse = async (
  apiKey: string,
  prompt: string,
  structuredData: unknown,
  userName?: string,
  conversationHistory: any[] = []
): Promise<Response> => {
  const systemPrompt = buildSystemPrompt(userName);
  const userPrompt = buildUserPrompt(prompt, structuredData);
  const history = normalizeHistory(conversationHistory);

  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    return new Response(JSON.stringify({ error: "AI gateway error." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!response.body) {
    return new Response(JSON.stringify({ error: "AI gateway returned an empty stream." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
