import type { SkillgenConfig } from '../types.js';

export const DEFAULT_CONFIG: SkillgenConfig = {
  sourceDir: './src',
  outputDir: './skills',
  concurrency: 3,
  verbose: false,
  dryRun: false,
  force: false,
  timeout: 60000,
  retries: 2,
  fetchRetries: 3,
  extractionConcurrency: 3,
  indexSkill: true,
};

export const ENV_PREFIX = 'SKILLGEN_';

export const CONFIG_FILE_NAMES = [
  'skillgen.config.ts',
  'skillgen.config.js',
  'skillgen.config.json',
  '.skillgenrc.json',
  '.skillgenrc.yaml',
  '.skillgenrc.yml',
  '.skillgenrc.toml',
  '.skillgenrc',
];
