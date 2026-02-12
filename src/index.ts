import type { ComponentData, GenerationResult, SkillgenConfig } from './types.js';
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
      // Find the docs entry for this component
      const docsEntry = group.docsEntries[0] || group.storyEntries[0];
      if (!docsEntry) continue;

      try {
        // Use the full title from the Storybook entry (e.g., "Components/Button")
        const fullTitle = docsEntry.title;

        if (config.verbose) {
          console.log(`  Extracting: ${fullTitle}`);
        }

        // Try API extraction first, fall back to DOM extraction
        let meta = await extractor.extractViaStorybookApi(docsEntry.id, fullTitle);
        if (!meta) {
          meta = await extractor.extractComponentMeta(docsEntry.id, fullTitle);
        }

        componentData.push({
          slug: group.slug,
          title: meta.title,
          hierarchyPath: group.hierarchyPath,
          props: meta.props,
          argTypes: meta.argTypes,
          defaultArgs: meta.defaultArgs,
          stories: meta.stories,
          documentation: meta.docsContent
            ? [
                {
                  filePath: 'server',
                  textContent: meta.docsContent,
                  codeExamples: [],
                  headings: [],
                },
              ]
            : [],
          subPages: [],
          sourceFiles: [],
        });
      } catch (error) {
        if (config.verbose) {
          console.warn(`  Warning: Failed to extract ${docsEntry.title}:`, error);
        }
      }
    }

    if (config.verbose) {
      console.log(`Extracted data for ${componentData.length} components`);
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
