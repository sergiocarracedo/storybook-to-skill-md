import type { Browser, Page } from 'playwright';

import type { ArgTypeInfo, PropInfo, StoryInfo } from '../types.js';

/**
 * Component metadata extracted from Storybook server
 */
export interface ServerComponentMeta {
  title: string;
  componentName: string;
  description: string;
  props: PropInfo[];
  argTypes: Record<string, ArgTypeInfo>;
  defaultArgs: Record<string, unknown>;
  stories: StoryInfo[];
  docsContent: string;
}

/**
 * Result type for DOM extraction (used inside page.evaluate)
 */
interface DomExtractionResult {
  title: string;
  componentName: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
  }>;
  argTypes: Record<
    string,
    {
      name: string;
      description?: string;
      control?: { type: string; options?: string[] };
      defaultValue?: unknown;
    }
  >;
  defaultArgs: Record<string, unknown>;
  stories: Array<{ name: string; args: Record<string, unknown> }>;
  docsContent: string;
}

/**
 * Result type for Storybook API extraction (used inside page.evaluate)
 */
interface ApiExtractionResult {
  title: string;
  componentName: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
  }>;
  argTypes: Record<
    string,
    {
      name: string;
      description?: string;
      control?: { type: string; options?: string[] };
      defaultValue?: unknown;
    }
  >;
  defaultArgs: Record<string, unknown>;
  stories: Array<{ name: string; args: Record<string, unknown> }>;
  docsContent: string;
}

/**
 * Filter out placeholder/template props that Storybook includes as examples
 * These are documentation scaffolding, not actual component props
 */
function filterPlaceholderProps<T extends { name: string; type?: string; description?: string; defaultValue?: string }>(
  props: T[]
): T[] {
  return props.filter((prop) => {
    // Filter out obvious placeholder props
    if (prop.name === 'propertyName') return false;
    if (prop.type === 'summary') return false;
    if (prop.description === 'This is a short description') return false;
    if (prop.defaultValue === 'defaultValue') return false;
    
    // Filter out props with placeholder-like patterns
    if (/^(propertyName|propName|prop\d+|example|sample)$/i.test(prop.name)) return false;
    
    return true;
  });
}

/**
 * Clean story names to remove mock data names like "John Doe", "Dani Smith"
 * Returns a more meaningful story name based on the story ID/path
 */
function cleanStoryName(name: string): string {
  // Common mock names to replace
  const mockNamePatterns = [
    /^(John|Jane|Bob|Alice|Dani|Eliseo|Maria|James|Mary)\s+[A-Z][a-z]+$/,
    /^[A-Z][a-z]+\s+(Doe|Smith|Williams|Johnson|Brown|Davis|Miller|Wilson|Moore|Taylor)$/,
  ];
  
  for (const pattern of mockNamePatterns) {
    if (pattern.test(name)) {
      // If the name is just a mock name, return a generic "Example"
      return 'Example';
    }
  }
  
  // If the name is a path (e.g., "Visualizations/John Doe"), clean the last part
  if (name.includes('/')) {
    const parts = name.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      const cleanedLast = cleanStoryName(lastPart);
      if (cleanedLast !== lastPart) {
        parts[parts.length - 1] = cleanedLast;
        return parts.join('/');
      }
    }
  }
  
  return name;
}

/**
 * Deduplicate stories by their cleaned names
 * If multiple stories have the same cleaned name, keep the first and number subsequent ones
 */
function deduplicateStories<T extends { name: string }>(stories: T[]): T[] {
  const seenNames = new Map<string, number>();
  
  return stories.map((story) => {
    const cleanedName = cleanStoryName(story.name);
    const count = seenNames.get(cleanedName) || 0;
    seenNames.set(cleanedName, count + 1);
    
    if (count > 0) {
      return { ...story, name: `${cleanedName} ${count + 1}` };
    }
    return { ...story, name: cleanedName };
  });
}

/**
 * Clean extracted documentation content:
 * - Remove repeated table data (mock data from rendered examples)
 * - Remove "Show code" artifacts
 * - Limit overall size
 */
function cleanDocsContent(content: string, maxLength: number = 8000): string {
  if (!content) return '';

  let cleaned = content;

  // Remove common UI artifacts
  cleaned = cleaned.replace(/Show code/g, '');
  cleaned = cleaned.replace(/Hide code/g, '');
  cleaned = cleaned.replace(/Copy/g, '');
  
  // Remove tab characters and normalize whitespace
  cleaned = cleaned.replace(/\t+/g, ' ');
  
  // Remove lines that look like table data (email patterns, repeated short lines)
  const lines = cleaned.split('\n');
  const filteredLines: string[] = [];
  let consecutiveShortLines = 0;
  let lastLineWasData = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines in sequences
    if (!trimmed) {
      if (filteredLines.length > 0 && filteredLines[filteredLines.length - 1] !== '') {
        filteredLines.push('');
      }
      consecutiveShortLines = 0;
      lastLineWasData = false;
      continue;
    }
    
    // Detect table data patterns:
    // - Lines that are just emails
    // - Lines that are just statuses (active, inactive, pending, etc.)
    // - Very short repeated patterns
    const isEmail = /^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed);
    const isStatus = /^(active|inactive|pending|completed|draft|archived)$/i.test(trimmed);
    const looksLikeTableCell = trimmed.length < 50 && !trimmed.endsWith('.') && !trimmed.endsWith(':');
    
    if (isEmail || isStatus) {
      lastLineWasData = true;
      consecutiveShortLines++;
      continue; // Skip these entirely
    }
    
    if (looksLikeTableCell && lastLineWasData) {
      consecutiveShortLines++;
      if (consecutiveShortLines > 3) {
        continue; // Skip if we're in a run of table data
      }
    }
    
    // Keep headings (lines that start with # or are all caps or end with specific patterns)
    const isHeading = /^#{1,6}\s/.test(trimmed) || 
                      /^[A-Z][A-Z\s]+$/.test(trimmed) ||
                      trimmed.startsWith('TABLE OF CONTENTS') ||
                      trimmed.startsWith('STORIES');
    
    // Keep prose (sentences that end with punctuation)
    const isProse = trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?') || trimmed.endsWith(':');
    
    // Keep code-related content
    const isCodeRelated = trimmed.startsWith('```') || trimmed.startsWith('import ') || trimmed.startsWith('const ') || trimmed.startsWith('export ');
    
    if (isHeading || isProse || isCodeRelated || trimmed.length > 60) {
      filteredLines.push(trimmed);
      consecutiveShortLines = 0;
      lastLineWasData = false;
    } else if (!lastLineWasData && trimmed.length > 20) {
      // Keep moderately long lines that aren't following table data
      filteredLines.push(trimmed);
      consecutiveShortLines++;
      lastLineWasData = trimmed.length < 40;
    } else {
      consecutiveShortLines++;
      lastLineWasData = true;
    }
  }
  
  cleaned = filteredLines.join('\n');
  
  // Remove multiple consecutive empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Truncate if still too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
    // Try to cut at a sentence or paragraph boundary
    const lastPeriod = cleaned.lastIndexOf('.');
    const lastNewline = cleaned.lastIndexOf('\n');
    const cutPoint = Math.max(lastPeriod, lastNewline);
    if (cutPoint > maxLength * 0.8) {
      cleaned = cleaned.slice(0, cutPoint + 1);
    }
    cleaned += '\n\n[Content truncated...]';
  }
  
  return cleaned.trim();
}

/**
 * Extract component metadata from a running Storybook server using browser automation
 */
export class StorybookServerExtractor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseUrl: string;

  constructor(storybookUrl: string) {
    this.baseUrl = storybookUrl.replace(/\/$/, '');
  }

  /**
   * Initialize the browser
   */
  async init(): Promise<void> {
    const { chromium } = await import('playwright');
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Extract metadata for a component by its story ID using DOM scraping
   */
  async extractComponentMeta(storyId: string, title: string): Promise<ServerComponentMeta> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    // Navigate to the docs page for this component
    const docsUrl = `${this.baseUrl}/iframe.html?viewMode=docs&id=${storyId}`;
    await this.page.goto(docsUrl, { waitUntil: 'networkidle' });

    // Wait for the docs to load
    await this.page.waitForSelector('#storybook-docs', { timeout: 30000 }).catch(() => null);

    // Give it a moment for React to render
    await this.page.waitForTimeout(2000);

    // Extract all the metadata from the page
    // Note: This function runs in the browser context, so it has access to document/window
    const meta = await this.page.evaluate((componentTitle: string): DomExtractionResult => {
      const result: DomExtractionResult = {
        title: componentTitle,
        componentName: componentTitle.split('/').pop() || componentTitle,
        description: '',
        props: [],
        argTypes: {},
        defaultArgs: {},
        stories: [],
        docsContent: '',
      };

      // Extract description from the first paragraph
      const descEl = document.querySelector('#storybook-docs .sbdocs-description p');
      if (descEl) {
        result.description = descEl.textContent?.trim() || '';
      }

      // Extract props from the args table - improved extraction
      // Try multiple table selectors for different Storybook versions
      const argsTable = document.querySelector('.docblock-argstable') || 
                        document.querySelector('[class*="argstable"]') ||
                        document.querySelector('table');
      
      if (argsTable) {
        const rows = argsTable.querySelectorAll('tbody tr, .docblock-argstable-body tr');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 2) return;

          const nameCell = cells[0];
          const descCell = cells[1];
          const defaultCell = cells[2];
          const controlCell = cells[3];

          if (nameCell) {
            // Get prop name - try multiple selectors
            const nameSpan = nameCell.querySelector('span[class*="name"], span:first-child, code');
            const name = nameSpan?.textContent?.trim() || nameCell.textContent?.trim().split('\n')[0] || '';
            if (!name || name.length > 50) return; // Skip invalid names
            
            const required = nameCell.querySelector('[title="Required"]') !== null ||
                            nameCell.textContent?.includes('*') === true;

            // Get type - look for code elements or type indicators
            let type = 'unknown';
            const typeEl = descCell?.querySelector('code, [class*="type"], .sb-argstableBlock-code');
            if (typeEl) {
              type = typeEl.textContent?.trim() || 'unknown';
            } else {
              // Try to find type in the cell's structure
              const spans = descCell?.querySelectorAll('span');
              spans?.forEach((span) => {
                const text = span.textContent?.trim() || '';
                // Look for type-like patterns
                if (/^(string|number|boolean|object|array|function|union|enum)/i.test(text)) {
                  type = text;
                }
              });
            }
            
            // If type is still unknown or just "union", try to extract from description cell text
            if (type === 'unknown' || type === 'union') {
              const fullCellText = descCell?.textContent?.trim() || '';
              // Look for TypeScript-like type patterns
              const typePatterns = [
                /\b(boolean|string|number|null|undefined)\b/,
                /\b(ReactNode|ReactElement|JSX\.Element)\b/,
                /\b([A-Z][a-zA-Z]+(?:Props|State|Config|Options|Definition|Type))\b/,
                /\b(Array<[^>]+>)\b/,
                /\b(\([^)]+\)\s*=>\s*[^;]+)\b/, // Function type
              ];
              
              for (const pattern of typePatterns) {
                const match = fullCellText.match(pattern);
                if (match && match[1]) {
                  type = match[1];
                  break;
                }
              }
            }

            // Get description - exclude the type from description
            let description = '';
            const descSpan = descCell?.querySelector('div > span:not([class*="type"]), p');
            if (descSpan) {
              description = descSpan.textContent?.trim() || '';
            } else if (descCell) {
              // Get text content but try to exclude the type
              const fullText = descCell.textContent?.trim() || '';
              if (fullText !== type) {
                description = fullText.replace(type, '').trim();
              }
            }
            
            // Clean up description - remove type if it ended up there
            if (description === type || /^(string|number|boolean|object|array|function|union|enum|undefined)$/i.test(description)) {
              description = '';
            }

            // Get default value
            let defaultValue: string | undefined;
            if (defaultCell) {
              const defaultSpan = defaultCell.querySelector('span, code');
              defaultValue = defaultSpan?.textContent?.trim() || defaultCell.textContent?.trim();
              if (defaultValue === '-' || defaultValue === '—' || defaultValue === '') {
                defaultValue = undefined;
              }
            }

            // Get control type
            let controlType = 'text';
            if (controlCell) {
              const controlButton = controlCell.querySelector('button, select, input');
              if (controlButton?.tagName === 'SELECT') {
                controlType = 'select';
              } else if (controlButton?.getAttribute('type') === 'checkbox') {
                controlType = 'boolean';
              } else if (controlButton?.getAttribute('type') === 'number') {
                controlType = 'number';
              }
            }
            
            // Infer type from control type or default value if still unknown
            if (type === 'unknown') {
              if (controlType === 'boolean') {
                type = 'boolean';
              } else if (controlType === 'number') {
                type = 'number';
              } else if (controlType === 'select') {
                type = 'enum';
              } else if (defaultValue) {
                // Try to infer from default value
                if (defaultValue === 'true' || defaultValue === 'false') {
                  type = 'boolean';
                } else if (/^-?\d+(\.\d+)?$/.test(defaultValue)) {
                  type = 'number';
                } else if (defaultValue.startsWith('"') || defaultValue.startsWith("'")) {
                  type = 'string';
                } else if (defaultValue.startsWith('[')) {
                  type = 'array';
                } else if (defaultValue.startsWith('{')) {
                  type = 'object';
                }
              }
            }

            if (name) {
              const prop: DomExtractionResult['props'][0] = {
                name,
                type,
                required,
                description,
              };
              if (defaultValue) {
                prop.defaultValue = defaultValue;
              }
              result.props.push(prop);

              const argType: DomExtractionResult['argTypes'][string] = {
                name,
                control: { type: controlType },
              };
              if (description) {
                argType.description = description;
              }
              if (defaultValue) {
                argType.defaultValue = defaultValue;
              }
              result.argTypes[name] = argType;
            }
          }
        });
      }

      // Extract story names from the sidebar or story blocks
      const storyBlocks = document.querySelectorAll('.docs-story');
      storyBlocks.forEach((block) => {
        const storyTitle = block.querySelector('.sb-story-title, h3');
        if (storyTitle) {
          result.stories.push({
            name: storyTitle.textContent?.trim() || 'Unknown',
            args: {},
          });
        }
      });

      // If no stories found from blocks, try to get from anchors
      if (result.stories.length === 0) {
        const storyAnchors = document.querySelectorAll('#storybook-docs h3[id]');
        storyAnchors.forEach((anchor) => {
          const name = anchor.textContent?.trim();
          if (
            name &&
            !name.toLowerCase().includes('props') &&
            !name.toLowerCase().includes('args')
          ) {
            result.stories.push({ name, args: {} });
          }
        });
      }

      // Extract meaningful documentation content (not raw innerText)
      // Focus on headings, paragraphs, and structured content
      const docsContainer = document.querySelector('#storybook-docs');
      if (docsContainer) {
        const contentParts: string[] = [];
        
        // Get the main description
        const mainDesc = docsContainer.querySelector('.sbdocs-description, .sbdocs-content > p');
        if (mainDesc) {
          contentParts.push(mainDesc.textContent?.trim() || '');
        }
        
        // Get all headings and their following paragraphs
        const headings = docsContainer.querySelectorAll('h1, h2, h3, h4');
        headings.forEach((heading) => {
          const headingText = heading.textContent?.trim();
          if (headingText && !headingText.toLowerCase().includes('show code')) {
            contentParts.push(`\n### ${headingText}`);
            
            // Get the next sibling paragraphs
            let sibling = heading.nextElementSibling;
            let siblingCount = 0;
            while (sibling && siblingCount < 3) {
              if (sibling.tagName === 'P') {
                const text = sibling.textContent?.trim();
                if (text && text.length > 20) {
                  contentParts.push(text);
                }
              } else if (sibling.tagName.startsWith('H')) {
                break; // Stop at next heading
              }
              sibling = sibling.nextElementSibling;
              siblingCount++;
            }
          }
        });
        
        // Get any MDX content blocks
        const mdxBlocks = docsContainer.querySelectorAll('.sbdocs-content, [class*="mdx"]');
        mdxBlocks.forEach((block) => {
          const paragraphs = block.querySelectorAll('p');
          paragraphs.forEach((p) => {
            const text = p.textContent?.trim();
            if (text && text.length > 30 && !contentParts.includes(text)) {
              contentParts.push(text);
            }
          });
        });
        
        result.docsContent = contentParts.filter(Boolean).join('\n\n');
        
        // Fallback to innerText if we got nothing, but with length limit
        if (!result.docsContent || result.docsContent.length < 100) {
          result.docsContent = (docsContainer as HTMLElement).innerText?.slice(0, 10000) || '';
        }
      }

      return result;
    }, title);

    // Clean the docs content after extraction
    meta.docsContent = cleanDocsContent(meta.docsContent);

    // Filter out placeholder/template props
    meta.props = filterPlaceholderProps(meta.props);
    
    // Clean story names (remove mock data names)
    meta.stories = deduplicateStories(meta.stories);

    return meta;
  }

  /**
   * Extract metadata using Storybook's internal API (if available)
   */
  async extractViaStorybookApi(
    storyId: string,
    title: string
  ): Promise<ServerComponentMeta | null> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    // Navigate to the story in the manager frame to access Storybook's API
    const storyUrl = `${this.baseUrl}/?path=/docs/${storyId}`;
    await this.page.goto(storyUrl, { waitUntil: 'networkidle' });

    // Wait for Storybook to load
    await this.page.waitForTimeout(3000);

    // Try to extract data from Storybook's internal API
    // Note: This function runs in the browser context
    const meta = await this.page.evaluate(
      (componentTitle: string): ApiExtractionResult | null => {
        // Access Storybook's API if available
        type StorybookPreview = {
          storyStore?: {
            raw: () => Array<{
              id: string;
              name: string;
              title: string;
              argTypes?: Record<string, unknown>;
              initialArgs?: Record<string, unknown>;
              parameters?: {
                docs?: {
                  description?: { component?: string };
                };
              };
            }>;
          };
        };

        const win = window as typeof window & {
          __STORYBOOK_PREVIEW__?: StorybookPreview;
        };

        const preview = win.__STORYBOOK_PREVIEW__;
        if (!preview?.storyStore) {
          return null;
        }

        const stories = preview.storyStore.raw();
        const componentStories = stories.filter((s) => s.title === componentTitle);

        if (componentStories.length === 0) {
          return null;
        }

        const firstStory = componentStories[0];
        if (!firstStory) {
          return null;
        }
        const argTypes = firstStory.argTypes || {};
        const initialArgs = firstStory.initialArgs || {};
        const description = firstStory.parameters?.docs?.description?.component || '';

        const props: ApiExtractionResult['props'] = [];
        const argTypeRecord: ApiExtractionResult['argTypes'] = {};

        for (const [name, argType] of Object.entries(argTypes)) {
          const at = argType as {
            description?: string;
            type?: { name?: string; required?: boolean };
            control?: { type?: string; options?: string[] };
            table?: { 
              defaultValue?: { summary?: string };
              type?: { summary?: string };
            };
          };

          // Get type from multiple possible locations
          const typeName = at.type?.name || at.table?.type?.summary || 'unknown';
          const required = at.type?.required || false;
          const desc = at.description || '';
          const defaultVal = at.table?.defaultValue?.summary;

          const prop: ApiExtractionResult['props'][0] = {
            name,
            type: typeName,
            required,
            description: desc,
          };
          if (defaultVal) {
            prop.defaultValue = defaultVal;
          }
          props.push(prop);

          const argTypeEntry: ApiExtractionResult['argTypes'][string] = {
            name,
          };
          if (desc) {
            argTypeEntry.description = desc;
          }
          if (at.control) {
            argTypeEntry.control = { type: at.control.type || 'text' };
            if (at.control.options) {
              argTypeEntry.control.options = at.control.options;
            }
          }
          if (defaultVal !== undefined) {
            argTypeEntry.defaultValue = defaultVal;
          }
          argTypeRecord[name] = argTypeEntry;
        }

        return {
          title: componentTitle,
          componentName: componentTitle.split('/').pop() || componentTitle,
          description,
          props,
          argTypes: argTypeRecord,
          defaultArgs: initialArgs as Record<string, unknown>,
          stories: componentStories.map((s) => ({
            name: s.name,
            args: (s.initialArgs || {}) as Record<string, unknown>,
          })),
          docsContent: description,
        };
      },
      title
    );

    // Apply filtering to API-extracted data too
    if (meta) {
      meta.props = filterPlaceholderProps(meta.props);
      meta.stories = deduplicateStories(meta.stories);
    }

    return meta;
  }
}

/**
 * Create a server extractor instance
 */
export function createServerExtractor(storybookUrl: string): StorybookServerExtractor {
  return new StorybookServerExtractor(storybookUrl);
}
