import { cosmiconfig } from 'cosmiconfig';
import process from 'node:process';

import type { SkillgenConfig } from '../types.js';

import { CONFIG_FILE_NAMES, DEFAULT_CONFIG, ENV_PREFIX } from './defaults.js';
import { validateConfig } from './schema.js';

const explorer = cosmiconfig('skillgen', {
  searchPlaces: CONFIG_FILE_NAMES,
});

/**
 * Load environment variables with SKILLGEN_ prefix
 */
function loadEnvConfig(): Partial<SkillgenConfig> {
  const env: Partial<SkillgenConfig> = {};

  const storybookUrl = process.env[`${ENV_PREFIX}STORYBOOK_URL`];
  if (storybookUrl) env.storybookUrl = storybookUrl;

  const sourceDir = process.env[`${ENV_PREFIX}SOURCE_DIR`];
  if (sourceDir) env.sourceDir = sourceDir;

  const outputDir = process.env[`${ENV_PREFIX}OUTPUT_DIR`];
  if (outputDir) env.outputDir = outputDir;

  const provider = process.env[`${ENV_PREFIX}PROVIDER`];
  if (provider && ['openai', 'anthropic', 'google'].includes(provider)) {
    env.provider = provider as 'openai' | 'anthropic' | 'google';
  }

  const model = process.env[`${ENV_PREFIX}MODEL`];
  if (model) env.model = model;

  const apiKey = process.env[`${ENV_PREFIX}API_KEY`];
  if (apiKey) env.apiKey = apiKey;

  const concurrency = process.env[`${ENV_PREFIX}CONCURRENCY`];
  if (concurrency) {
    const parsed = parseInt(concurrency, 10);
    if (!isNaN(parsed)) env.concurrency = parsed;
  }

  const verbose = process.env[`${ENV_PREFIX}VERBOSE`];
  if (verbose) env.verbose = verbose === 'true' || verbose === '1';

  return env;
}

/**
 * Result from loading a config file
 */
export interface ConfigFileResult {
  config: Partial<SkillgenConfig>;
  filepath: string | null;
}

/**
 * Load config file using cosmiconfig
 */
async function loadConfigFile(configPath?: string): Promise<ConfigFileResult> {
  try {
    const result = configPath ? await explorer.load(configPath) : await explorer.search();

    if (result?.config) {
      return {
        config: result.config as Partial<SkillgenConfig>,
        filepath: result.filepath,
      };
    }
  } catch {
    // Config file not found or invalid - continue with defaults
  }

  return { config: {}, filepath: null };
}

/**
 * Result from loading the full configuration
 */
export interface LoadConfigResult {
  config: SkillgenConfig;
  configFilePath: string | null;
}

/**
 * Merge configs with precedence: defaults < config file < env vars < CLI flags
 */
export async function loadConfig(
  cliOptions: Partial<SkillgenConfig> = {},
  configPath?: string,
): Promise<LoadConfigResult> {
  const { config: fileConfig, filepath: configFilePath } = await loadConfigFile(configPath);
  const envConfig = loadEnvConfig();

  // Remove undefined values from CLI options
  const cleanCliOptions = Object.fromEntries(
    Object.entries(cliOptions).filter(([, v]) => v !== undefined),
  );

  const merged = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
    ...cleanCliOptions,
  };

  return {
    config: validateConfig(merged) as SkillgenConfig,
    configFilePath,
  };
}

export { explorer };
