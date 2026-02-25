#!/usr/bin/env node
import type { SkillgenConfig } from '../src/types.js';

import chalk from 'chalk';
import { program } from 'commander';
import { createRequire } from 'node:module';

import { loadConfig } from '../src/config/index.js';
import { generate, generateServerOnly } from '../src/index.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json');

/**
 * Print configuration in a nice box format
 */
function printConfigBox(
  config: SkillgenConfig,
  configFilePath: string | null,
  isServerOnly: boolean,
): void {
  const boxWidth = 80;
  const line = '─'.repeat(boxWidth);
  const doubleLine = '═'.repeat(boxWidth);

  console.log('\n' + chalk.bold('┌' + doubleLine + '┐'));
  console.log(chalk.bold('│' + 'CONFIGURATION'.padStart(47) + ' '.repeat(33) + '│'));
  console.log(chalk.bold('├' + doubleLine + '┤'));

  // Config file source
  const configSource = configFilePath || 'defaults + CLI arguments';
  printRow('Config Source', configSource, boxWidth);
  printRow(
    'Extraction Mode',
    isServerOnly ? chalk.yellow('Server-Only (browser)') : chalk.green('Local Files (fast)'),
    boxWidth,
  );

  console.log(chalk.dim('│' + line + '│'));

  // URLs and Directories
  printSection('URLS & DIRECTORIES', boxWidth);
  if (config.indexFile) {
    printRow('Index File', config.indexFile, boxWidth);
  }
  if (config.storybookUrl) {
    printRow('Storybook URL', config.storybookUrl, boxWidth);
  }
  printRow('Source Directory', config.sourceDir, boxWidth);
  printRow('Output Directory', config.outputDir, boxWidth);

  console.log(chalk.dim('│' + line + '│'));

  // LLM Configuration
  printSection('LLM PROVIDER', boxWidth);
  printRow('Provider', config.provider || chalk.dim('(not set)'), boxWidth);
  printRow('Model', config.model || chalk.dim('(not set)'), boxWidth);
  printRow(
    'API Key',
    config.apiKey ? chalk.green('✓ configured') : chalk.red('✗ not set'),
    boxWidth,
  );

  console.log(chalk.dim('│' + line + '│'));

  // Performance Settings
  printSection('PERFORMANCE', boxWidth);
  printRow('LLM Concurrency', String(config.concurrency), boxWidth);
  if (isServerOnly) {
    printRow(
      'Extraction Concurrency',
      String(config.extractionConcurrency) + chalk.dim(' (server-only mode)'),
      boxWidth,
    );
  }
  printRow('LLM Timeout', `${config.timeout}ms (${(config.timeout / 1000).toFixed(0)}s)`, boxWidth);
  printRow('LLM Retries', String(config.retries), boxWidth);
  printRow('Fetch Retries', String(config.fetchRetries), boxWidth);

  // Filtering
  if (config.include && config.include.length > 0) {
    console.log(chalk.dim('│' + line + '│'));
    printSection('FILTERING', boxWidth);
    printRow('Include Patterns', config.include.join(', '), boxWidth);
  }
  if (config.exclude && config.exclude.length > 0) {
    if (!config.include || config.include.length === 0) {
      console.log(chalk.dim('│' + line + '│'));
      printSection('FILTERING', boxWidth);
    }
    printRow('Exclude Patterns', config.exclude.join(', '), boxWidth);
  }

  // Flags
  console.log(chalk.dim('│' + line + '│'));
  printSection('FLAGS', boxWidth);
  printRow('Verbose', config.verbose ? chalk.green('✓ enabled') : chalk.dim('disabled'), boxWidth);
  printRow('Dry Run', config.dryRun ? chalk.yellow('✓ enabled') : chalk.dim('disabled'), boxWidth);
  printRow(
    'Force Regenerate',
    config.force ? chalk.yellow('✓ enabled') : chalk.dim('disabled'),
    boxWidth,
  );

  // Optional features
  if (config.promptFile || config.logPromptsDir) {
    console.log(chalk.dim('│' + line + '│'));
    printSection('ADVANCED', boxWidth);
    if (config.promptFile) {
      printRow('Custom Prompt', config.promptFile, boxWidth);
    }
    if (config.logPromptsDir) {
      printRow('Log Prompts To', config.logPromptsDir, boxWidth);
    }
  }

  console.log(chalk.bold('└' + doubleLine + '┘'));
}

/**
 * Print a section header
 */
function printSection(title: string, boxWidth: number): void {
  const padding = ' '.repeat(2);
  console.log(
    '│' + padding + chalk.cyan.bold(title) + ' '.repeat(boxWidth - title.length - 2) + '│',
  );
}

/**
 * Print a key-value row
 */
function printRow(key: string, value: string, boxWidth: number): void {
  const padding = ' '.repeat(2);
  const keyWidth = 22;
  const separator = ' : ';

  const keyPart = key.padEnd(keyWidth);
  const valuePart = value;

  // Handle long values by truncating
  const maxValueWidth = boxWidth - padding.length * 2 - keyWidth - separator.length;
  let displayValue = valuePart;
  if (stripAnsi(valuePart).length > maxValueWidth) {
    displayValue = valuePart.substring(0, maxValueWidth - 3) + '...';
  }

  const content = padding + chalk.dim(keyPart) + chalk.dim(separator) + displayValue;
  const contentLength = stripAnsi(content).length;
  const spacer = ' '.repeat(Math.max(0, boxWidth - contentLength));

  console.log('│' + content + spacer + '│');
}

/**
 * Strip ANSI color codes to get actual string length
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

program
  .name('storybook-to-skill-md')
  .description('Generate SKILL.md files from Storybook projects using LLMs')
  .version(VERSION);

program
  .command('generate')
  .description('Generate SKILL.md files from a Storybook project')
  .option('-u, --storybook-url <url>', 'Storybook URL (e.g., https://ds.example.com)')
  .option('--index-file <path>', 'Path to local index.json file (alternative to --storybook-url)')
  .option(
    '-s, --source-dir <dir>',
    'Source directory containing components (optional for server-only mode)',
  )
  .option('-o, --output-dir <dir>', 'Output directory for SKILL.md files')
  .option('-p, --provider <provider>', 'LLM provider (openai, anthropic, google)')
  .option('-m, --model <model>', 'LLM model name')
  .option('-k, --api-key <key>', 'API key for the LLM provider')
  .option('-i, --include <patterns...>', 'Glob patterns to include (matched against title)')
  .option('-e, --exclude <patterns...>', 'Glob patterns to exclude (matched against title)')
  .option('-c, --concurrency <number>', 'Number of concurrent LLM requests')
  .option('--config <path>', 'Path to config file')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show what would be generated without making changes')
  .option('--force', 'Regenerate all files even if unchanged')
  .option('--server-only', 'Extract metadata from Storybook server only (no local source files)')
  .option('--log-prompts <path>', 'Save prompts and extracted data to directory for debugging')
  .option('--prompt-file <path>', 'Path to custom system prompt file')
  .option('--timeout <ms>', 'Timeout for LLM calls in milliseconds')
  .option('--retries <number>', 'Number of retries for failed LLM calls')
  .option('--fetch-retries <number>', 'Number of retries for fetching Storybook index')
  .option(
    '--extraction-concurrency <number>',
    'Number of concurrent extractions (server-only mode)',
  )
  .option('--no-index-skill', 'Skip generating the index SKILL.md')
  .option('--index-skill-template <path>', 'Path to a custom template file for the index SKILL.md')
  .action(async (options) => {
    try {
      const isServerOnly = options.serverOnly || !options.sourceDir;

      // Only include options that were explicitly provided
      const cliConfig: Partial<SkillgenConfig> = {};

      // Add storybookUrl and indexFile if provided
      if (options.storybookUrl !== undefined) cliConfig.storybookUrl = options.storybookUrl;
      if (options.indexFile !== undefined) cliConfig.indexFile = options.indexFile;

      // Only add optional values if they were explicitly provided
      if (options.sourceDir !== undefined) cliConfig.sourceDir = options.sourceDir;
      if (options.outputDir !== undefined) cliConfig.outputDir = options.outputDir;
      if (options.provider !== undefined) cliConfig.provider = options.provider;
      if (options.model !== undefined) cliConfig.model = options.model;
      if (options.apiKey !== undefined) cliConfig.apiKey = options.apiKey;
      if (options.include !== undefined) cliConfig.include = options.include;
      if (options.exclude !== undefined) cliConfig.exclude = options.exclude;
      if (options.concurrency !== undefined)
        cliConfig.concurrency = parseInt(options.concurrency, 10);
      if (options.verbose !== undefined) cliConfig.verbose = options.verbose;
      if (options.dryRun !== undefined) cliConfig.dryRun = options.dryRun;
      if (options.force !== undefined) cliConfig.force = options.force;
      if (options.logPrompts !== undefined) cliConfig.logPromptsDir = options.logPrompts;
      if (options.promptFile !== undefined) cliConfig.promptFile = options.promptFile;
      if (options.timeout !== undefined) cliConfig.timeout = parseInt(options.timeout, 10);
      if (options.retries !== undefined) cliConfig.retries = parseInt(options.retries, 10);
      if (options.fetchRetries !== undefined)
        cliConfig.fetchRetries = parseInt(options.fetchRetries, 10);
      if (options.extractionConcurrency !== undefined)
        cliConfig.extractionConcurrency = parseInt(options.extractionConcurrency, 10);
      if (options.indexSkill === false) cliConfig.indexSkill = false;
      if (options.indexSkillTemplate !== undefined)
        cliConfig.indexSkillTemplate = options.indexSkillTemplate;

      const { config, configFilePath } = await loadConfig(cliConfig, options.config);

      if (config.verbose) {
        printConfigBox(config, configFilePath, isServerOnly);
      }

      let results;
      if (isServerOnly) {
        results = await generateServerOnly(config);
      } else {
        results = await generate(config);
      }

      // Print summary
      const generated = results.filter((r) => r.status === 'generated').length;
      const skipped = results.filter((r) => r.status === 'skipped').length;
      const failed = results.filter((r) => r.status === 'failed').length;

      console.log('\n--- Summary ---');
      console.log(`Generated: ${generated}`);
      console.log(`Skipped: ${skipped}`);
      console.log(`Failed: ${failed}`);

      if (failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
