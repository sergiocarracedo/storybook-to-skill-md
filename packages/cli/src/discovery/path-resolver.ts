import fs from 'node:fs';
import path from 'node:path';

import type { ComponentGroup, ResolvedFile } from '../types.js';

/**
 * Resolve Storybook importPath to absolute file path
 * importPath format: "./src/components/Button.stories.tsx"
 */
export function resolveImportPath(importPath: string, sourceDir: string): string {
  // Remove leading "./" if present
  const cleanPath = importPath.replace(/^\.\//, '');

  // Join with source directory
  return path.resolve(sourceDir, cleanPath);
}

/**
 * Extract component imports from a story file using basic regex/AST-like parsing
 * Looks for patterns like: import { Button } from './Button'
 */
export function extractComponentImports(storyFilePath: string): string[] {
  if (!fs.existsSync(storyFilePath)) {
    return [];
  }

  const content = fs.readFileSync(storyFilePath, 'utf-8');
  const imports: string[] = [];

  // Match: import { Component } from './path'
  // Match: import Component from './path'
  // Match: import * as Component from './path'
  const importRegex =
    /import\s+(?:(?:\{[^}]+\}|\*\s+as\s+\w+|\w+))\s+from\s+['"](\.[^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath && !importPath.includes('.stories') && !importPath.includes('.mdx')) {
      // Resolve relative to story file directory
      const storyDir = path.dirname(storyFilePath);
      let resolvedPath = path.resolve(storyDir, importPath);

      // Try common extensions if no extension provided
      if (!path.extname(resolvedPath)) {
        const extensions = ['.tsx', '.ts', '.jsx', '.js'];
        for (const ext of extensions) {
          const withExt = resolvedPath + ext;
          if (fs.existsSync(withExt)) {
            resolvedPath = withExt;
            break;
          }
        }
        // Also try /index.tsx pattern
        if (!fs.existsSync(resolvedPath)) {
          for (const ext of extensions) {
            const indexPath = path.join(resolvedPath, `index${ext}`);
            if (fs.existsSync(indexPath)) {
              resolvedPath = indexPath;
              break;
            }
          }
        }
      }

      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
        imports.push(resolvedPath);
      }
    }
  }

  return [...new Set(imports)];
}

/**
 * Find component source file by naming convention
 * Button.stories.tsx -> Button.tsx
 */
export function findComponentByConvention(storyFilePath: string): string | null {
  const dir = path.dirname(storyFilePath);
  const baseName = path.basename(storyFilePath);

  // Remove .stories.tsx/.stories.ts suffix
  const componentName = baseName.replace(/\.stories\.(tsx?|jsx?|mdx)$/, '');

  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    const componentPath = path.join(dir, componentName + ext);
    if (fs.existsSync(componentPath) && fs.statSync(componentPath).isFile()) {
      return componentPath;
    }
  }

  // Try index file in subdirectory
  const componentDir = path.join(dir, componentName);
  if (fs.existsSync(componentDir) && fs.statSync(componentDir).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(componentDir, `index${ext}`);
      if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return indexPath;
      }
    }
  }

  return null;
}

/**
 * Resolve files for a component group
 */
export function resolveComponentFiles(
  group: ComponentGroup,
  sourceDir: string,
): ComponentGroup {
  const allEntries = [...group.storyEntries, ...group.docsEntries];
  const storyFiles = new Map<string, ResolvedFile>();
  const mdxFiles = new Map<string, ResolvedFile>();
  const sourceFiles = new Map<string, ResolvedFile>();

  for (const entry of allEntries) {
    const absolutePath = resolveImportPath(entry.importPath, path.dirname(sourceDir));

    if (entry.importPath.endsWith('.mdx')) {
      mdxFiles.set(absolutePath, {
        relativePath: entry.importPath,
        absolutePath,
        type: 'mdx',
      });
    } else if (
      entry.importPath.includes('.stories.') ||
      entry.type === 'story'
    ) {
      storyFiles.set(absolutePath, {
        relativePath: entry.importPath,
        absolutePath,
        type: 'story',
      });

      // Extract component imports via AST parsing
      const componentImports = extractComponentImports(absolutePath);
      for (const componentPath of componentImports) {
        sourceFiles.set(componentPath, {
          relativePath: path.relative(sourceDir, componentPath),
          absolutePath: componentPath,
          type: 'source',
        });
      }

      // Also try naming convention
      const conventionPath = findComponentByConvention(absolutePath);
      if (conventionPath && !sourceFiles.has(conventionPath)) {
        sourceFiles.set(conventionPath, {
          relativePath: path.relative(sourceDir, conventionPath),
          absolutePath: conventionPath,
          type: 'source',
        });
      }
    }
  }

  // Recursively resolve children
  const resolvedChildren = group.children.map((child) =>
    resolveComponentFiles(child, sourceDir),
  );

  return {
    ...group,
    storyFiles: [...storyFiles.values()],
    mdxFiles: [...mdxFiles.values()],
    sourceFiles: [...sourceFiles.values()],
    children: resolvedChildren,
  };
}

/**
 * Resolve all component groups
 */
export function resolveAllComponentFiles(
  groups: ComponentGroup[],
  sourceDir: string,
): ComponentGroup[] {
  return groups.map((group) => resolveComponentFiles(group, sourceDir));
}
