import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@/lib/auth/config";
import { logger } from "@/lib/logger";
import { AI_SYSTEM_PROMPT } from "@/components/ai/system-prompt";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messages, context } = await req.json();

    logger.info({ 
      userId: session.user.id, 
      messageCount: messages.length,
      context 
    }, "AI chat request");

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "AI not configured", 
          message: "ANTHROPIC_API_KEY not set. Please add it to your environment variables." 
        }), 
        { status: 503 }
      );
    }

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: AI_SYSTEM_PROMPT,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    logger.error({ error }, "AI chat error");
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
}
