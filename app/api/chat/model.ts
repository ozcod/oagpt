import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

type ModelProvider = "openai" | "google" | "anthropic";
type ModelTier = "free" | "subscription";

export type ModelId =
  | "gemini-2.5-flash"
  | "gpt-4o-mini"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-pro"
  | "gpt-4o"
  | "claude-3-5-sonnet";

type ModelConfig = {
  provider: ModelProvider;
  tier: ModelTier;
  options?: Record<string, unknown>;
};

export const MODEL_REGISTRY: Record<ModelId, ModelConfig> = {
  "gemini-2.5-flash": {
    provider: "google",
    tier: "free",
    options: { temperature: 0 },
  },
  "gpt-4o-mini": {
    provider: "openai",
    tier: "free",
    options: { temperature: 0 },
  },
  "gemini-2.0-flash-lite": {
    provider: "google",
    tier: "free",
    options: { temperature: 0 },
  },
  "gemini-2.5-pro": {
    provider: "google",
    tier: "subscription",
    options: { temperature: 0 },
  },
  "gpt-4o": {
    provider: "openai",
    tier: "subscription",
    options: { temperature: 0 },
  },
  "claude-3-5-sonnet": {
    provider: "anthropic",
    tier: "subscription",
    options: { temperature: 0 },
  },
};

function getDefaultModel() {
  if (process.env.GOOGLE_API_KEY) {
    return new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    maxRetries: 2,
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

function createModel(modelId: ModelId, config: ModelConfig) {
  const base = { model: modelId, ...config.options };

  if (config.provider === "openai") {
    if (process.env.OPENAI_API_KEY) {
      return new ChatOpenAI({
        ...base,
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return getDefaultModel();
  } else if (config.provider === "google") {
    if (process.env.GOOGLE_API_KEY) {
      return new ChatGoogleGenerativeAI({
        ...base,
        apiKey: process.env.GOOGLE_API_KEY,
      });
    }
    return getDefaultModel();
  } else if (config.provider === "anthropic") {
    return getDefaultModel();
  }

  return getDefaultModel();
}

export function getDynamicModel(modelId: ModelId) {
  const config = MODEL_REGISTRY[modelId];
  if (!config) return getDefaultModel();

  return createModel(modelId, config);
}
