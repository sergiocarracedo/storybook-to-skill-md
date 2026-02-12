import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * Calculate SHA-256 hash of a file
 */
export function hashFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Calculate hashes for multiple files
 */
export function hashFiles(filePaths: string[]): Record<string, string> {
  const hashes: Record<string, string> = {};

  // Sort paths for consistent ordering
  const sortedPaths = [...filePaths].sort();

  for (const filePath of sortedPaths) {
    const hash = hashFile(filePath);
    if (hash) {
      hashes[filePath] = hash;
    }
  }

  return hashes;
}

/**
 * Calculate a combined hash for all files
 */
export function calculateCombinedHash(filePaths: string[]): string {
  const hashes = hashFiles(filePaths);
  const combinedContent = Object.entries(hashes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, hash]) => `${path}:${hash}`)
    .join('\n');

  return crypto.createHash('sha256').update(combinedContent).digest('hex');
}

/**
 * Check if any files have changed by comparing hashes
 */
export function hasFilesChanged(
  currentHashes: Record<string, string>,
  previousHashes: Record<string, string>,
): boolean {
  const currentKeys = Object.keys(currentHashes).sort();
  const previousKeys = Object.keys(previousHashes).sort();

  // Different number of files
  if (currentKeys.length !== previousKeys.length) {
    return true;
  }

  // Different file paths
  if (JSON.stringify(currentKeys) !== JSON.stringify(previousKeys)) {
    return true;
  }

  // Check each hash
  for (const key of currentKeys) {
    if (currentHashes[key] !== previousHashes[key]) {
      return true;
    }
  }

  return false;
}
