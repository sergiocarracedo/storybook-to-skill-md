import fs from 'node:fs';
import path from 'node:path';

import type { SkillMeta } from '../types.js';

const META_FILENAME = '.skill-meta.json';

/**
 * Get the path to the meta file for a component
 */
export function getMetaPath(outputDir: string, slug: string): string {
  return path.join(outputDir, slug, META_FILENAME);
}

/**
 * Read skill meta from disk
 */
export function readSkillMeta(outputDir: string, slug: string): SkillMeta | null {
  const metaPath = getMetaPath(outputDir, slug);

  if (!fs.existsSync(metaPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(metaPath, 'utf-8');
    return JSON.parse(content) as SkillMeta;
  } catch {
    return null;
  }
}

/**
 * Write skill meta to disk
 */
export function writeSkillMeta(
  outputDir: string,
  slug: string,
  meta: SkillMeta,
): void {
  const componentDir = path.join(outputDir, slug);
  const metaPath = path.join(componentDir, META_FILENAME);

  // Ensure directory exists
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
}

/**
 * Create a new skill meta object
 */
export function createSkillMeta(
  provider: string,
  model: string,
  fileHashes: Record<string, string>,
  toolVersion: string,
): SkillMeta {
  return {
    generatedAt: new Date().toISOString(),
    toolVersion,
    provider,
    model,
    fileHashes,
  };
}

/**
 * Check if a component needs regeneration
 */
export function needsRegeneration(
  outputDir: string,
  slug: string,
  currentHashes: Record<string, string>,
  currentToolVersion: string,
  force: boolean,
): { needsRegen: boolean; reason?: string } {
  if (force) {
    return { needsRegen: true, reason: 'forced regeneration' };
  }

  const existingMeta = readSkillMeta(outputDir, slug);

  if (!existingMeta) {
    return { needsRegen: true, reason: 'no existing meta file' };
  }

  // Check tool version
  if (existingMeta.toolVersion !== currentToolVersion) {
    return { needsRegen: true, reason: 'tool version changed' };
  }

  // Check file hashes
  const currentKeys = Object.keys(currentHashes).sort();
  const existingKeys = Object.keys(existingMeta.fileHashes).sort();

  if (currentKeys.length !== existingKeys.length) {
    return { needsRegen: true, reason: 'number of source files changed' };
  }

  if (JSON.stringify(currentKeys) !== JSON.stringify(existingKeys)) {
    return { needsRegen: true, reason: 'source files changed' };
  }

  for (const key of currentKeys) {
    if (currentHashes[key] !== existingMeta.fileHashes[key]) {
      return { needsRegen: true, reason: `file changed: ${key}` };
    }
  }

  return { needsRegen: false };
}
