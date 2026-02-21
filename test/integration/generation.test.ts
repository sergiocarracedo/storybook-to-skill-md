import { describe, expect, it } from 'vitest';

import { buildPrompt, buildUserPrompt } from '../../src/generation/prompt-builder.js';
import type { ComponentData } from '../../src/types.js';

describe('Generation - Prompt Builder', () => {
  const mockComponentData: ComponentData = {
    slug: 'button',
    title: 'Button',
    hierarchyPath: 'Components/Button',
    props: [
      { name: 'variant', type: "'primary' | 'secondary'", required: false, description: 'Button style', defaultValue: 'primary' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disabled state', defaultValue: 'false' },
      { name: 'onClick', type: '() => void', required: false, description: 'Click handler' },
    ],
    argTypes: {
      variant: { name: 'variant', description: 'The visual style of the button' },
    },
    defaultArgs: { variant: 'primary' },
    stories: [
      { name: 'Primary', args: { variant: 'primary' } },
      { name: 'Secondary', args: { variant: 'secondary' } },
      { name: 'Disabled', args: { disabled: true } },
    ],
    documentation: [],
    subPages: [],
    sourceFiles: ['/src/Button.tsx'],
  };

  describe('buildUserPrompt', () => {
    it('includes component title', () => {
      const prompt = buildUserPrompt(mockComponentData);
      expect(prompt).toContain('Button');
      expect(prompt).toContain('# Component: Button');
    });

    it('includes all props with types', () => {
      const prompt = buildUserPrompt(mockComponentData);
      expect(prompt).toContain('variant');
      expect(prompt).toContain('disabled');
      expect(prompt).toContain('onClick');
      expect(prompt).toContain("'primary' | 'secondary'");
    });

    it('includes all stories', () => {
      const prompt = buildUserPrompt(mockComponentData);
      expect(prompt).toContain('Primary');
      expect(prompt).toContain('Secondary');
      expect(prompt).toContain('Disabled');
    });

    it('includes default args', () => {
      const prompt = buildUserPrompt(mockComponentData);
      expect(prompt).toContain('"variant": "primary"');
    });

    it('marks required props correctly', () => {
      const mockDataWithRequired: ComponentData = {
        ...mockComponentData,
        props: [
          { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
          { name: 'variant', type: "'primary' | 'secondary'", required: false, description: 'Button style', defaultValue: 'primary' },
        ],
      };
      const prompt = buildUserPrompt(mockDataWithRequired);
      expect(prompt).toContain('(required)');
      expect(prompt).toContain('**id** (required)');
    });
  });

  describe('buildPrompt', () => {
    it('returns system and user prompts', () => {
      const { system, user } = buildPrompt(mockComponentData);

      expect(system).toContain('SKILL.md');
      expect(system).toContain('frontmatter');
      expect(user).toContain('Button');
    });

    it('system prompt includes quality guidelines', () => {
      const { system } = buildPrompt(mockComponentData);

      expect(system).toContain('name');
      expect(system).toContain('description');
      expect(system).toContain('50-200');
    });
  });
});
