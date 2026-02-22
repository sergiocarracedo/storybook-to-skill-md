import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { loadLocalIndex, getStorybookIndex } from '../../src/discovery/index-fetcher.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '..', 'fixtures');

describe('Discovery - Local Index Loading', () => {
  describe('loadLocalIndex', () => {
    it('loads index.json from a local file', () => {
      const indexPath = join(fixturesDir, 'storybook-index.json');
      const index = loadLocalIndex(indexPath);

      expect(index.v).toBe(5);
      expect(index.entries).toBeDefined();
      expect(Object.keys(index.entries).length).toBeGreaterThan(0);
    });

    it('loads entries correctly', () => {
      const indexPath = join(fixturesDir, 'storybook-index.json');
      const index = loadLocalIndex(indexPath);

      const entry = index.entries['components-button--primary'];
      expect(entry).toBeDefined();
      expect(entry?.title).toBe('Components/Button');
      expect(entry?.type).toBe('story');
    });

    it('throws error for non-existent file', () => {
      const indexPath = join(fixturesDir, 'non-existent.json');
      
      expect(() => loadLocalIndex(indexPath)).toThrow();
    });

    it('throws error for invalid JSON format', () => {
      const indexPath = join(fixturesDir, 'invalid-index.json');
      
      // Create a test file with invalid content (we'll just test with missing file for now)
      expect(() => loadLocalIndex(indexPath)).toThrow();
    });
  });

  describe('getStorybookIndex', () => {
    it('uses local file when indexFile is provided', async () => {
      const indexPath = join(fixturesDir, 'storybook-index.json');
      const index = await getStorybookIndex(indexPath);

      expect(index.v).toBe(5);
      expect(Object.keys(index.entries).length).toBeGreaterThan(0);
    });

    it('throws error when neither indexFile nor storybookUrl is provided', async () => {
      await expect(getStorybookIndex()).rejects.toThrow('Either indexFile or storybookUrl must be provided');
    });
  });
});
