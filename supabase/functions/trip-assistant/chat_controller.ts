import { classifyIntent } from "./intent_classifier.ts";
import { createSupabase } from "./database_service.ts";
import { routeQuery } from "./query_router.ts";
import { generateAIResponse } from "./ai_response_generator.ts";
import { getCached, getCacheKey, setCached } from "./cache_service.ts";
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 6;
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const throttle = (key: string) => {
  const now = Date.now();
  const entry = rateLimiter.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
};

const isGreetingOnly = (text: string) => {
  const cleaned = text.trim().toLowerCase();
  return /^(hi|hey|hello|hello there|hey there|hi there|yo|howdy)[!. ]*$/.test(cleaned);
};

const streamText = (text: string) => {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\\n\\n`;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.enqueue(encoder.encode("data: [DONE]\\n\\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
};

export const handleUserPrompt = async (
  prompt: string,
  apiKey: string,
  clientId: string,
  userName?: string,
) => {
  if (!throttle(clientId)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isGreetingOnly(prompt)) {
    const name = userName && userName.trim().length > 0 ? userName.split(" ")[0] : "there";
    const greeting = `Hey ${name}! 👋\n\nI am happy to see you again. Welcome to Africa's number one tourism attraction, Kenya.\n\nWhat would you like to explore or visit about? 😊`;
    return streamText(greeting);
  }

  const intent = classifyIntent(prompt);
  const key = getCacheKey(intent, prompt);
  const supabase = createSupabase();
  const cached = await getCached(supabase, key);
  if (cached) return generateAIResponse(apiKey, prompt, cached, userName);

  const structuredData = await routeQuery(supabase, intent);

  await setCached(supabase, key, structuredData);
  return generateAIResponse(apiKey, prompt, structuredData, userName);
};
