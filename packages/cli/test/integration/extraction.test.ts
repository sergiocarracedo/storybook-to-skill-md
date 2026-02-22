import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { extractStoryMeta } from '../../src/extraction/story-extractor.js';
import { extractMdxContent } from '../../src/extraction/mdx-extractor.js';

const fixturesDir = path.join(import.meta.dirname, '../fixtures');

describe('Extraction - Story Extractor', () => {
  it('extracts story metadata from Button.stories.tsx', async () => {
    const storyPath = path.join(fixturesDir, 'Button.stories.tsx');
    const meta = await extractStoryMeta(storyPath);

    expect(meta.title).toBe('Components/Button');
    expect(meta.stories.length).toBeGreaterThan(0);

    const primaryStory = meta.stories.find((s) => s.name === 'Primary');
    expect(primaryStory).toBeDefined();
    expect(primaryStory?.args).toHaveProperty('variant', 'primary');
  });

  it('extracts argTypes from story metadata', async () => {
    const storyPath = path.join(fixturesDir, 'Button.stories.tsx');
    const meta = await extractStoryMeta(storyPath);

    expect(meta.argTypes).toHaveProperty('variant');
    expect(meta.argTypes).toHaveProperty('size');
    expect(meta.argTypes).toHaveProperty('disabled');
  });

  it('handles DataCollection.stories.tsx', async () => {
    const storyPath = path.join(fixturesDir, 'DataCollection.stories.tsx');
    const meta = await extractStoryMeta(storyPath);

    expect(meta.title).toBe('Components/Data Collection');
    expect(meta.stories.some((s) => s.name === 'Default')).toBe(true);
    // CSF tools converts camelCase export names to Title Case with spaces
    expect(meta.stories.some((s) => s.name === 'With Selection')).toBe(true);
  });
});

describe('Extraction - MDX Extractor', () => {
  it('extracts content from MDX file', async () => {
    const mdxPath = path.join(fixturesDir, 'DataCollection.mdx');
    const content = await extractMdxContent(mdxPath);

    expect(content.textContent).toContain('Data Collection');
    expect(content.codeExamples.length).toBeGreaterThan(0);
    expect(content.headings.some((h) => h.text === 'When to Use')).toBe(true);
  });

  it('extracts code examples from MDX', async () => {
    const mdxPath = path.join(fixturesDir, 'DataCollection.mdx');
    const content = await extractMdxContent(mdxPath);

    expect(content.codeExamples.some((ex) => ex.includes('DataCollection'))).toBe(true);
  });
});
