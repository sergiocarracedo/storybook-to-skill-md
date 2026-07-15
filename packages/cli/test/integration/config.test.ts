import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadConfig, validateConfig } from '../../src/config/index.js';

const ENV_KEYS = [
  'SKILLGEN_BASE_URL',
  'SKILLGEN_INDEX_FILE',
  'SKILLGEN_PROVIDER',
  'SKILLGEN_MODEL',
];

describe('Config - compatible providers', () => {
  let originalEnv: Record<string, string | undefined>;
  let tempDir: string;

  beforeEach(() => {
    originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillgen-config-test-'));
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = originalEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('accepts openai-compatible and baseUrl in validated config', () => {
    const config = validateConfig({
      indexFile: './storybook-static/index.json',
      sourceDir: './src',
      outputDir: './skills',
      provider: 'openai-compatible',
      model: 'llama-3.3-70b-versatile',
      baseUrl: 'https://llm.example.com/v1',
    });

    expect(config.provider).toBe('openai-compatible');
    expect(config.baseUrl).toBe('https://llm.example.com/v1');
  });

  it('loads openai-compatible and baseUrl from environment variables', async () => {
    process.env.SKILLGEN_PROVIDER = 'openai-compatible';
    process.env.SKILLGEN_BASE_URL = 'https://env-llm.example.com/v1';

    const { config } = await loadConfig({
      indexFile: './storybook-static/index.json',
      model: 'llama-3.3-70b-versatile',
    });

    expect(config.provider).toBe('openai-compatible');
    expect(config.baseUrl).toBe('https://env-llm.example.com/v1');
  });

  it('allows CLI baseUrl to override config file baseUrl', async () => {
    const configPath = path.join(tempDir, 'skillgen.config.json');
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        indexFile: './storybook-static/index.json',
        sourceDir: './src',
        outputDir: './skills',
        provider: 'openai-compatible',
        model: 'llama-3.3-70b-versatile',
        baseUrl: 'https://file-llm.example.com/v1',
      }),
    );

    const { config } = await loadConfig(
      {
        baseUrl: 'https://cli-llm.example.com/v1',
      },
      configPath,
    );

    expect(config.baseUrl).toBe('https://cli-llm.example.com/v1');
  });
});
