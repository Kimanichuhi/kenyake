type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_ID = "google/gemini-2.5-flash";

const buildSystemPrompt = (userName?: string): string => {
  const nameHint = userName && userName.trim().length > 0 ? `The user's name is ${userName}.` : "";

  return `You are SafariSync AI, an assistant embedded inside the SafariSync tourism platform focused on local communities, hidden gems, cultural experiences, travel routes, and destinations featured ONLY on this platform.
${nameHint}

STRICT GROUNDING RULES (CRITICAL — never violate):
- You must ONLY answer using information available in the structured data provided below (the website's knowledge base).
- If the requested information is NOT in the provided data, respond exactly: "I don't have information about that in SafariSync's listings."
- Do NOT use external/general travel knowledge, world facts, or assumptions.
- Do NOT recommend places, guides, events, or experiences that are not present in the provided data.
- Do NOT hallucinate prices, phone numbers, schedules, or details. If unsure, say you don't have that information.

ANSWER BEHAVIOR:
- Answer ONLY what the user asked. Do not add unrequested suggestions, recommendations, or follow-up questions.
- Keep responses short, precise, and informative. Avoid storytelling unless the user explicitly requests it.
- Do NOT introduce new destinations, cultures, or travel ideas not present in the platform content.
- Do NOT shift topics. Stay strictly within SafariSync listings.
- If the user's request is unclear, respond exactly: "Could you clarify your request so I can assist you better within SafariSync's listings?"

TONE & FORMAT:
- Friendly, professional, tourism guide style.
- Respond in the same language as the user's most recent message.
- Use short bullet lists or compact headings only when they aid clarity. No filler, no "Insider Tips" section, no closing questions unless the user asked for them.`;
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
