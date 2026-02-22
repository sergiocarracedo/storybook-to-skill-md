import type { ComponentData, ComponentGroup, PropInfo } from '../types.js';

import { extractMdxContentFromFiles, truncateDocumentation } from './mdx-extractor.js';
import { extractPropsFromFiles, findTsConfig } from './props-extractor.js';
import { extractStoryMetaFromFiles } from './story-extractor.js';

/**
 * Aggregate all extracted data into a unified ComponentData structure
 */
export async function aggregateComponentData(
  group: ComponentGroup,
  sourceDir: string,
): Promise<ComponentData> {
  // Find tsconfig for better prop extraction
  const tsConfigPath = findTsConfig(sourceDir);

  // Extract props from source files
  const sourceFilePaths = group.sourceFiles.map((f) => f.absolutePath);
  const props = await extractPropsFromFiles(sourceFilePaths, tsConfigPath);

  // Extract story metadata
  const storyFilePaths = group.storyFiles.map((f) => f.absolutePath);
  const storyMeta = await extractStoryMetaFromFiles(storyFilePaths);

  // Extract MDX documentation
  const mdxFilePaths = group.mdxFiles.map((f) => f.absolutePath);
  const mdxContents = await extractMdxContentFromFiles(mdxFilePaths);

  // Truncate documentation to manage token limits
  const truncatedDocs = mdxContents.map((doc) => truncateDocumentation(doc));

  // Merge props with argTypes descriptions (argTypes can enrich prop descriptions)
  const enrichedProps = enrichPropsWithArgTypes(props, storyMeta.argTypes);

  // Get sub-page names from children
  const subPages = group.children.map((child) => child.title);

  return {
    slug: group.slug,
    title: group.title,
    hierarchyPath: group.hierarchyPath,
    props: enrichedProps,
    argTypes: storyMeta.argTypes,
    defaultArgs: storyMeta.args,
    stories: storyMeta.stories,
    documentation: truncatedDocs,
    subPages,
    sourceFiles: sourceFilePaths,
  };
}

/**
 * Enrich props with descriptions from argTypes
 */
function enrichPropsWithArgTypes(
  props: PropInfo[],
  argTypes: ComponentData['argTypes'],
): PropInfo[] {
  return props.map((prop) => {
    const argType = argTypes[prop.name];
    if (argType) {
      const enrichedProp: PropInfo = {
        ...prop,
        description: prop.description || argType.description || '',
      };
      // Only add defaultValue if it's defined (exactOptionalPropertyTypes)
      const defaultVal = prop.defaultValue ?? argType.defaultValue?.toString();
      if (defaultVal !== undefined) {
        enrichedProp.defaultValue = defaultVal;
      }
      return enrichedProp;
    }
    return prop;
  });
}

/**
 * Aggregate data for all component groups
 */
export async function aggregateAllComponentData(
  groups: ComponentGroup[],
  sourceDir: string,
): Promise<ComponentData[]> {
  const results: ComponentData[] = [];

  for (const group of groups) {
    const data = await aggregateComponentData(group, sourceDir);
    results.push(data);

    // Also aggregate children (sub-pages)
    for (const child of group.children) {
      const childData = await aggregateComponentData(child, sourceDir);
      // Mark as sub-page by prefixing slug
      childData.slug = `${group.slug}-${child.slug}`;
      results.push(childData);
    }
  }

  return results;
}
