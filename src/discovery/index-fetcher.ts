import type { StoryIndex } from '../types.js';

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

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch Storybook index');
}
