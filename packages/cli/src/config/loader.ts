import type { SkillgenConfig } from '../types.js';

import { cosmiconfig } from 'cosmiconfig';
import path from 'node:path';
import process from 'node:process';

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

  const indexFile = process.env[`${ENV_PREFIX}INDEX_FILE`];
  if (indexFile) env.indexFile = indexFile;

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

  const promptFile = process.env[`${ENV_PREFIX}PROMPT_FILE`];
  if (promptFile) env.promptFile = promptFile;

  const timeout = process.env[`${ENV_PREFIX}TIMEOUT`];
  if (timeout) {
    const parsed = parseInt(timeout, 10);
    if (!isNaN(parsed)) env.timeout = parsed;
  }

  const retries = process.env[`${ENV_PREFIX}RETRIES`];
  if (retries) {
    const parsed = parseInt(retries, 10);
    if (!isNaN(parsed)) env.retries = parsed;
  }

  const fetchRetries = process.env[`${ENV_PREFIX}FETCH_RETRIES`];
  if (fetchRetries) {
    const parsed = parseInt(fetchRetries, 10);
    if (!isNaN(parsed)) env.fetchRetries = parsed;
  }

  const extractionConcurrency = process.env[`${ENV_PREFIX}EXTRACTION_CONCURRENCY`];
  if (extractionConcurrency) {
    const parsed = parseInt(extractionConcurrency, 10);
    if (!isNaN(parsed)) env.extractionConcurrency = parsed;
  }

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
 * Resolve relative paths in config relative to the config file's directory
 */
function resolveConfigPaths(
  config: Partial<SkillgenConfig>,
  configFilePath: string | null,
): Partial<SkillgenConfig> {
  const resolved = { ...config };

  // Determine the base directory for resolving relative paths
  // Use config file's directory if available, otherwise use process.cwd()
  const baseDir = configFilePath ? path.dirname(configFilePath) : process.cwd();

  // Resolve sourceDir if it's relative
  if (resolved.sourceDir && !path.isAbsolute(resolved.sourceDir)) {
    resolved.sourceDir = path.resolve(baseDir, resolved.sourceDir);
  }

  // Resolve outputDir if it's relative
  if (resolved.outputDir && !path.isAbsolute(resolved.outputDir)) {
    resolved.outputDir = path.resolve(baseDir, resolved.outputDir);
  }

  // Resolve indexFile if it's relative
  if (resolved.indexFile && !path.isAbsolute(resolved.indexFile)) {
    resolved.indexFile = path.resolve(baseDir, resolved.indexFile);
  }

  return resolved;
}

/**
 * Merge configs with precedence: defaults < config file < env vars < CLI flags
 */
export async function loadConfig(
  cliOptions: Partial<SkillgenConfig> = {},
  configPath?: string,
): Promise<LoadConfigResult> {
  const { config: fileConfig, filepath: configFilePath } = await loadConfigFile(configPath);

  // Resolve relative paths in file config before merging
  const resolvedFileConfig = resolveConfigPaths(fileConfig, configFilePath);

  const envConfig = loadEnvConfig();

  // Remove undefined values from CLI options
  const cleanCliOptions = Object.fromEntries(
    Object.entries(cliOptions).filter(([, v]) => v !== undefined),
  );

  // Resolve relative paths in CLI options relative to process.cwd()
  const resolvedCliOptions = resolveConfigPaths(cleanCliOptions, null);

  const merged = {
    ...DEFAULT_CONFIG,
    ...resolvedFileConfig,
    ...envConfig,
    ...resolvedCliOptions,
  };

  return {
    config: validateConfig(merged) as SkillgenConfig,
    configFilePath,
  };
}

export { explorer };
