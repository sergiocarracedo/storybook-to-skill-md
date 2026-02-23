import type { ComponentGroup, StoryIndex, StoryIndexEntry } from '../types.js';

/**
 * Convert a title to a slug (e.g., "Components/Data Collection" -> "data-collection")
 */
export function titleToSlug(title: string): string {
  const lastPart = title.split('/').pop() ?? title;
  return lastPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract the root component title from a full title path
 * e.g., "Components/Data Collection/Actions" -> "Components/Data Collection"
 */
export function getRootComponentTitle(title: string, depth = 2): string {
  const parts = title.split('/');
  return parts.slice(0, depth).join('/');
}

/**
 * Check if a title matches any of the glob patterns
 * Supports:
 * - Exact match: "Components/Button"
 * - Wildcard: "Components/*" (single level)
 * - Glob star: "Components/**" (all descendants)
 * - Prefix match: "Components/Data Collection" matches "Components/Data Collection/Actions"
 */
function matchesPatterns(title: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // If pattern doesn't contain wildcards, treat it as a prefix match
    // This allows "Components/Data Collection" to match all children
    if (!pattern.includes('*')) {
      return title === pattern || title.startsWith(pattern + '/');
    }

    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(title);
  });
}

/**
 * Filter entries by include/exclude patterns
 */
export function filterEntries(
  entries: StoryIndexEntry[],
  include?: string[],
  exclude?: string[],
): StoryIndexEntry[] {
  let filtered = entries;

  if (include && include.length > 0) {
    filtered = filtered.filter((entry) => matchesPatterns(entry.title, include));
  }

  if (exclude && exclude.length > 0) {
    filtered = filtered.filter((entry) => !matchesPatterns(entry.title, exclude));
  }

  return filtered;
}

/**
 * Group entries by component title
 */
export function groupEntriesByComponent(
  entries: StoryIndexEntry[],
): Map<string, StoryIndexEntry[]> {
  const groups = new Map<string, StoryIndexEntry[]>();

  for (const entry of entries) {
    // For "Components/Button", group under "Components/Button"
    // For "Components/Data Collection/Actions", group under "Components/Data Collection"
    const rootTitle = getRootComponentTitle(entry.title);

    const existing = groups.get(rootTitle) ?? [];
    existing.push(entry);
    groups.set(rootTitle, existing);
  }

  return groups;
}

/**
 * Build component groups from Storybook index
 */
export function buildComponentGroups(
  index: StoryIndex,
  include?: string[],
  exclude?: string[],
): ComponentGroup[] {
  const entries = Object.values(index.entries);
  const filteredEntries = filterEntries(entries, include, exclude);
  const grouped = groupEntriesByComponent(filteredEntries);

  const components: ComponentGroup[] = [];

  for (const [title, groupEntries] of grouped) {
    const storyEntries = groupEntries.filter((e) => e.type === 'story');
    const docsEntries = groupEntries.filter((e) => e.type === 'docs');

    // Detect sub-pages (entries with deeper hierarchy)
    const subPageTitles = new Set<string>();
    for (const entry of groupEntries) {
      if (entry.title !== title && entry.title.startsWith(title + '/')) {
        const subPagePath = entry.title.slice(title.length + 1);
        const subPageName = subPagePath.split('/')[0];
        if (subPageName) {
          subPageTitles.add(subPageName);
        }
      }
    }

    const component: ComponentGroup = {
      slug: titleToSlug(title),
      title: title.split('/').pop() ?? title,
      hierarchyPath: title,
      storyEntries,
      docsEntries,
      sourceFiles: [],
      storyFiles: [],
      mdxFiles: [],
      children: [],
    };

    // Build children for sub-pages
    for (const subPageTitle of subPageTitles) {
      const subPageFullTitle = `${title}/${subPageTitle}`;
      const subPageEntries = groupEntries.filter(
        (e) => e.title === subPageFullTitle || e.title.startsWith(subPageFullTitle + '/'),
      );

      if (subPageEntries.length > 0) {
        component.children.push({
          slug: titleToSlug(subPageTitle),
          title: subPageTitle,
          hierarchyPath: subPageFullTitle,
          storyEntries: subPageEntries.filter((e) => e.type === 'story'),
          docsEntries: subPageEntries.filter((e) => e.type === 'docs'),
          sourceFiles: [],
          storyFiles: [],
          mdxFiles: [],
          children: [],
        });
      }
    }

    components.push(component);
  }

  return components;
}
