import type { GenerationResult, SkillgenConfig } from '../types.js';

import fs from 'node:fs';

import { readSkillFile, writeIndexSkill } from '../output/index.js';
import { extractFrontmatter } from '../validation/skill-validator.js';

const DEFAULT_HEADER = [
  '---',
  'name: _index',
  'description: Index of all available component skills in this design system. Use this skill to discover which component to use for a given UI task.',
  '---',
  '',
  '# Component Skills Index',
  '',
  'This index lists all available component skills in this design system. Each skill describes a UI component with its props, usage patterns, and examples.',
  '',
  '## Available Components',
  '',
].join('\n');

/**
 * Generate a deterministic (no LLM) index SKILL.md that lists all processed components.
 * If config.indexSkillTemplate is set, the template file is used as the header/preamble
 * and the component list is always appended after it.
 */
export function generateIndexSkill(
  outputDir: string,
  results: GenerationResult[],
  config?: Pick<SkillgenConfig, 'indexSkillTemplate'>,
): void {
  const successResults = results.filter((r) => r.status !== 'failed');

  if (successResults.length === 0) {
    return;
  }

  const entries: { name: string; description: string; slug: string }[] = [];

  for (const result of successResults) {
    const content = readSkillFile(outputDir, result.slug);
    if (!content) continue;

    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) continue;

    entries.push({
      name: frontmatter.name ?? result.slug,
      description: frontmatter.description ?? '',
      slug: result.slug,
    });
  }

  if (entries.length === 0) {
    return;
  }

  // Sort alphabetically by name
  entries.sort((a, b) => a.name.localeCompare(b.name));

  // Build header from template file or built-in default
  let header = DEFAULT_HEADER;
  if (config?.indexSkillTemplate) {
    const raw = fs.readFileSync(config.indexSkillTemplate, 'utf-8');
    header = raw.endsWith('\n') ? raw : raw + '\n';
  }

  // Build the component list
  const listLines: string[] = [];
  for (const entry of entries) {
    const desc = entry.description ? ` — ${entry.description}` : '';
    listLines.push(`- [**${entry.name}**](../${entry.slug}/SKILL.md)${desc}`);
  }
  listLines.push('');

  writeIndexSkill(outputDir, header + listLines.join('\n'));
}
