import type { ComponentData, GenerationResult, SkillgenConfig } from './types.js';
import { ensureLogDir, logExtractionSummary, logStorybookIndex } from './debug/index.js';
import { buildComponentGroups, fetchStorybookIndexWithRetry, resolveAllComponentFiles } from './discovery/index.js';
import { aggregateAllComponentData, createServerExtractor } from './extraction/index.js';
import { orchestrateGeneration } from './generation/index.js';
import { printSummary } from './output/index.js';

/**
 * Main entry point for programmatic usage
 * Generates SKILL.md files from a Storybook project
 */
export async function generate(config: SkillgenConfig): Promise<GenerationResult[]> {
  if (config.verbose) {
    console.log(`Fetching Storybook index from ${config.storybookUrl}...`);
  }

  // Step 1: Fetch Storybook index
  const index = await fetchStorybookIndexWithRetry(config.storybookUrl);

  if (config.verbose) {
    console.log(`Found ${Object.keys(index.entries).length} entries in index.json`);
  }

  // Log the Storybook index if debugging
  if (config.logPromptsDir) {
    ensureLogDir(config.logPromptsDir);
    logStorybookIndex(config.logPromptsDir, index);
  }

  // Step 2: Build component groups
  const groups = buildComponentGroups(index, config.include, config.exclude);

  if (config.verbose) {
    console.log(`Grouped into ${groups.length} components`);
  }

  if (groups.length === 0) {
    console.log('No components found matching the include/exclude patterns');
    return [];
  }

  // Step 3: Resolve file paths
  const resolvedGroups = resolveAllComponentFiles(groups, config.sourceDir);

  // Step 4: Extract and aggregate component data
  if (config.verbose) {
    console.log('Extracting component metadata...');
  }

  const componentData: ComponentData[] = await aggregateAllComponentData(
    resolvedGroups,
    config.sourceDir,
  );

  if (config.verbose) {
    console.log(`Extracted data for ${componentData.length} components`);
  }

  // Log extraction summary if debugging
  if (config.logPromptsDir) {
    logExtractionSummary(config.logPromptsDir, componentData);
  }

  // Step 5: Generate SKILL.md files
  if (config.verbose) {
    console.log(`Generating SKILL.md files (concurrency: ${config.concurrency})...`);
  }

  const results = await orchestrateGeneration(componentData, config);

  // Step 6: Print summary
  printSummary(results);

  return results;
}

/**
 * Server-only generation - extracts all metadata from Storybook server
 * No local source files required
 */
export async function generateServerOnly(config: SkillgenConfig): Promise<GenerationResult[]> {
  if (config.verbose) {
    console.log(`Fetching Storybook index from ${config.storybookUrl}...`);
  }

  // Step 1: Fetch Storybook index
  const index = await fetchStorybookIndexWithRetry(config.storybookUrl);

  if (config.verbose) {
    console.log(`Found ${Object.keys(index.entries).length} entries in index.json`);
  }

  // Log the Storybook index if debugging
  if (config.logPromptsDir) {
    ensureLogDir(config.logPromptsDir);
    logStorybookIndex(config.logPromptsDir, index);
  }

  // Step 2: Build component groups (just for filtering)
  const groups = buildComponentGroups(index, config.include, config.exclude);

  if (config.verbose) {
    console.log(`Grouped into ${groups.length} components`);
  }

  if (groups.length === 0) {
    console.log('No components found matching the include/exclude patterns');
    return [];
  }

  // Step 3: Initialize browser-based extractor
  if (config.verbose) {
    console.log('Initializing browser for metadata extraction...');
  }

  const extractor = createServerExtractor(config.storybookUrl);
  await extractor.init();

  try {
    // Step 4: Extract metadata for each component from the server
    if (config.verbose) {
      console.log('Extracting component metadata from Storybook server...');
    }

    const componentData: ComponentData[] = [];

    for (const group of groups) {
      try {
        if (config.verbose) {
          console.log(`\n  Component: ${group.hierarchyPath}`);
          console.log(`    Stories: ${group.storyEntries.length}`);
          console.log(`    Docs: ${group.docsEntries.length}`);
          console.log(`    Sub-components: ${group.children.length}`);
        }

        // Collect all docs entries to extract from children only (avoid duplicates)
        const childDocsEntries: typeof group.docsEntries = [];
        for (const child of group.children) {
          childDocsEntries.push(...child.docsEntries);
        }

        if (config.verbose) {
          console.log(`    Sources to extract:`);
          // Show main docs
          for (const entry of group.docsEntries) {
            // Only show if it's not a child doc
            const isChildDoc = childDocsEntries.some(c => c.id === entry.id);
            if (!isChildDoc) {
              console.log(`      - [main] ${entry.title}`);
            }
          }
          // Show child docs grouped by child
          for (const child of group.children) {
            if (child.docsEntries.length > 0) {
              for (const entry of child.docsEntries) {
                console.log(`      - [${child.title}] ${entry.title}`);
              }
            }
          }
        }

        // Extract from main docs entry for props/argTypes
        const mainDocsEntry = group.docsEntries[0] || group.storyEntries[0];
        if (!mainDocsEntry) {
          if (config.verbose) {
            console.log(`    Skipping: no docs or story entries found`);
          }
          continue;
        }

        const fullTitle = mainDocsEntry.title;

        // Try API extraction first, fall back to DOM extraction for main component
        let meta = await extractor.extractViaStorybookApi(mainDocsEntry.id, fullTitle);
        if (!meta) {
          meta = await extractor.extractComponentMeta(mainDocsEntry.id, fullTitle);
        }

        // Collect documentation from all docs entries
        const documentation: ComponentData['documentation'] = [];

        // Add main docs content
        if (meta.docsContent) {
          documentation.push({
            filePath: `${config.storybookUrl}/?path=/docs/${mainDocsEntry.id}`,
            textContent: meta.docsContent,
            codeExamples: [],
            headings: [],
          });
        }

        // Extract documentation from child pages
        const subPages: string[] = [];
        for (const child of group.children) {
          subPages.push(child.title);

          for (const childDocsEntry of child.docsEntries) {
            if (config.verbose) {
              console.log(`    Extracting child: ${childDocsEntry.title}`);
            }

            try {
              const childMeta = await extractor.extractComponentMeta(
                childDocsEntry.id,
                childDocsEntry.title
              );

              if (childMeta.docsContent) {
                documentation.push({
                  filePath: `${config.storybookUrl}/?path=/docs/${childDocsEntry.id}`,
                  textContent: `## ${child.title}\n\n${childMeta.docsContent}`,
                  codeExamples: [],
                  headings: [{ level: 2, text: child.title }],
                });
              }

              // Merge props from child if any
              if (childMeta.props.length > 0) {
                for (const prop of childMeta.props) {
                  if (!meta.props.some((p) => p.name === prop.name)) {
                    meta.props.push(prop);
                  }
                }
              }

              // Merge stories from child
              if (childMeta.stories.length > 0) {
                for (const story of childMeta.stories) {
                  meta.stories.push({
                    ...story,
                    name: `${child.title}/${story.name}`,
                  });
                }
              }
            } catch (childError) {
              if (config.verbose) {
                console.warn(`      Warning: Failed to extract child ${childDocsEntry.title}`);
              }
            }
          }
        }

        if (config.verbose) {
          console.log(`    Extracted: ${meta.props.length} props, ${meta.stories.length} stories, ${documentation.length} docs`);
        }

        componentData.push({
          slug: group.slug,
          title: group.hierarchyPath, // Use hierarchy path, not the first entry's title
          hierarchyPath: group.hierarchyPath,
          props: meta.props,
          argTypes: meta.argTypes,
          defaultArgs: meta.defaultArgs,
          stories: meta.stories,
          documentation,
          subPages,
          sourceFiles: [],
        });
      } catch (error) {
        if (config.verbose) {
          console.warn(`  Warning: Failed to extract ${group.hierarchyPath}:`, error);
        }
      }
    }

    if (config.verbose) {
      console.log(`\nExtracted data for ${componentData.length} components`);
    }

    // Log extraction summary if debugging
    if (config.logPromptsDir) {
      logExtractionSummary(config.logPromptsDir, componentData);
    }

    // Step 5: Generate SKILL.md files
    if (config.verbose) {
      console.log(`Generating SKILL.md files (concurrency: ${config.concurrency})...`);
    }

    const results = await orchestrateGeneration(componentData, config);

    // Step 6: Print summary
    printSummary(results);

    return results;
  } finally {
    await extractor.close();
  }
}

// Re-export types and utilities for programmatic usage
export type {
  ComponentData,
  ComponentGroup,
  GenerationResult,
  PropInfo,
  ProviderType,
  SkillgenConfig,
  SkillMeta,
  StoryIndex,
  StoryIndexEntry,
  StoryInfo,
  StoryMeta,
  ValidationResult,
} from './types.js';

export { loadConfig } from './config/index.js';
export { fetchStorybookIndex, fetchStorybookIndexWithRetry } from './discovery/index.js';
export { validateSkillMd } from './validation/index.js';
export { createModel, getDefaultModel } from './generation/index.js';
