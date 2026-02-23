import type { StoryIndex, StoryIndexEntry } from '../../src/types.js';

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildComponentGroups,
  filterEntries,
  groupEntriesByComponent,
  titleToSlug,
} from '../../src/discovery/grouper.js';

const fixturesDir = path.join(import.meta.dirname, '../fixtures');

describe('Discovery - Grouper', () => {
  describe('titleToSlug', () => {
    it('converts simple titles to slugs', () => {
      expect(titleToSlug('Button')).toBe('button');
      expect(titleToSlug('Components/Button')).toBe('button');
    });

    it('handles complex titles with spaces', () => {
      expect(titleToSlug('Components/Data Collection')).toBe('data-collection');
      expect(titleToSlug('Components/My Component Name')).toBe('my-component-name');
    });

    it('handles titles with special characters', () => {
      expect(titleToSlug('Components/Button (Primary)')).toBe('button-primary');
    });
  });

  describe('groupEntriesByComponent', () => {
    it('groups flat components correctly', () => {
      const entries: StoryIndexEntry[] = [
        {
          id: '1',
          title: 'Components/Button',
          name: 'Primary',
          importPath: './Button.stories.tsx',
          tags: [],
          type: 'story',
        },
        {
          id: '2',
          title: 'Components/Button',
          name: 'Secondary',
          importPath: './Button.stories.tsx',
          tags: [],
          type: 'story',
        },
        {
          id: '3',
          title: 'Components/Input',
          name: 'Default',
          importPath: './Input.stories.tsx',
          tags: [],
          type: 'story',
        },
      ];

      const groups = groupEntriesByComponent(entries);

      expect(groups.size).toBe(2);
      expect(groups.get('Components/Button')?.length).toBe(2);
      expect(groups.get('Components/Input')?.length).toBe(1);
    });

    it('groups complex components with sub-pages', () => {
      const entries: StoryIndexEntry[] = [
        {
          id: '1',
          title: 'Components/Data Collection',
          name: 'Default',
          importPath: './DC.stories.tsx',
          tags: [],
          type: 'story',
        },
        {
          id: '2',
          title: 'Components/Data Collection/Actions',
          name: 'Default',
          importPath: './Actions.stories.tsx',
          tags: [],
          type: 'story',
        },
        {
          id: '3',
          title: 'Components/Data Collection/Filters',
          name: 'Default',
          importPath: './Filters.stories.tsx',
          tags: [],
          type: 'story',
        },
      ];

      const groups = groupEntriesByComponent(entries);

      expect(groups.size).toBe(1);
      expect(groups.get('Components/Data Collection')?.length).toBe(3);
    });
  });

  describe('filterEntries', () => {
    const entries: StoryIndexEntry[] = [
      {
        id: '1',
        title: 'Components/Button',
        name: 'Primary',
        importPath: '',
        tags: [],
        type: 'story',
      },
      {
        id: '2',
        title: 'Components/Input',
        name: 'Default',
        importPath: '',
        tags: [],
        type: 'story',
      },
      {
        id: '3',
        title: 'Internal/Debug',
        name: 'Default',
        importPath: '',
        tags: [],
        type: 'story',
      },
    ];

    it('filters by include patterns', () => {
      const filtered = filterEntries(entries, ['Components/**']);
      expect(filtered.length).toBe(2);
    });

    it('filters by exclude patterns', () => {
      const filtered = filterEntries(entries, undefined, ['Internal/**']);
      expect(filtered.length).toBe(2);
    });

    it('combines include and exclude', () => {
      const filtered = filterEntries(entries, ['Components/**'], ['**/Input']);
      expect(filtered.length).toBe(1);
      expect(filtered[0]?.title).toBe('Components/Button');
    });
  });

  describe('buildComponentGroups', () => {
    it('builds groups from fixture index', () => {
      const indexPath = path.join(fixturesDir, 'storybook-index.json');
      const index: StoryIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

      const groups = buildComponentGroups(index);

      expect(groups.length).toBe(2); // Button and Data Collection

      const button = groups.find((g) => g.slug === 'button');
      expect(button).toBeDefined();
      expect(button?.storyEntries.length).toBe(3);

      const dataCollection = groups.find((g) => g.slug === 'data-collection');
      expect(dataCollection).toBeDefined();
      expect(dataCollection?.children.length).toBeGreaterThan(0);
    });

    it('detects sub-pages correctly', () => {
      const indexPath = path.join(fixturesDir, 'storybook-index.json');
      const index: StoryIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

      const groups = buildComponentGroups(index);
      const dataCollection = groups.find((g) => g.slug === 'data-collection');

      expect(dataCollection?.children.some((c) => c.title === 'Actions')).toBe(true);
      expect(dataCollection?.children.some((c) => c.title === 'Filters')).toBe(true);
    });
  });
});
