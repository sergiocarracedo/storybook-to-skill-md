import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StoryIndex } from '../types.js';

/**
 * Load index.json from a local file
 */
export function loadLocalIndex(indexFilePath: string): StoryIndex {
  try {
    const absolutePath = resolve(indexFilePath);
    const content = readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(content) as StoryIndex;

    if (!data.v || !data.entries) {
      throw new Error('Invalid Storybook index format: missing "v" or "entries" field');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load local index.json from ${indexFilePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch index.json from a Storybook URL
 */
export async function fetchStorybookIndex(storybookUrl: string): Promise<StoryIndex> {
  const url = new URL('/index.json', storybookUrl);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Storybook index from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as StoryIndex;

  if (!data.v || !data.entries) {
    throw new Error('Invalid Storybook index format: missing "v" or "entries" field');
  }

  return data;
}

/**
 * Fetch index.json with retry logic
 */
export async function fetchStorybookIndexWithRetry(
  storybookUrl: string,
  maxRetries = 3,
  delayMs = 1000,
): Promise<StoryIndex> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchStorybookIndex(storybookUrl);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Fetch attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch Storybook index');
}

/**
 * Get Storybook index from either local file or remote URL
 */
export async function getStorybookIndex(
  indexFile?: string,
  storybookUrl?: string,
  fetchRetries = 3,
): Promise<StoryIndex> {
  if (indexFile) {
    return loadLocalIndex(indexFile);
  }
  
  if (storybookUrl) {
    return await fetchStorybookIndexWithRetry(storybookUrl, fetchRetries);
  }
  
  throw new Error('Either indexFile or storybookUrl must be provided');
}
