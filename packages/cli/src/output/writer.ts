import fs from 'node:fs';
import path from 'node:path';

const SKILL_FILENAME = 'SKILL.md';

/**
 * Write SKILL.md file to the output directory
 */
export function writeSkillFile(outputDir: string, slug: string, content: string): void {
  const componentDir = path.join(outputDir, slug);
  const skillPath = path.join(componentDir, SKILL_FILENAME);

  // Ensure directory exists
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  fs.writeFileSync(skillPath, content, 'utf-8');
}

/**
 * Write a reference file to the output directory
 */
export function writeReferenceFile(
  outputDir: string,
  slug: string,
  filename: string,
  content: string,
): void {
  const refDir = path.join(outputDir, slug, 'references', filename);
  const refDirPath = path.dirname(refDir);

  // Ensure directory exists
  if (!fs.existsSync(refDirPath)) {
    fs.mkdirSync(refDirPath, { recursive: true });
  }

  fs.writeFileSync(refDir, content, 'utf-8');
}

/**
 * Read SKILL.md file from the output directory
 */
export function readSkillFile(outputDir: string, slug: string): string | null {
  const skillPath = path.join(outputDir, slug, SKILL_FILENAME);

  if (!fs.existsSync(skillPath)) {
    return null;
  }

  return fs.readFileSync(skillPath, 'utf-8');
}

/**
 * Check if SKILL.md exists for a component
 */
export function skillFileExists(outputDir: string, slug: string): boolean {
  const skillPath = path.join(outputDir, slug, SKILL_FILENAME);
  return fs.existsSync(skillPath);
}

/**
 * Write the index SKILL.md file to the output directory
 */
export function writeIndexSkill(outputDir: string, content: string): void {
  const indexDir = path.join(outputDir, '_index');

  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }

  fs.writeFileSync(path.join(indexDir, SKILL_FILENAME), content, 'utf-8');
}

/**
 * Get the path to the SKILL.md file
 */
export function getSkillFilePath(outputDir: string, slug: string): string {
  return path.join(outputDir, slug, SKILL_FILENAME);
}
