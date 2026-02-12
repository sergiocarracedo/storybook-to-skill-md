import { describe, expect, it } from 'vitest';

import { validateSkillMd, extractFrontmatter } from '../../src/validation/skill-validator.js';

describe('Validation - SKILL.md Validator', () => {
  describe('validateSkillMd', () => {
    it('validates a correct SKILL.md', () => {
      const content = `---
name: button
description: Use this button component when you need a clickable element for user interactions and form submissions.
---

# Button

A reusable button component.

## Props

- **variant**: The visual style
- **size**: The button size
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when frontmatter is missing', () => {
      const content = `# Button

No frontmatter here.
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('frontmatter'))).toBe(true);
    });

    it('fails when name is missing', () => {
      const content = `---
description: A button component
---

# Button
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('fails when description is missing', () => {
      const content = `---
name: button
---

# Button
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('description'))).toBe(true);
    });

    it('warns when description is too short', () => {
      const content = `---
name: button
description: A button.
---

# Button
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('too short'))).toBe(true);
    });

    it('warns about disallowed sections', () => {
      const content = `---
name: button
description: Use this button component when you need interactive clickable elements in your application.
---

# Button

## Installation

npm install button

## Props

- variant
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('installation'))).toBe(true);
    });

    it('warns about extra frontmatter fields', () => {
      const content = `---
name: button
description: Use this button component when you need interactive clickable elements in your application.
version: 1.0.0
author: John Doe
---

# Button
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Extra frontmatter'))).toBe(true);
    });

    it('fails when body is empty', () => {
      const content = `---
name: button
description: Use this button component when you need interactive clickable elements in your application.
---
`;

      const result = validateSkillMd(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('empty'))).toBe(true);
    });
  });

  describe('extractFrontmatter', () => {
    it('extracts frontmatter correctly', () => {
      const content = `---
name: button
description: A button component
---

# Body
`;

      const frontmatter = extractFrontmatter(content);
      expect(frontmatter?.name).toBe('button');
      expect(frontmatter?.description).toBe('A button component');
    });

    it('returns null for invalid content', () => {
      const content = `No frontmatter here`;
      const frontmatter = extractFrontmatter(content);
      expect(frontmatter).toBeNull();
    });
  });
});
