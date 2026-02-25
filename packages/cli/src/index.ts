import type { ComponentData, GenerationResult, ProcessSummary, SkillgenConfig } from './types.js';

import pLimit from 'p-limit';

import { ensureLogDir, logStorybookIndex } from './debug/index.js';
import {
  buildComponentGroups,
  getStorybookIndex,
  resolveAllComponentFiles,
} from './discovery/index.js';
import { aggregateComponentData, createServerExtractor } from './extraction/index.js';
import { generateIndexSkill } from './generation/index-skill.js';
import { generateForComponent } from './generation/orchestrator.js';
import { printSummary } from './output/index.js';
import {
  printComponentComplete,
  printComponentFailed,
  printComponentHeader,
  printExtractionItem,
  printExtractionStart,
  printExtractionTotal,
  printGenerationItem,
  printGenerationStart,
  printGenerationTotal,
} from './output/reporter.js';

/**
 * Main entry point for programmatic usage
 * Generates SKILL.md files from a Storybook project
 */
export async function generate(config: SkillgenConfig): Promise<GenerationResult[]> {
  const processStartTime = Date.now();
  const results: GenerationResult[] = [];
  const extractionErrors: string[] = [];

  if (config.verbose) {
    const source = config.indexFile ? `local file ${config.indexFile}` : config.storybookUrl;
    console.log(`Loading Storybook index from ${source}...`);
  }

  // Step 1: Get Storybook index (from local file or URL)
  const index = await getStorybookIndex(config.indexFile, config.storybookUrl, config.fetchRetries);

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

  // Step 4 & 5: For each component, extract and generate (pipeline-per-component)
  for (const group of resolvedGroups) {
    printComponentHeader(group.hierarchyPath);

    const componentStartTime = Date.now();

    try {
      // Extract component data
      printExtractionStart();

      const extractionStart = Date.now();
      const componentData = await aggregateComponentData(group, config.sourceDir);
      const extractionDuration = Date.now() - extractionStart;

      printExtractionItem('Main component', extractionDuration, false);

      // Track subcomponent extractions if verbose
      if (group.children.length > 0) {
        printExtractionItem(`${group.children.length} subcomponents`, 0, true);
      } else {
        printExtractionItem('Sources complete', 0, true);
      }

      printExtractionTotal(extractionDuration);

      // Generate SKILL.md
      printGenerationStart();

      const generationStart = Date.now();
      const result = await generateForComponent(componentData, config);
      const generationDuration = Date.now() - generationStart;

      // Print generation items
      if (result.referenceResults && result.referenceResults.length > 0) {
        for (let i = 0; i < result.referenceResults.length; i++) {
          const ref = result.referenceResults[i];
          const isLast = i === result.referenceResults.length - 1;
          if (ref) {
            printGenerationItem(ref.name, ref.duration, ref.estimatedTokens, isLast);
          }
        }
      } else {
        printGenerationItem('SKILL.md', generationDuration, result.estimatedTokens ?? 0, true);
      }

      const totalGenTokens = result.estimatedTokens ?? 0;
      printGenerationTotal(generationDuration, totalGenTokens);

      const componentDuration = Date.now() - componentStartTime;

      if (result.status === 'failed') {
        printComponentFailed(result.error ?? 'Unknown error');
      } else {
        printComponentComplete(
          componentDuration,
          totalGenTokens,
          result.storiesCount ?? 0,
          result.propsCount ?? 0,
        );
      }

      results.push(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      extractionErrors.push(`${group.hierarchyPath}: ${errorMessage}`);
      printComponentFailed(errorMessage);

      results.push({
        slug: group.slug,
        status: 'failed',
        error: errorMessage,
      });
    }
  }

  // Generate index SKILL.md
  if (config.indexSkill !== false) {
    generateIndexSkill(config.outputDir, results, config);
  }

  // Build process summary
  const totalDuration = Date.now() - processStartTime;
  const totalEstimatedTokens = results.reduce((sum, r) => sum + (r.estimatedTokens ?? 0), 0);

  const summary: ProcessSummary = {
    results,
    totalDuration,
    totalEstimatedTokens,
    extractionErrors,
  };

  // Step 6: Print summary
  printSummary(summary);

  return results;
}

/**
 * Generate SKILL.md files using server-only extraction (browser-based)
 * Used when source files are not available locally
 */
export async function generateServerOnly(config: SkillgenConfig): Promise<GenerationResult[]> {
  const processStartTime = Date.now();
  const results: GenerationResult[] = [];
  const extractionErrors: string[] = [];

  if (config.verbose) {
    const source = config.indexFile ? `local file ${config.indexFile}` : config.storybookUrl;
    console.log(`Loading Storybook index from ${source}...`);
  }

  // Step 1: Get Storybook index (from local file or URL)
  const index = await getStorybookIndex(config.indexFile, config.storybookUrl, config.fetchRetries);

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

  // Step 3: Initialize browser-based extractor (requires storybookUrl)
  if (!config.storybookUrl) {
    throw new Error('storybookUrl is required for server-only mode (browser-based extraction)');
  }

  if (config.verbose) {
    console.log('Initializing browser for metadata extraction...');
  }

  const extractor = createServerExtractor(config.storybookUrl);
  await extractor.init();

  try {
    // Step 4: Extract metadata for each component from the server (pipeline-per-component)
    if (config.verbose) {
      console.log('Extracting component metadata from Storybook server...');
    }

    for (const group of groups) {
      printComponentHeader(group.hierarchyPath);

      const componentStartTime = Date.now();

      try {
        printExtractionStart();

        // Collect all docs entries to extract from children only (avoid duplicates)
        const childDocsEntries: typeof group.docsEntries = [];
        for (const child of group.children) {
          childDocsEntries.push(...child.docsEntries);
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

        const extractionStart = Date.now();

        // Try API extraction first, fall back to DOM extraction for main component
        let meta = await extractor.extractViaStorybookApi(mainDocsEntry.id, fullTitle);
        if (!meta) {
          meta = await extractor.extractComponentMeta(mainDocsEntry.id, fullTitle);
        }

        const mainExtractionDuration = Date.now() - extractionStart;
        printExtractionItem('Main component', mainExtractionDuration, false);

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

        // Extract documentation from child pages in parallel
        const subPages: string[] = [];

        if (group.children.length > 0) {
          const limit = pLimit(config.extractionConcurrency);
          const childExtractionStart = Date.now();

          const childTasks = group.children.flatMap((child) => {
            subPages.push(child.title);

            return child.docsEntries.map((childDocsEntry) =>
              limit(async () => {
                if (config.verbose) {
                  console.log(`    Extracting child: ${childDocsEntry.title}`);
                }

                try {
                  const childMeta = await extractor.extractComponentMeta(
                    childDocsEntry.id,
                    childDocsEntry.title,
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
                  const childErrorMsg =
                    childError instanceof Error ? childError.message : String(childError);
                  extractionErrors.push(`${childDocsEntry.title}: ${childErrorMsg}`);
                  if (config.verbose) {
                    console.warn(`      Warning: Failed to extract child ${childDocsEntry.title}`);
                  }
                }
              }),
            );
          });

          await Promise.all(childTasks);

          const childExtractionDuration = Date.now() - childExtractionStart;
          printExtractionItem(
            `${group.children.length} subcomponents`,
            childExtractionDuration,
            true,
          );
        } else {
          printExtractionItem('Sources complete', 0, true);
        }

        const totalExtractionDuration = Date.now() - extractionStart;
        printExtractionTotal(totalExtractionDuration);

        const componentData: ComponentData = {
          slug: group.slug,
          title: group.hierarchyPath,
          hierarchyPath: group.hierarchyPath,
          props: meta.props,
          argTypes: meta.argTypes,
          defaultArgs: meta.defaultArgs,
          stories: meta.stories,
          documentation,
          subPages,
          sourceFiles: [],
        };

        // Generate SKILL.md
        printGenerationStart();

        const generationStart = Date.now();
        const result = await generateForComponent(componentData, config);
        const generationDuration = Date.now() - generationStart;

        // Print generation items
        if (result.referenceResults && result.referenceResults.length > 0) {
          for (let i = 0; i < result.referenceResults.length; i++) {
            const ref = result.referenceResults[i];
            const isLast = i === result.referenceResults.length - 1;
            if (ref) {
              printGenerationItem(ref.name, ref.duration, ref.estimatedTokens, isLast);
            }
          }
        } else {
          printGenerationItem('SKILL.md', generationDuration, result.estimatedTokens ?? 0, true);
        }

        const totalGenTokens = result.estimatedTokens ?? 0;
        printGenerationTotal(generationDuration, totalGenTokens);

        const componentDuration = Date.now() - componentStartTime;

        if (result.status === 'failed') {
          printComponentFailed(result.error ?? 'Unknown error');
        } else {
          printComponentComplete(
            componentDuration,
            totalGenTokens,
            result.storiesCount ?? 0,
            result.propsCount ?? 0,
          );
        }

        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        extractionErrors.push(`${group.hierarchyPath}: ${errorMessage}`);
        printComponentFailed(errorMessage);

        results.push({
          slug: group.slug,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    // Generate index SKILL.md
    if (config.indexSkill !== false) {
      generateIndexSkill(config.outputDir, results, config);
    }

    // Build process summary
    const totalDuration = Date.now() - processStartTime;
    const totalEstimatedTokens = results.reduce((sum, r) => sum + (r.estimatedTokens ?? 0), 0);

    const summary: ProcessSummary = {
      results,
      totalDuration,
      totalEstimatedTokens,
      extractionErrors,
    };

    // Step 6: Print summary
    printSummary(summary);

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
export { createModel, getDefaultModel, generateIndexSkill } from './generation/index.js';
