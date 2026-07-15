import type { ProviderType } from '../types.js';
import type { AnthropicProviderSettings } from '@ai-sdk/anthropic';
import type { OpenAICompatibleProviderSettings } from '@ai-sdk/openai-compatible';
import type { LanguageModelV1 } from 'ai';

/**
 * Create a language model instance based on provider and model name
 *
 * Note: API keys should be set via environment variables:
 * - OPENAI_API_KEY for OpenAI
 * - OPENAI_COMPATIBLE_API_KEY for OpenAI-compatible
 * - ANTHROPIC_API_KEY for Anthropic
 * - GOOGLE_GENERATIVE_AI_API_KEY for Google
 * - GROQ_API_KEY for Groq
 *
 * If an apiKey is passed, it will be set in the environment for this process.
 */
export async function createModel(
  provider: ProviderType,
  modelName: string,
  apiKey?: string,
  baseUrl?: string,
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
    case 'openai-compatible': {
      if (!baseUrl) {
        throw new Error('baseUrl is required when provider is openai-compatible.');
      }
      const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible');
      const options: OpenAICompatibleProviderSettings = {
        name: 'openai-compatible',
        baseURL: baseUrl,
      };
      if (apiKey) {
        options.apiKey = apiKey;
      }
      return createOpenAICompatible(options).chatModel(modelName);
    }
    case 'anthropic': {
      const { anthropic, createAnthropic } = await import('@ai-sdk/anthropic');
      if (baseUrl) {
        const options: AnthropicProviderSettings = {
          baseURL: baseUrl,
        };
        if (apiKey) {
          options.apiKey = apiKey;
        }
        return createAnthropic(options)(modelName);
      }
      return anthropic(modelName);
    }
    case 'google': {
      const { google } = await import('@ai-sdk/google');
      return google(modelName);
    }
    case 'groq': {
      const { groq } = await import('@ai-sdk/groq');
      return groq(modelName);
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
    case 'openai-compatible':
      process.env.OPENAI_COMPATIBLE_API_KEY = apiKey;
      break;
    case 'anthropic':
      process.env.ANTHROPIC_API_KEY = apiKey;
      break;
    case 'google':
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
      break;
    case 'groq':
      process.env.GROQ_API_KEY = apiKey;
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
    case 'openai-compatible':
      return 'gpt-4o';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    case 'google':
      return 'gemini-3-flash-preview';
    case 'groq':
      return 'llama-3.3-70b-versatile';
    default:
      return 'gpt-4o';
  }
}
