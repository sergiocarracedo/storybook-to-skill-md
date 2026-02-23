import type { ProviderType } from '../types.js';
import type { LanguageModelV1 } from 'ai';

/**
 * Create a language model instance based on provider and model name
 *
 * Note: API keys should be set via environment variables:
 * - OPENAI_API_KEY for OpenAI
 * - ANTHROPIC_API_KEY for Anthropic
 * - GOOGLE_GENERATIVE_AI_API_KEY for Google
 *
 * If an apiKey is passed, it will be set in the environment for this process.
 */
export async function createModel(
  provider: ProviderType,
  modelName: string,
  apiKey?: string,
): Promise<LanguageModelV1> {
  // Set API key in environment if provided (AI SDK v4 reads from env)
  if (apiKey) {
    setApiKeyInEnv(provider, apiKey);
  }

  switch (provider) {
    case 'openai': {
      const { openai } = await import('@ai-sdk/openai');
      return openai(modelName);
    }
    case 'anthropic': {
      const { anthropic } = await import('@ai-sdk/anthropic');
      return anthropic(modelName);
    }
    case 'google': {
      const { google } = await import('@ai-sdk/google');
      return google(modelName);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Set API key in environment variable for the provider
 */
function setApiKeyInEnv(provider: ProviderType, apiKey: string): void {
  switch (provider) {
    case 'openai':
      process.env.OPENAI_API_KEY = apiKey;
      break;
    case 'anthropic':
      process.env.ANTHROPIC_API_KEY = apiKey;
      break;
    case 'google':
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
      break;
  }
}

/**
 * Get recommended model for a provider
 */
export function getDefaultModel(provider: ProviderType): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    case 'google':
      return 'gemini-3-flash-preview';
    default:
      return 'gpt-4o';
  }
}
