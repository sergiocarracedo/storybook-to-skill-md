import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load the system prompt from the markdown file
 */
function loadSystemPrompt(): string {
  const promptPath = join(__dirname, 'SYSTEM_PROMPT.md');
  return readFileSync(promptPath, 'utf-8');
}

/**
 * System prompt for generating SKILL.md files
 * Loaded from SYSTEM_PROMPT.md
 */
export const SKILL_CREATOR_SYSTEM_PROMPT = loadSystemPrompt();

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
