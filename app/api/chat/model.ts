import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

type ModelProvider = "openai" | "google" | "anthropic";
type ModelTier = "free" | "subscription";

export type ModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-lite"
  | "gpt-4o-mini"
  | "gpt-4o"
  | "claude-3-5-sonnet"
  | "deepseek-r1-free"
  | "llama-3-3-70b-free";

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
    tier: "subscription",
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
  "deepseek-r1-free": {
    provider: "openai",
    tier: "free",
    options: { temperature: 0 },
  },
  "llama-3-3-70b-free": {
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

  if (modelId === "deepseek-r1-free") {
    if (process.env.OPENROUTER_API_KEY) {
      return new ChatOpenAI({
        model: "deepseek/deepseek-r1",
        temperature: 0,
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });
    }
    return getDefaultModel();
  }

  if (modelId === "llama-3-3-70b-free") {
    if (process.env.OPENROUTER_API_KEY) {
      return new ChatOpenAI({
        model: "meta-llama/llama-3.3-70b-instruct",
        temperature: 0,
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });
    }
    return getDefaultModel();
  }

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
