import type {
  ComponentData,
  ComponentGroup,
  ExtractionMode,
  Frontmatter,
  SkillFile,
  SkillMeta,
} from './types.js';

/**
 * Domain validation utilities implementing Allium specification invariants
 */

/**
 * Check if a component group is valid (has at least one story or docs entry)
 */
export function isValidComponentGroup(group: ComponentGroup): boolean {
  return group.storyEntries.length > 0 || group.docsEntries.length > 0;
}

/**
 * Check if component data has sub-components
 */
export function hasSubComponents(component: ComponentData): boolean {
  return component.subPages.length > 0;
}

/**
 * Check if frontmatter is valid (has required name and description)
 */
export function isValidFrontmatter(frontmatter: Partial<Frontmatter>): boolean {
  return (
    typeof frontmatter.name === 'string' &&
    frontmatter.name.length > 0 &&
    typeof frontmatter.description === 'string' &&
    frontmatter.description.length >= 50 &&
    frontmatter.description.length <= 200
  );
}

/**
 * Check if a SKILL.md file is valid
 */
export function isValidSkillFile(skillFile: SkillFile): boolean {
  return isValidFrontmatter(skillFile.frontmatter);
}

/**
 * Check extraction mode based on source files presence
 * Server mode: sourceFiles is empty
 * Local mode: sourceFiles has entries
 */
export function getExtractionMode(component: ComponentData): ExtractionMode {
  return component.sourceFiles.length === 0 ? 'server' : 'local';
}

/**
 * Verify cache consistency: meta file hashes should match source files
 */
export function isCacheConsistent(meta: SkillMeta, currentHashes: Record<string, string>): boolean {
  const metaKeys = Object.keys(meta.fileHashes).sort();
  const currentKeys = Object.keys(currentHashes).sort();

  if (metaKeys.length !== currentKeys.length) {
    return false;
  }

  if (JSON.stringify(metaKeys) !== JSON.stringify(currentKeys)) {
    return false;
  }

  for (const key of metaKeys) {
    if (meta.fileHashes[key] !== currentHashes[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Validate component data completeness
 */
export function validateComponentData(component: ComponentData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!component.slug) {
    errors.push('Component slug is required');
  }

  if (!component.title) {
    errors.push('Component title is required');
  }

  if (!component.hierarchyPath) {
    errors.push('Component hierarchy path is required');
  }

  // A component should have either props or stories to be useful
  if (component.props.length === 0 && component.stories.length === 0) {
    errors.push('Component has no props or stories');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if description contains use-case indicators
 */
export function hasUseCaseDescription(description: string): boolean {
  const useCaseKeywords = ['when', 'use', 'for', 'to', 'provides', 'enables', 'allows'];
  const lowerDesc = description.toLowerCase();
  return useCaseKeywords.some((keyword) => lowerDesc.includes(keyword));
}

/**
 * Check for disallowed sections in SKILL.md body
 */
export function checkDisallowedSections(body: string): string[] {
  const disallowedSections = ['installation', 'contributing', 'changelog', 'license'];
  const violations: string[] = [];

  for (const section of disallowedSections) {
    const sectionRegex = new RegExp(`^#+\\s+${section}`, 'im');
    if (sectionRegex.test(body)) {
      violations.push(section);
    }
  }

  return violations;
}

/**
 * Calculate approximate line count
 */
export function getLineCount(text: string): number {
  return text.split('\n').length;
}

/**
 * Validate complete component generation result
 */
export function validateGenerationResult(result: {
  component: ComponentData;
  skillFile?: SkillFile;
  references?: Array<{ name: string; content: string }>;
}): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate component data
  const componentValidation = validateComponentData(result.component);
  if (!componentValidation.valid) {
    errors.push(...componentValidation.errors);
  }

  // Validate skill file if present
  if (result.skillFile) {
    if (!isValidSkillFile(result.skillFile)) {
      errors.push('Generated SKILL.md has invalid frontmatter');
    }

    const description = result.skillFile.frontmatter.description;
    if (description.length < 50) {
      warnings.push(`Description is too short (${description.length} chars, recommended: ≥50)`);
    }
    if (description.length > 200) {
      warnings.push(`Description is too long (${description.length} chars, recommended: ≤200)`);
    }
    if (!hasUseCaseDescription(description)) {
      warnings.push('Description should mention when/why to use this component');
    }

    const bodyLineCount = getLineCount(result.skillFile.body);
    if (bodyLineCount > 500) {
      warnings.push(`Body is too long (${bodyLineCount} lines, recommended: ≤500)`);
    }

    const disallowed = checkDisallowedSections(result.skillFile.body);
    if (disallowed.length > 0) {
      warnings.push(`Disallowed sections found: ${disallowed.join(', ')}`);
    }
  }

  // Validate references if present
  if (result.references) {
    for (const ref of result.references) {
      if (!ref.name) {
        errors.push('Reference file missing name');
      }
      if (!ref.content) {
        warnings.push(`Reference file ${ref.name || 'unnamed'} has no content`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
