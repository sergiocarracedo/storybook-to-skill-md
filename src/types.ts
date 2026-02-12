/**
 * Storybook index.json entry (v5 format)
 */
export interface StoryIndexEntry {
  id: string;
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  type: 'story' | 'docs';
}

/**
 * Storybook index.json structure
 */
export interface StoryIndex {
  v: number;
  entries: Record<string, StoryIndexEntry>;
}

/**
 * Grouped component from Storybook entries
 */
export interface ComponentGroup {
  slug: string;
  title: string;
  hierarchyPath: string;
  storyEntries: StoryIndexEntry[];
  docsEntries: StoryIndexEntry[];
  sourceFiles: ResolvedFile[];
  storyFiles: ResolvedFile[];
  mdxFiles: ResolvedFile[];
  children: ComponentGroup[];
}

/**
 * Resolved file with absolute path
 */
export interface ResolvedFile {
  relativePath: string;
  absolutePath: string;
  type: 'source' | 'story' | 'mdx';
}

/**
 * Extracted prop information
 */
export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

/**
 * Extracted argType information from Storybook
 */
export interface ArgTypeInfo {
  name: string;
  description?: string;
  control?: {
    type: string;
    options?: string[];
  };
  defaultValue?: unknown;
  table?: {
    category?: string;
    type?: { summary?: string };
    defaultValue?: { summary?: string };
  };
}

/**
 * Extracted story information
 */
export interface StoryInfo {
  name: string;
  args: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

/**
 * Extracted story metadata from a .stories.tsx file
 */
export interface StoryMeta {
  title?: string;
  component?: string;
  argTypes: Record<string, ArgTypeInfo>;
  args: Record<string, unknown>;
  stories: StoryInfo[];
  tags?: string[];
}

/**
 * Extracted MDX documentation content
 */
export interface MdxContent {
  filePath: string;
  title?: string;
  textContent: string;
  codeExamples: string[];
  headings: { level: number; text: string }[];
}

/**
 * Aggregated component data for LLM generation
 */
export interface ComponentData {
  slug: string;
  title: string;
  hierarchyPath: string;
  props: PropInfo[];
  argTypes: Record<string, ArgTypeInfo>;
  defaultArgs: Record<string, unknown>;
  stories: StoryInfo[];
  documentation: MdxContent[];
  subPages: string[];
  sourceFiles: string[];
}

/**
 * .skill-meta.json structure
 */
export interface SkillMeta {
  generatedAt: string;
  toolVersion: string;
  provider: string;
  model: string;
  fileHashes: Record<string, string>;
}

/**
 * Provider types supported by AI SDK
 */
export type ProviderType = 'openai' | 'anthropic' | 'google';

/**
 * CLI/Config options
 */
export interface SkillgenConfig {
  storybookUrl: string;
  sourceDir: string;
  outputDir: string;
  provider?: ProviderType;
  model?: string;
  apiKey?: string;
  include?: string[];
  exclude?: string[];
  concurrency: number;
  verbose: boolean;
  dryRun: boolean;
  force: boolean;
}

/**
 * Generation result for a single component
 */
export interface GenerationResult {
  slug: string;
  status: 'generated' | 'skipped' | 'failed';
  message?: string;
  storiesCount?: number;
  propsCount?: number;
  error?: Error;
}

/**
 * Validation result for generated SKILL.md
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
