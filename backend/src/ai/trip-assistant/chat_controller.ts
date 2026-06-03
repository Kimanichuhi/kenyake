import { classifyIntent } from "./intent_classifier.ts";
import { createSupabase } from "./database_service.ts";
import { routeQuery } from "./query_router.ts";
import { generateAIResponse } from "./ai_response_generator.ts";
import { getCached, getCacheKey, setCached } from "./cache_service.ts";

/* =====================================================
   GREETING DETECTION
===================================================== */

const isGreetingOnly = (text: string): boolean => {
  const cleaned = text.trim().toLowerCase();

  return /^(hi|hey|hello|yo|howdy)\b/.test(cleaned);
};


/* =====================================================
   STREAM RESPONSE HELPER
===================================================== */

const streamText = (text: string): Response => {
  const encoder = new TextEncoder();

  const payload = `data: ${JSON.stringify({
    choices: [{ delta: { content: text } }],
  })}\n\n`;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};


/* =====================================================
   MAIN CHAT CONTROLLER
===================================================== */

export const handleUserPrompt = async (
  prompt: string,
  apiKey: string,
  clientId: string,
  userName?: string,
  conversationHistory: any[] = []
): Promise<Response> => {

  try {

    /* =============================
       GREETING RESPONSE
    ============================== */

    if (isGreetingOnly(prompt)) {
      const name =
        userName && userName.trim().length > 0
          ? userName.split(" ")[0]
          : "there";

      const greeting = `Hey ${name}! 👋

Welcome to Kenya 🇰🇪 — one of Africa's most beautiful tourism destinations.

You can explore:

• Wildlife Safaris 🦁
• Cultural Experiences 🪘
• Beaches & Coastlines 🌊
• National Parks 🌿
• Local Food & Cuisine 🍲

What would you like to discover today? 😊`;

      return streamText(greeting);
    }

    /* =============================
       INTENT CLASSIFICATION
    ============================== */

    const intent = classifyIntent(prompt);

    /* =============================
       CACHE KEY GENERATION
    ============================== */

    const key = getCacheKey(intent, prompt);

    const supabase = createSupabase();

    /* =============================
       CACHE LOOKUP
    ============================== */

    const cached = await getCached(supabase, key);

    if (cached) {
      console.log("Cache hit:", key);

      return generateAIResponse(
        apiKey,
        prompt,
        cached,
        userName,
        conversationHistory
      );
    }

    console.log("Cache miss:", key);

    /* =============================
       DATABASE QUERY ROUTING
    ============================== */

    const structuredData = await routeQuery(supabase, intent);

    const hasResults =
      structuredData &&
      Array.isArray((structuredData as any).results) &&
      (structuredData as any).results.length > 0;

    if (!hasResults) {
      console.warn("No tourism data found for intent:", intent);
      // Fall through with empty results so the AI can still respond using
      // general knowledge about Kenyan tourism, while being transparent that
      // SafariSync has no specific listings for this query yet.
    }

    /* =============================
       STORE IN CACHE
    ============================== */

    await setCached(supabase, key, structuredData);

    /* =============================
       GENERATE AI RESPONSE
    ============================== */

    return generateAIResponse(
      apiKey,
      prompt,
      structuredData,
      userName,
      conversationHistory
    );

  } catch (error) {

    console.error("Chat controller error:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong while processing the request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
