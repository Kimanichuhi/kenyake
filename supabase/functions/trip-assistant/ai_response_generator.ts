type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL_ID = "google/gemini-2.5-flash";

const buildSystemPrompt = (userName?: string): string => {
  const nameHint = userName && userName.trim().length > 0 ? `The user's name is ${userName}.` : "";

  return `You are SafariSync Assistant, a Kenya travel expert. Be practical, friendly, and concise.
${nameHint}

Rules:
- Use the provided structured data as your primary source of truth.
- If the user asks for items not in the data, say you do not have those specifics and offer related alternatives.
- Respond in the same language as the user's most recent message.
- Use clear headings and short bullet lists when helpful.
- Avoid fabricating prices, phone numbers, or exact schedules.
- Detect the user's language and respond in that language, matching tone and formality.
- Always end with an "Insider Tips" section containing 2-3 short, specific tips and a gentle question that invites a follow-up.`;
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
