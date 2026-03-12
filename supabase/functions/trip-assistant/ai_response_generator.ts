import type { StructuredResult } from "./database_service.ts";

const systemPrompt = `You are SafariSync Assistant, an AI Tourism Information Assistant for a Kenyan tourism discovery platform.\n\nFollow this flow:\n1) Understand intent\n2) Extract parameters (budget, location, interests, time)\n3) Use ONLY the provided internal data\n4) Respond warmly and briefly unless asked for more detail\n\nGreeting requirement:\n- If a user name is provided, start with: \"Hello [Name]!\" and a short encouraging statement about visiting Kenya.\n- If no name is provided, start with: \"Hello!\" and the same encouragement.\n\nResponse style:\n- Friendly, welcoming, simple explanations for international visitors\n- Avoid local jargon; explain places briefly\n- 2â€“4 short paragraphs OR 3â€“5 bullet points\n\nIf data is empty:\n- Say you couldn't find exact matches and suggest related categories\n\nResponse format:\n1) Greeting + encouragement\n2) Direct answer\n3) Recommended experiences (bullets or numbered)\n`;

export const generateAIResponse = async (
  apiKey: string,
  userQuestion: string,
  structuredData: StructuredResult,
  userName?: string,
) => {
  const prompt = `User Name: ${userName ?? "unknown"}\n\nUser Question:\n${userQuestion}\n\nAvailable Data:\n${JSON.stringify(structuredData)}\n\nInstruction:\nGenerate a helpful tourism answer using the provided data.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      stream: true,
    }),
  });

  return response;
};

