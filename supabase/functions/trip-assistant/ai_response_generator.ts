type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_ID = "google/gemini-2.5-flash";

const buildSystemPrompt = (userName?: string): string => {
  const nameHint = userName && userName.trim().length > 0 ? `The user's name is ${userName}.` : "";

  return `You are SafariSync AI, a helpful assistant embedded in the SafariSync tourism platform for Kenya. You help travellers explore destinations, wildlife, cultural experiences, communities, food, transport, safety and marketplace items.
${nameHint}

GROUNDING RULES:
- Prefer the structured SafariSync data provided below when answering. When recommending specific destinations, guides, events, experiences, food spots, routes, or marketplace items, ONLY mention items that appear in the provided data.
- You MAY use general knowledge about Kenya (geography, climate, culture, wildlife, common travel tips, languages, currency, visa basics) to give context and helpful answers, even if the structured data is empty.
- Do NOT invent specific listings, prices, phone numbers, names of guides, or schedules that are not in the data.
- If the user asks for a specific listing type and the data is empty, briefly say SafariSync doesn't have those listings yet, then offer related general guidance or suggest a related category that IS available.

ANSWER BEHAVIOR:
- Answer the user's question directly and helpfully. Be concise and informative.
- Do not pad with unrequested follow-up questions or upsell. A short clarifying question is fine only if the request is genuinely ambiguous.
- Stay focused on Kenyan tourism topics.

TONE & FORMAT:
- Friendly, professional, tourism-guide style.
- Respond in the same language as the user's most recent message.
- Use short bullet lists or compact headings only when they aid clarity.`;
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
