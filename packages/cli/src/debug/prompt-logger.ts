import type { ComponentData, StoryIndex } from '../types.js';

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Ensure the log directory exists
 */
export function ensureLogDir(logDir: string): void {
  mkdirSync(logDir, { recursive: true });
}

/**
 * Log the raw Storybook index.json
 */
export function logStorybookIndex(logDir: string, index: StoryIndex): void {
  const filePath = join(logDir, '_storybook-index.json');
  writeFileSync(filePath, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Log extraction summary for all components
 */
export function logExtractionSummary(logDir: string, components: ComponentData[]): void {
  const summary = components.map((c) => ({
    slug: c.slug,
    title: c.title,
    hierarchyPath: c.hierarchyPath,
    propsCount: c.props.length,
    storiesCount: c.stories.length,
    docsCount: c.documentation.length,
    subPagesCount: c.subPages.length,
    subPages: c.subPages,
    props: c.props.map((p) => p.name),
    stories: c.stories.map((s) => s.name),
  }));
  const filePath = join(logDir, '_extraction-summary.json');
  writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf-8');
}

/**
 * Log the extracted component data (raw ComponentData)
 */
export function logExtractedData(logDir: string, slug: string, data: ComponentData): void {
  const filePath = join(logDir, `${slug}-extracted.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Log the system prompt as markdown
 */
export function logSystemPrompt(logDir: string, slug: string, systemPrompt: string): void {
  const filePath = join(logDir, `${slug}-system-prompt.md`);
  writeFileSync(filePath, systemPrompt, 'utf-8');
}

/**
 * Log the user prompt as markdown
 */
export function logUserPrompt(logDir: string, slug: string, userPrompt: string): void {
  const filePath = join(logDir, `${slug}-user-prompt.md`);
  writeFileSync(filePath, userPrompt, 'utf-8');
}

/**
 * Log the LLM response (generated SKILL.md)
 */
export function logResponse(logDir: string, slug: string, response: string): void {
  const filePath = join(logDir, `${slug}-response.md`);
  writeFileSync(filePath, response, 'utf-8');
}
