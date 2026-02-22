import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Limits for prompt size to avoid overwhelming the LLM
const MAX_DOCS_PER_COMPONENT = 8000; // Max chars per documentation entry
const MAX_TOTAL_DOCS = 50000; // Max total chars for all documentation
const MAX_STORIES = 100; // Max number of stories to list

/**
 * Load the system prompt from a file (custom or built-in)
 */
function loadSystemPrompt(customPath?: string): string {
  // In production (dist), SYSTEM_PROMPT.md is in the same directory as the compiled code
  // In development, it's in src/generation/
  const defaultPath = join(__dirname, 'SYSTEM_PROMPT.md');
  const promptPath = customPath || defaultPath;
  return readFileSync(promptPath, 'utf-8');
}

/**
 * System prompt for generating SKILL.md files
 * Loaded from SYSTEM_PROMPT.md (or custom file if specified)
 */
export function getSystemPrompt(customPromptFile?: string): string {
  return loadSystemPrompt(customPromptFile);
}

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
  props: Array<{ name: string; type: string; required: boolean; description: string; defaultValue?: string }>;
  argTypes: Record<string, unknown>;
  defaultArgs: Record<string, unknown>;
  stories: Array<{ name: string; args: Record<string, unknown> }>;
  documentation: Array<{ filePath: string; textContent: string }>;
  subPages: string[];
}): string {
  const { title, props, stories, documentation, subPages } = componentData;

  let prompt = `# Component: ${title}\n\n`;

  // Component description from docs (if available)
  if (documentation.length > 0 && documentation[0]?.textContent) {
    const firstParagraph = documentation[0].textContent.split('\n\n')[0];
    if (firstParagraph) {
      prompt += `## Description\n${firstParagraph.trim()}\n\n`;
    }
  }

  // Props (component API)
  if (props.length > 0) {
    prompt += `## Props\n\n`;
    for (const prop of props.slice(0, 50)) { // Limit to 50 props max
      prompt += `- **${prop.name}**`;
      if (prop.required) prompt += ' (required)';
      prompt += `: \`${prop.type}\``;
      if (prop.defaultValue) prompt += ` = ${prop.defaultValue}`;
      if (prop.description) prompt += ` — ${prop.description}`;
      prompt += '\n';
    }
    prompt += '\n';
  }

  // Stories (use cases) - only show args for Default story
  if (stories.length > 0) {
    prompt += `## Stories (${stories.length} total)\n\n`;
    const storiesToShow = stories.slice(0, Math.min(MAX_STORIES, stories.length));
    
    for (const story of storiesToShow) {
      // Find and show Default story with full args
      if (story.name === 'Default' && Object.keys(story.args).length > 0) {
        prompt += `### ${story.name}\n\`\`\`json\n${JSON.stringify(story.args, null, 2)}\n\`\`\`\n\n`;
      } else {
        // Just list other stories by name
        prompt += `- ${story.name}\n`;
      }
    }
    
    if (stories.length > MAX_STORIES) {
      prompt += `\n... and ${stories.length - MAX_STORIES} more stories\n`;
    }
    prompt += '\n';
  }

  // Default args (component-level defaults) - only if not too large
  if (Object.keys(componentData.defaultArgs).length > 0) {
    const argsJson = JSON.stringify(componentData.defaultArgs, null, 2);
    if (argsJson.length < 2000) {
      prompt += `## Default Args\n\`\`\`json\n${argsJson}\n\`\`\`\n\n`;
    }
  }

  // Documentation content
  if (documentation.length > 0) {
    prompt += `## Documentation\n\n`;
    let totalDocsLength = 0;
    
    for (const doc of documentation) {
      if (totalDocsLength >= MAX_TOTAL_DOCS) {
        prompt += `\n[Additional documentation omitted - total docs exceeded ${MAX_TOTAL_DOCS} chars]\n`;
        break;
      }
      
      const content = truncateText(doc.textContent, MAX_DOCS_PER_COMPONENT);
      prompt += `### From ${doc.filePath}\n${content}\n\n`;
      totalDocsLength += content.length;
    }
  }

  // Sub-pages (if any)
  if (subPages.length > 0) {
    prompt += `## Sub-pages\n\n`;
    prompt += `This component has the following sub-pages that should be extracted as separate reference files:\n\n`;
    for (const page of subPages) {
      prompt += `- ${page}\n`;
    }
    prompt += '\n';
  }

  return prompt;
}

/**
 * Build the complete prompt for main SKILL.md generation
 */
export function buildPrompt(
  componentData: Parameters<typeof buildUserPrompt>[0],
  customPromptFile?: string,
): { system: string; user: string } {
  return {
    system: getSystemPrompt(customPromptFile),
    user: buildUserPrompt(componentData),
  };
}

/**
 * Build prompt for generating sub-component reference files
 */
export function buildSubcomponentsPrompt(
  componentData: Parameters<typeof buildUserPrompt>[0],
  customPromptFile?: string,
): { system: string; user: string } {
  const systemPrompt = getSystemPrompt(customPromptFile);
  
  let userPrompt = `# Component: ${componentData.title}\n\n`;
  userPrompt += `Generate separate reference documentation files for each of the following sub-pages.\n\n`;
  userPrompt += `Each reference file should:\n`;
  userPrompt += `1. Start with [COMPONENT_START]\n`;
  userPrompt += `2. Include "name: <filename>" (lowercase, hyphenated)\n`;
  userPrompt += `3. Include a separator: ---\n`;
  userPrompt += `4. Include the markdown content\n`;
  userPrompt += `5. End with [COMPONENT_END]\n\n`;
  
  userPrompt += `## Sub-pages to generate:\n\n`;
  for (const page of componentData.subPages) {
    userPrompt += `- ${page}\n`;
  }
  
  userPrompt += `\n## Source documentation:\n\n`;
  for (const doc of componentData.documentation) {
    const content = truncateText(doc.textContent, MAX_DOCS_PER_COMPONENT);
    userPrompt += `### From ${doc.filePath}\n${content}\n\n`;
  }
  
  return {
    system: systemPrompt,
    user: userPrompt,
  };
}
