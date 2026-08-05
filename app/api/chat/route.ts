import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getDynamicModel, ModelId } from "./model";

export async function POST(request: Request) {
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

    const freeModelsFallback: ModelId[] = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gpt-4o-mini",
    ];
    const modelsToTry: ModelId[] = Array.from(
      new Set([(modelId as ModelId) || "gemini-2.5-flash", ...freeModelsFallback])
    );

    let response = null;
    let lastError: any = null;

    for (const currentModelId of modelsToTry) {
      try {
        const modelInstance = getDynamicModel(currentModelId);
        response = await modelInstance.invoke([
          new SystemMessage("You are a helpful AI assistant."),
          ...lcMessages,
        ]);
        if (response) {
          console.log(`Successfully generated response using model: ${currentModelId}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${currentModelId} failed (quota/error):`, err?.message);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("All AI model quotas exceeded. Please try again later.");
    }

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
