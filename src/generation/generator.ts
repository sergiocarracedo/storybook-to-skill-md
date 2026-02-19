import type { LanguageModelV1 } from 'ai';
import { generateText } from 'ai';

/**
 * Generate SKILL.md content using the LLM
 */
export async function generateSkillMd(
  model: LanguageModelV1,
  prompt: { system: string; user: string },
  maxRetries = 2,
): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const { text } = await generateText({
        model,
        system: prompt.system,
        prompt: prompt.user,
        maxTokens: 16384,
        temperature: 0.3, // Lower temperature for more consistent output
      });

      // Clean up the response - ensure it starts with frontmatter
      const cleanedText = cleanGeneratedContent(text);
      return cleanedText;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error
      if (isRateLimitError(error)) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(`Rate limited, waiting ${waitTime}ms before retry ${attempt}...`);
        await sleep(waitTime);
        continue;
      }

      // For other errors, retry with backoff
      if (attempt <= maxRetries) {
        const waitTime = attempt * 1000;
        console.warn(`Generation failed, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }

  throw lastError ?? new Error('Failed to generate SKILL.md');
}

/**
 * Clean up generated content to ensure valid SKILL.md format
 */
function cleanGeneratedContent(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code fences if the LLM wrapped the output
  if (cleaned.startsWith('```markdown') || cleaned.startsWith('```md')) {
    cleaned = cleaned.replace(/^```(?:markdown|md)\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```yaml')) {
    cleaned = cleaned.replace(/^```yaml\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  // Ensure frontmatter starts correctly
  if (!cleaned.startsWith('---')) {
    // Try to find frontmatter in the content
    const frontmatterMatch = cleaned.match(/---\n[\s\S]*?\n---/);
    if (frontmatterMatch) {
      const frontmatterStart = cleaned.indexOf(frontmatterMatch[0]);
      cleaned = cleaned.slice(frontmatterStart);
    } else {
      // No frontmatter found - this is an error, but we'll let validation handle it
      console.warn('Warning: Generated content does not contain valid frontmatter');
    }
  }

  return cleaned.trim();
}

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('rate_limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    );
  }
  return false;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
