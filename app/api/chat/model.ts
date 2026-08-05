import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

type ModelProvider = "openai" | "google" | "anthropic";
type ModelTier = "free" | "subscription";

export type ModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-lite"
  | "gpt-4o-mini"
  | "gpt-3.5-turbo";

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
  "gemini-2.5-pro": {
    provider: "google",
    tier: "free",
    options: { temperature: 0 },
  },
  "gemini-2.0-flash-lite": {
    provider: "google",
    tier: "free",
    options: { temperature: 0 },
  },
  "gpt-4o-mini": {
    provider: "openai",
    tier: "free",
    options: { temperature: 0 },
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    tier: "free",
    options: { temperature: 0 },
  },
};

function getDefaultModel() {
  return new ChatOpenAI({
    model: "gemini-2.5-flash",
    maxTokens: undefined,
    timeout: undefined,
    maxRetries: 2,
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function createModel(modelId: ModelId, config: ModelConfig) {
  const base = { model: modelId, ...config.options };

  if (config.provider === "openai") {
    return new ChatOpenAI({
      ...base,
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else if (config.provider === "google") {
    return new ChatGoogleGenerativeAI({
      ...base,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  } else if (config.provider === "anthropic") {
    // todo: create anthropic chat instance
    return getDefaultModel();
  }

  return getDefaultModel();
}

export function getDynamicModel(modelId: ModelId) {
  const config = MODEL_REGISTRY[modelId];
  if (!config) return getDefaultModel();

  return createModel(modelId, config);
}
