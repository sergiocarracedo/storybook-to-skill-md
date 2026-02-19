import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Limits for prompt size to avoid overwhelming the LLM
const MAX_DOCS_PER_COMPONENT = 5000; // Max chars per documentation entry
const MAX_TOTAL_DOCS = 15000; // Max total chars for all documentation
const MAX_PROPS = 50; // Max number of props to include
const MAX_STORIES = 30; // Max number of stories to list

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
 * Truncate text to a maximum length, trying to cut at a sentence boundary
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  // Try to cut at a sentence or paragraph boundary
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline);
  
  if (cutPoint > maxLength * 0.7) {
    return truncated.slice(0, cutPoint + 1) + '\n[...]';
  }
  return truncated + '...';
}

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

  // Basic info - use hierarchyPath for the component name (not the first entry's title)
  const componentName = componentData.hierarchyPath.split('/').pop() || componentData.title;
  sections.push(`# Component: ${componentName}`);
  sections.push(`Slug: ${componentData.slug}`);
  sections.push(`Hierarchy: ${componentData.hierarchyPath}`);

  // Sub-pages (early in prompt so LLM knows the component structure)
  if (componentData.subPages.length > 0) {
    sections.push('\n## Sub-components / Sub-pages');
    sections.push('This component includes the following sub-pages with additional documentation:');
    for (const subPage of componentData.subPages) {
      sections.push(`- ${subPage}`);
    }
  }

  // Props - limit to most important ones
  if (componentData.props.length > 0) {
    sections.push('\n## Props');
    
    // Prioritize required props, then sort by name
    const sortedProps = [...componentData.props].sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    
    const propsToShow = sortedProps.slice(0, MAX_PROPS);
    const hiddenCount = componentData.props.length - propsToShow.length;
    
    for (const prop of propsToShow) {
      const required = prop.required ? '(required)' : '(optional)';
      const defaultVal = prop.defaultValue ? ` [default: ${prop.defaultValue}]` : '';
      const typeDisplay = prop.type !== 'unknown' ? prop.type : '';
      sections.push(`- **${prop.name}** ${required}${typeDisplay ? `: \`${typeDisplay}\`` : ''}${defaultVal}`);
      if (prop.description && prop.description !== prop.type) {
        // Truncate very long descriptions
        const desc = prop.description.length > 200 
          ? prop.description.slice(0, 200) + '...'
          : prop.description;
        sections.push(`  ${desc}`);
      }
    }
    
    if (hiddenCount > 0) {
      sections.push(`\n*(${hiddenCount} additional props not shown)*`);
    }
  }

  // Stories (use cases) - only show args for Default story
  if (componentData.stories.length > 0) {
    sections.push('\n## Stories (Use Cases)');
    
    // Find and show Default story with full args
    const defaultStory = componentData.stories.find(
      (s) => s.name.toLowerCase() === 'default' || s.name.toLowerCase() === 'primary'
    );
    
    if (defaultStory && Object.keys(defaultStory.args).length > 0) {
      sections.push(`\n### Default Story Args`);
      sections.push('```json');
      sections.push(JSON.stringify(defaultStory.args, null, 2));
      sections.push('```');
    }
    
    // List story names (limited)
    sections.push('\n### Available Stories');
    const storiesToShow = componentData.stories.slice(0, MAX_STORIES);
    for (const story of storiesToShow) {
      sections.push(`- ${story.name}`);
    }
    
    const hiddenStories = componentData.stories.length - storiesToShow.length;
    if (hiddenStories > 0) {
      sections.push(`- *(${hiddenStories} more stories...)*`);
    }
  }

  // Default args (component-level defaults) - only if not too large
  if (Object.keys(componentData.defaultArgs).length > 0) {
    const argsJson = JSON.stringify(componentData.defaultArgs, null, 2);
    if (argsJson.length < 2000) {
      sections.push('\n## Default Args (Component Level)');
      sections.push('```json');
      sections.push(argsJson);
      sections.push('```');
    }
  }

  // Documentation content - with size limits
  if (componentData.documentation.length > 0) {
    sections.push('\n## Documentation');
    
    let totalDocsLength = 0;
    for (const doc of componentData.documentation) {
      if (totalDocsLength >= MAX_TOTAL_DOCS) {
        sections.push('\n*[Additional documentation truncated for brevity]*');
        break;
      }
      
      if (doc.textContent) {
        const remainingSpace = MAX_TOTAL_DOCS - totalDocsLength;
        const maxForThis = Math.min(MAX_DOCS_PER_COMPONENT, remainingSpace);
        const truncatedContent = truncateText(doc.textContent, maxForThis);
        sections.push(truncatedContent);
        totalDocsLength += truncatedContent.length;
      }
      
      // Limit code examples
      if (doc.codeExamples.length > 0 && totalDocsLength < MAX_TOTAL_DOCS) {
        sections.push('\n### Code Examples');
        for (const example of doc.codeExamples.slice(0, 2)) {
          if (example.length < 1000) {
            sections.push('```tsx');
            sections.push(example);
            sections.push('```');
            totalDocsLength += example.length;
          }
        }
      }
    }
  }

  sections.push('\n---');
  sections.push('Generate a SKILL.md file for this component following the guidelines in the system prompt.');
  sections.push('IMPORTANT: Start your response with the YAML frontmatter delimiters (---).');

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
