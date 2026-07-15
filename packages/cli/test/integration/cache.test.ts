import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { hashFile, hashFiles, hasFilesChanged } from '../../src/cache/hasher.js';
import {
  createSkillMeta,
  needsRegeneration,
  readSkillMeta,
  writeSkillMeta,
} from '../../src/cache/meta.js';

describe('Cache - Hasher', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillgen-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('hashes a file consistently', () => {
    const filePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(filePath, 'hello world');

    const hash1 = hashFile(filePath);
    const hash2 = hashFile(filePath);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });

  it('produces different hashes for different content', () => {
    const file1 = path.join(tempDir, 'test1.txt');
    const file2 = path.join(tempDir, 'test2.txt');
    fs.writeFileSync(file1, 'hello');
    fs.writeFileSync(file2, 'world');

    const hash1 = hashFile(file1);
    const hash2 = hashFile(file2);

    expect(hash1).not.toBe(hash2);
  });

  it('returns empty string for non-existent file', () => {
    const hash = hashFile('/non/existent/file.txt');
    expect(hash).toBe('');
  });

  it('hashes multiple files', () => {
    const file1 = path.join(tempDir, 'test1.txt');
    const file2 = path.join(tempDir, 'test2.txt');
    fs.writeFileSync(file1, 'hello');
    fs.writeFileSync(file2, 'world');

    const hashes = hashFiles([file1, file2]);

    expect(Object.keys(hashes)).toHaveLength(2);
    expect(hashes[file1]).toBeDefined();
    expect(hashes[file2]).toBeDefined();
  });

  it('detects file changes correctly', () => {
    const file1 = path.join(tempDir, 'test.txt');
    fs.writeFileSync(file1, 'original');

    const hashes1 = hashFiles([file1]);

    fs.writeFileSync(file1, 'modified');
    const hashes2 = hashFiles([file1]);

    expect(hasFilesChanged(hashes2, hashes1)).toBe(true);
  });

  it('detects no change when files are identical', () => {
    const file1 = path.join(tempDir, 'test.txt');
    fs.writeFileSync(file1, 'content');

    const hashes1 = hashFiles([file1]);
    const hashes2 = hashFiles([file1]);

    expect(hasFilesChanged(hashes2, hashes1)).toBe(false);
  });
});

describe('Cache - Meta', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillgen-meta-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('writes and reads skill meta', () => {
    const meta = createSkillMeta(
      'openai-compatible',
      'llama-3.3-70b-versatile',
      { '/path/to/file.tsx': 'abc123' },
      '1.0.0',
      'https://llm.example.com/v1',
    );

    writeSkillMeta(tempDir, 'button', meta);
    const read = readSkillMeta(tempDir, 'button');

    expect(read).toBeDefined();
    expect(read?.provider).toBe('openai-compatible');
    expect(read?.model).toBe('llama-3.3-70b-versatile');
    expect(read?.baseUrl).toBe('https://llm.example.com/v1');
    expect(read?.fileHashes['/path/to/file.tsx']).toBe('abc123');
  });

  it('returns null for non-existent meta', () => {
    const read = readSkillMeta(tempDir, 'nonexistent');
    expect(read).toBeNull();
  });

  it('detects need for regeneration when meta is missing', () => {
    const result = needsRegeneration(tempDir, 'button', {}, '1.0.0', false);
    expect(result.needsRegen).toBe(true);
    expect(result.reason).toContain('no existing meta');
  });

  it('detects need for regeneration when force is true', () => {
    const meta = createSkillMeta('openai', 'gpt-4o', {}, '1.0.0');
    writeSkillMeta(tempDir, 'button', meta);

    const result = needsRegeneration(tempDir, 'button', {}, '1.0.0', true);
    expect(result.needsRegen).toBe(true);
    expect(result.reason).toContain('forced');
  });

  it('detects need for regeneration when tool version changes', () => {
    const meta = createSkillMeta('openai', 'gpt-4o', {}, '0.9.0');
    writeSkillMeta(tempDir, 'button', meta);

    const result = needsRegeneration(tempDir, 'button', {}, '1.0.0', false);
    expect(result.needsRegen).toBe(true);
    expect(result.reason).toContain('version');
  });

  it('detects no need for regeneration when unchanged', () => {
    const hashes = { '/path/to/file.tsx': 'abc123' };
    const meta = createSkillMeta('openai', 'gpt-4o', hashes, '1.0.0');
    writeSkillMeta(tempDir, 'button', meta);

    const result = needsRegeneration(tempDir, 'button', hashes, '1.0.0', false);
    expect(result.needsRegen).toBe(false);
  });
});
