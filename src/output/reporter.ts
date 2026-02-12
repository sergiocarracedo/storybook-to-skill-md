import chalk from 'chalk';

import type { GenerationResult } from '../types.js';

/**
 * Print a summary table of generation results
 */
export function printSummary(results: GenerationResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold('Generation Summary'));
  console.log('='.repeat(60) + '\n');

  const generated = results.filter((r) => r.status === 'generated');
  const skipped = results.filter((r) => r.status === 'skipped');
  const failed = results.filter((r) => r.status === 'failed');

  // Print each result
  for (const result of results) {
    const icon = getStatusIcon(result.status);
    const details = getResultDetails(result);
    console.log(`${icon} ${chalk.bold(result.slug)} — ${details}`);
  }

  // Print totals
  console.log('\n' + '-'.repeat(60));
  console.log(
    `${chalk.green('Generated:')} ${generated.length}  ` +
    `${chalk.yellow('Skipped:')} ${skipped.length}  ` +
    `${chalk.red('Failed:')} ${failed.length}`,
  );

  // Calculate totals
  const totalStories = results.reduce((sum, r) => sum + (r.storiesCount ?? 0), 0);
  const totalProps = results.reduce((sum, r) => sum + (r.propsCount ?? 0), 0);

  if (totalStories > 0 || totalProps > 0) {
    console.log(`${chalk.cyan('Total stories:')} ${totalStories}  ${chalk.cyan('Total props:')} ${totalProps}`);
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Get status icon for a result
 */
function getStatusIcon(status: GenerationResult['status']): string {
  switch (status) {
    case 'generated':
      return chalk.green('✅');
    case 'skipped':
      return chalk.yellow('⏭️ ');
    case 'failed':
      return chalk.red('❌');
    default:
      return '  ';
  }
}

/**
 * Get details string for a result
 */
function getResultDetails(result: GenerationResult): string {
  switch (result.status) {
    case 'generated':
      return chalk.green(`generated (${result.storiesCount ?? 0} stories, ${result.propsCount ?? 0} props)`);
    case 'skipped':
      return chalk.yellow(result.message ?? 'unchanged, skipped');
    case 'failed':
      return chalk.red(`failed: ${result.message ?? 'unknown error'}`);
    default:
      return '';
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
