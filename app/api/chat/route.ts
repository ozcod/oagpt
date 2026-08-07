import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getDynamicModel, ModelId } from "./model";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chatThread, chatMessage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  // Rate limit: Max 10 requests per minute per IP for cost-intensive AI Chat
  const rateLimitError = checkRateLimit(request, "chat-api", {
    limit: 10,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const { messages, model: modelId, threadId } = body;

    const session = await auth.api.getSession({ headers: request.headers });

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

    // Persist to DB if user is authenticated
    let activeThreadId = threadId;
    if (session?.user?.id) {
      const userMessage = messages[messages.length - 1];
      const title = userMessage?.content?.slice(0, 40) || "New Chat";

      if (!activeThreadId) {
        activeThreadId = uuidv4();
        await db.insert(chatThread).values({
          id: activeThreadId,
          title,
          userId: session.user.id,
        });
      } else {
        await db
          .update(chatThread)
          .set({ updatedAt: new Date() })
          .where(eq(chatThread.id, activeThreadId));
      }

      // Save user message if provided
      if (userMessage) {
        await db.insert(chatMessage).values({
          id: uuidv4(),
          threadId: activeThreadId,
          role: "user",
          content: userMessage.content,
          model: modelId,
        });
      }

      // Save assistant response
      await db.insert(chatMessage).values({
        id: uuidv4(),
        threadId: activeThreadId,
        role: "assistant",
        content: responseText,
        model: modelId,
      });
    }

    return Response.json({
      role: "assistant",
      content: responseText,
      threadId: activeThreadId,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error?.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

