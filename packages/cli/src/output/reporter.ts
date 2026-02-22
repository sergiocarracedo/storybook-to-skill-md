import chalk from 'chalk';

import type { GenerationResult, ProcessSummary } from '../types.js';

/**
 * Format duration in seconds
 */
function formatDuration(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}

/**
 * Format tokens with ~ prefix
 */
function formatTokens(tokens: number): string {
  return '~' + tokens.toLocaleString();
}

/**
 * Print component header
 */
export function printComponentHeader(title: string): void {
  console.log(chalk.bold('\n' + '━'.repeat(60)));
  console.log(chalk.bold(`[COMPONENT] ${title}`));
  console.log(chalk.bold('━'.repeat(60)));
}

/**
 * Print extraction progress for a component
 */
export function printExtractionStart(): void {
  console.log(chalk.cyan('\n[EXTRACT] Fetching sources...'));
}

/**
 * Print extraction item progress
 */
export function printExtractionItem(name: string, duration: number, isLast = false): void {
  const prefix = isLast ? '   +--' : '   |--';
  const dots = '.'.repeat(Math.max(1, 30 - name.length));
  console.log(`${prefix} ${name} ${chalk.dim(dots)} ${chalk.green('OK')} ${chalk.dim('(' + formatDuration(duration) + ')')}`);
}

/**
 * Print extraction total
 */
export function printExtractionTotal(duration: number): void {
  console.log(chalk.dim(`   +-- Total: ${formatDuration(duration)}`));
}

/**
 * Print generation start
 */
export function printGenerationStart(): void {
  console.log(chalk.magenta('\n[GENERATE] Creating skill files...'));
}

/**
 * Print generation item progress
 */
export function printGenerationItem(name: string, duration: number, tokens: number, isLast = false): void {
  const prefix = isLast ? '   +--' : '   |--';
  const dots = '.'.repeat(Math.max(1, 30 - name.length));
  console.log(`${prefix} ${name} ${chalk.dim(dots)} ${chalk.green('OK')} ${chalk.dim('(' + formatDuration(duration) + ', ' + formatTokens(tokens) + ' tokens)')}`);
}

/**
 * Print generation total
 */
export function printGenerationTotal(duration: number, tokens: number): void {
  console.log(chalk.dim(`   +-- Total: ${formatDuration(duration)}, ${formatTokens(tokens)} tokens`));
}

/**
 * Print component completion
 */
export function printComponentComplete(duration: number, tokens: number, stories: number, props: number): void {
  console.log(chalk.green.bold(`\n[OK] Completed (${formatDuration(duration)}, ${formatTokens(tokens)} tokens, ${stories} stories, ${props} props)`));
}

/**
 * Print component skip
 */
export function printComponentSkipped(reason: string): void {
  console.log(chalk.yellow.bold(`\n[SKIP] ${reason}`));
}

/**
 * Print component failure
 */
export function printComponentFailed(error: string): void {
  console.log(chalk.red.bold(`\n[FAIL] ${error}`));
}

/**
 * Print generation item failure
 */
export function printGenerationItemFailed(name: string, attempt: number, maxAttempts: number, isLast = false): void {
  const prefix = isLast ? '   +--' : '   |--';
  const dots = '.'.repeat(Math.max(1, 30 - name.length));
  console.log(`${prefix} ${name} ${chalk.dim(dots)} ${chalk.red('FAIL')} ${chalk.dim('(attempt ' + attempt + '/' + maxAttempts + ')')}`);
}

/**
 * Print a summary table of generation results
 */
export function printSummary(summary: ProcessSummary): void {
  const { results, totalDuration, totalEstimatedTokens, extractionErrors } = summary;
  
  console.log('\n' + chalk.bold('═'.repeat(60)));
  console.log(chalk.bold('                     Generation Summary'));
  console.log(chalk.bold('═'.repeat(60)) + '\n');

  // Print each result in a compact table format
  for (const result of results) {
    const status = getStatusLabel(result.status);
    const duration = result.duration ? formatDuration(result.duration).padStart(7) : '     --';
    const tokens = result.estimatedTokens ? formatTokens(result.estimatedTokens).padStart(12) : '         --';
    
    let statusLine: string;
    if (result.status === 'generated') {
      statusLine = `${status} ${chalk.dim(result.slug.padEnd(20))} generated ${chalk.dim(duration + '  ' + tokens)}`;
    } else if (result.status === 'skipped') {
      statusLine = `${status} ${chalk.dim(result.slug.padEnd(20))} ${result.message || 'unchanged'} ${chalk.dim(duration + '  ' + tokens)}`;
    } else {
      statusLine = `${status} ${chalk.dim(result.slug.padEnd(20))} ${chalk.red(result.error || 'unknown error')} ${chalk.dim(duration + '  ' + tokens)}`;
    }
    
    console.log(statusLine);
  }

  const generated = results.filter((r) => r.status === 'generated');
  const skipped = results.filter((r) => r.status === 'skipped');
  const failed = results.filter((r) => r.status === 'failed');

  // Print totals
  console.log('\n' + chalk.dim('─'.repeat(60)));
  console.log(
    `Generated: ${chalk.bold(generated.length)}    ` +
    `Skipped: ${chalk.bold(skipped.length)}    ` +
    `Failed: ${chalk.bold(failed.length)}`,
  );

  // Print failed components list
  if (failed.length > 0) {
    console.log('\n' + chalk.red('Failed:'));
    for (const result of failed) {
      console.log(chalk.red(`  * ${result.slug}: ${result.error || 'unknown error'}`));
    }
  }

  // Print extraction errors if any
  if (extractionErrors.length > 0) {
    console.log('\n' + chalk.red('Extraction errors:'));
    for (const error of extractionErrors) {
      console.log(chalk.red(`  * ${error}`));
    }
  }

  // Calculate totals
  const totalStories = results.reduce((sum, r) => sum + (r.storiesCount ?? 0), 0);
  const totalProps = results.reduce((sum, r) => sum + (r.propsCount ?? 0), 0);

  console.log('\n' + chalk.dim('─'.repeat(60)));
  console.log(`${chalk.cyan('Total time:')}        ${chalk.bold(formatDuration(totalDuration))}`);
  console.log(`${chalk.cyan('Total tokens:')}      ${chalk.bold(formatTokens(totalEstimatedTokens))}`);
  if (totalStories > 0 || totalProps > 0) {
    console.log(`${chalk.cyan('Total stories:')}     ${chalk.bold(totalStories)}`);
    console.log(`${chalk.cyan('Total props:')}       ${chalk.bold(totalProps)}`);
  }
  console.log(chalk.bold('═'.repeat(60)) + '\n');
}

/**
 * Get status label for a result
 */
function getStatusLabel(status: GenerationResult['status']): string {
  switch (status) {
    case 'generated':
      return chalk.green('[OK]  ');
    case 'skipped':
      return chalk.yellow('[SKIP]');
    case 'failed':
      return chalk.red('[FAIL]');
    default:
      return '      ';
  }
}

/**
 * Format a table row
 */
export function formatTableRow(columns: string[], widths: number[]): string {
  return columns
    .map((col, i) => {
      const width = widths[i] ?? 20;
      return col.padEnd(width);
    })
    .join(' | ');
}
