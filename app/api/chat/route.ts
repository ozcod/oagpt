import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getDynamicModel, ModelId } from "./model";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: Max 10 requests per minute per IP for cost-intensive AI Chat
  const rateLimitError = checkRateLimit(request, "chat-api", {
    limit: 10,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const { messages, model: modelId } = body;

    const selectedModel = getDynamicModel(
      (modelId as ModelId) || "gemini-2.5-flash"
    );

    // Convert input messages to LangChain messages
    const lcMessages = (messages || []).map(
      (m: { role: string; content: string }) => {
        if (m.role === "user") {
          return new HumanMessage(m.content);
        }
        return new AIMessage(m.content);
      }
    );

    const response = await selectedModel.invoke([
      new SystemMessage("You are a helpful AI assistant."),
      ...lcMessages,
    ]);

    const responseText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return Response.json({
      role: "assistant",
      content: responseText,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error?.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
