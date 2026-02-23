import type { ValidationResult } from '../types.js';

import yaml from 'yaml';

/**
 * Validate a generated SKILL.md file
 */
export function validateSkillMd(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for frontmatter delimiters
  if (!content.startsWith('---')) {
    errors.push('Missing YAML frontmatter opening delimiter (---)');
    return { valid: false, errors, warnings };
  }

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push('Invalid frontmatter format: missing closing delimiter');
    return { valid: false, errors, warnings };
  }

  const frontmatterContent = frontmatterMatch[1];
  let frontmatter: Record<string, unknown>;

  try {
    frontmatter = yaml.parse(frontmatterContent ?? '') as Record<string, unknown>;
  } catch (e) {
    errors.push(`Invalid YAML in frontmatter: ${e instanceof Error ? e.message : String(e)}`);
    return { valid: false, errors, warnings };
  }

  // Check required fields
  if (!frontmatter.name) {
    errors.push('Missing required frontmatter field: name');
  } else if (typeof frontmatter.name !== 'string') {
    errors.push('Frontmatter field "name" must be a string');
  }

  if (!frontmatter.description) {
    errors.push('Missing required frontmatter field: description');
  } else if (typeof frontmatter.description !== 'string') {
    errors.push('Frontmatter field "description" must be a string');
  } else {
    // Check description quality
    const desc = frontmatter.description;
    if (desc.length < 50) {
      warnings.push(`Description is too short (${desc.length} chars, recommended: ≥50)`);
    }
    if (desc.length > 200) {
      warnings.push(`Description is too long (${desc.length} chars, recommended: ≤200)`);
    }

    // Check if description mentions use case
    const useCaseKeywords = ['when', 'use', 'for', 'to', 'provides', 'enables', 'allows'];
    const hasUseCase = useCaseKeywords.some((keyword) => desc.toLowerCase().includes(keyword));
    if (!hasUseCase) {
      warnings.push('Description should mention when/why to use this component');
    }
  }

  // Check for extra frontmatter fields
  const allowedFields = new Set(['name', 'description']);
  for (const key of Object.keys(frontmatter)) {
    if (!allowedFields.has(key)) {
      warnings.push(`Extra frontmatter field: "${key}" (only name and description are standard)`);
    }
  }

  // Get body content
  const body = content.slice(frontmatterMatch[0].length).trim();

  // Check body content
  if (!body) {
    errors.push('SKILL.md body is empty');
  } else {
    // Check for at least one heading
    const hasHeading = /^#+\s+/m.test(body);
    if (!hasHeading) {
      warnings.push('Body should contain at least one heading (#)');
    }

    // Check body length
    const lineCount = body.split('\n').length;
    if (lineCount > 500) {
      warnings.push(`Body is too long (${lineCount} lines, recommended: ≤500)`);
    }

    // Check for disallowed sections
    const disallowedSections = ['installation', 'contributing', 'changelog', 'license'];
    for (const section of disallowedSections) {
      const sectionRegex = new RegExp(`^#+\\s+${section}`, 'im');
      if (sectionRegex.test(body)) {
        warnings.push(`Disallowed section found: "${section}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract frontmatter from SKILL.md content
 */
export function extractFrontmatter(content: string): {
  name?: string;
  description?: string;
} | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  try {
    return yaml.parse(match[1] ?? '') as { name?: string; description?: string };
  } catch {
    return null;
  }
}
