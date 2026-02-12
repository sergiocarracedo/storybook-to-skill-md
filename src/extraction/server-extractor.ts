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

      // Extract props from the args table
      const argsTable = document.querySelector('.docblock-argstable');
      if (argsTable) {
        const rows = argsTable.querySelectorAll('.docblock-argstable-body tr');
        rows.forEach((row) => {
          const nameCell = row.querySelector('td:first-child');
          const descCell = row.querySelector('td:nth-child(2)');
          const defaultCell = row.querySelector('td:nth-child(3)');
          const controlCell = row.querySelector('td:nth-child(4)');

          if (nameCell) {
            const nameSpan = nameCell.querySelector('span');
            const name = nameSpan?.textContent?.trim() || '';
            const required = nameCell.querySelector('[title="Required"]') !== null;

            // Get description
            const descSpan = descCell?.querySelector('div > span');
            const description = descSpan?.textContent?.trim() || '';

            // Get type from summary
            const typeSpan = descCell?.querySelector('.sb-argstableBlock-code, code');
            const type = typeSpan?.textContent?.trim() || 'unknown';

            // Get default value
            const defaultSpan = defaultCell?.querySelector('span, code');
            const defaultValue = defaultSpan?.textContent?.trim();

            // Get control type
            const controlButton = controlCell?.querySelector('button, select, input');
            let controlType = 'text';
            if (controlButton?.tagName === 'SELECT') {
              controlType = 'select';
            } else if (controlButton?.getAttribute('type') === 'checkbox') {
              controlType = 'boolean';
            } else if (controlButton?.getAttribute('type') === 'number') {
              controlType = 'number';
            }

            if (name) {
              const prop: DomExtractionResult['props'][0] = {
                name,
                type,
                required,
                description,
              };
              if (defaultValue && defaultValue !== '-') {
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
              if (defaultValue && defaultValue !== '-') {
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

      // Get full docs content as text
      const docsContainer = document.querySelector('#storybook-docs');
      if (docsContainer) {
        result.docsContent = (docsContainer as HTMLElement).innerText || '';
      }

      return result;
    }, title);

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
            table?: { defaultValue?: { summary?: string } };
          };

          const typeName = at.type?.name || 'unknown';
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

    return meta;
  }
}

/**
 * Create a server extractor instance
 */
export function createServerExtractor(storybookUrl: string): StorybookServerExtractor {
  return new StorybookServerExtractor(storybookUrl);
}
