import { afterEach, describe, expect, it } from 'vitest';

import { createModel } from '../../src/generation/model-factory.js';

describe('Generation - model factory compatible providers', () => {
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const originalOpenAICompatibleKey = process.env.OPENAI_COMPATIBLE_API_KEY;

  afterEach(() => {
    if (originalOpenAIKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIKey;
    }

    if (originalOpenAICompatibleKey === undefined) {
      delete process.env.OPENAI_COMPATIBLE_API_KEY;
    } else {
      process.env.OPENAI_COMPATIBLE_API_KEY = originalOpenAICompatibleKey;
    }
  });

  it('requires baseUrl for openai-compatible', async () => {
    await expect(createModel('openai-compatible', 'llama-3.3-70b-versatile')).rejects.toThrow(
      'baseUrl is required when provider is openai-compatible.',
    );
  });

  it('sets a separate API key environment variable for openai-compatible', async () => {
    process.env.OPENAI_API_KEY = 'official-openai-key';

    await createModel(
      'openai-compatible',
      'llama-3.3-70b-versatile',
      'compatible-key',
      'https://llm.example.com/v1',
    );

    expect(process.env.OPENAI_API_KEY).toBe('official-openai-key');
    expect(process.env.OPENAI_COMPATIBLE_API_KEY).toBe('compatible-key');
  });

  it('ignores baseUrl for openai provider', async () => {
    await expect(
      createModel('openai', 'gpt-4o', undefined, 'https://llm.example.com/v1'),
    ).resolves.toBeDefined();
  });

  it('ignores baseUrl for google and groq providers', async () => {
    await expect(
      createModel('google', 'gemini-1.5-flash', undefined, 'https://llm.example.com/v1'),
    ).resolves.toBeDefined();

    await expect(
      createModel('groq', 'llama-3.3-70b-versatile', undefined, 'https://llm.example.com/v1'),
    ).resolves.toBeDefined();
  });
});
