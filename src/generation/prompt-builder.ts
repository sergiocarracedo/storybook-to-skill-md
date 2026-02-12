/**
 * System prompt for generating SKILL.md files
 * Based on the agentskills.io skill-creator specification
 */
export const SKILL_CREATOR_SYSTEM_PROMPT = `You are a technical documentation expert specializing in creating SKILL.md files for AI agents. Your task is to analyze component data from Storybook and generate comprehensive, well-structured SKILL.md documentation.

## SKILL.md Format Requirements

### Frontmatter (Required)
The file MUST begin with YAML frontmatter containing:
- \`name\`: The skill name (lowercase, hyphenated)
- \`description\`: A concise description (50-200 chars) explaining WHEN to use this component and its primary purpose

### Body Content Guidelines
1. Start with a brief overview of the component's purpose
2. Include relevant sections based on complexity:
   - **Props/API**: Document important props with types and descriptions
   - **Usage Examples**: Show common usage patterns with code snippets
   - **Variants**: Describe different component variants/states
   - **Best Practices**: Include dos and don'ts when relevant
   - **Accessibility**: Note any a11y considerations

### Content Rules
- Keep the body under 500 lines
- Focus on practical, actionable information
- Use clear, concise language
- Include code examples in TypeScript/TSX
- Avoid: Installation instructions, Contributing guides, Changelogs, License info

### Quality Standards
- The description MUST mention when/why to use the component
- Props should include type information and default values
- Code examples should be complete and runnable
- Structure content for easy scanning by AI agents

## Output Format
Generate ONLY the SKILL.md content. Do not include any explanations or meta-commentary.
The output should be valid Markdown that starts with the YAML frontmatter.`;

/**
 * Build the user prompt with component data
 */
export function buildUserPrompt(componentData: {
  slug: string;
  title: string;
  hierarchyPath: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
  }>;
  argTypes: Record<string, unknown>;
  defaultArgs: Record<string, unknown>;
  stories: Array<{ name: string; args: Record<string, unknown> }>;
  documentation: Array<{ textContent: string; codeExamples: string[] }>;
  subPages: string[];
}): string {
  const sections: string[] = [];

  // Basic info
  sections.push(`# Component: ${componentData.title}`);
  sections.push(`Slug: ${componentData.slug}`);
  sections.push(`Hierarchy: ${componentData.hierarchyPath}`);

  // Props
  if (componentData.props.length > 0) {
    sections.push('\n## Props');
    for (const prop of componentData.props) {
      const required = prop.required ? '(required)' : '(optional)';
      const defaultVal = prop.defaultValue ? ` [default: ${prop.defaultValue}]` : '';
      sections.push(`- **${prop.name}** ${required}: \`${prop.type}\`${defaultVal}`);
      if (prop.description) {
        sections.push(`  ${prop.description}`);
      }
    }
  }

  // Stories (use cases)
  if (componentData.stories.length > 0) {
    sections.push('\n## Stories (Use Cases)');
    for (const story of componentData.stories) {
      sections.push(`- **${story.name}**`);
      if (Object.keys(story.args).length > 0) {
        sections.push(`  Args: ${JSON.stringify(story.args)}`);
      }
    }
  }

  // Default args
  if (Object.keys(componentData.defaultArgs).length > 0) {
    sections.push('\n## Default Args');
    sections.push('```json');
    sections.push(JSON.stringify(componentData.defaultArgs, null, 2));
    sections.push('```');
  }

  // Documentation content
  if (componentData.documentation.length > 0) {
    sections.push('\n## Documentation');
    for (const doc of componentData.documentation) {
      if (doc.textContent) {
        sections.push(doc.textContent);
      }
      if (doc.codeExamples.length > 0) {
        sections.push('\n### Code Examples');
        for (const example of doc.codeExamples.slice(0, 3)) {
          sections.push('```tsx');
          sections.push(example);
          sections.push('```');
        }
      }
    }
  }

  // Sub-pages
  if (componentData.subPages.length > 0) {
    sections.push('\n## Related Sub-pages');
    sections.push(`This component has the following sub-pages: ${componentData.subPages.join(', ')}`);
  }

  sections.push('\n---');
  sections.push('Generate a SKILL.md file for this component following the guidelines in the system prompt.');

  return sections.join('\n');
}

/**
 * Build complete prompt object
 */
export function buildPrompt(componentData: Parameters<typeof buildUserPrompt>[0]): {
  system: string;
  user: string;
} {
  return {
    system: SKILL_CREATOR_SYSTEM_PROMPT,
    user: buildUserPrompt(componentData),
  };
}
