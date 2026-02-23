import type { PropInfo } from '../types.js';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Extract props from a React component using react-docgen-typescript
 */
export async function extractProps(
  componentFilePath: string,
  tsConfigPath?: string,
): Promise<PropInfo[]> {
  if (!fs.existsSync(componentFilePath)) {
    return [];
  }

  try {
    // Dynamic import to handle the case where react-docgen-typescript might not be available
    const { withCustomConfig, withDefaultConfig } = await import('react-docgen-typescript');

    const parser = tsConfigPath
      ? withCustomConfig(tsConfigPath, {
          savePropValueAsString: true,
          shouldExtractLiteralValuesFromEnum: true,
          shouldRemoveUndefinedFromOptional: true,
          propFilter: (prop) => {
            // Filter out HTML/React internal props unless explicitly defined
            if (prop.declarations && prop.declarations.length > 0) {
              const hasPropAdditionalDescription = prop.declarations.find((declaration) => {
                return !declaration.fileName.includes('node_modules');
              });
              return Boolean(hasPropAdditionalDescription);
            }
            return true;
          },
        })
      : withDefaultConfig({
          savePropValueAsString: true,
          shouldExtractLiteralValuesFromEnum: true,
          shouldRemoveUndefinedFromOptional: true,
        });

    const docs = parser.parse(componentFilePath);

    if (docs.length === 0) {
      return [];
    }

    // Get the first (main) component's props
    const mainComponent = docs[0];
    if (!mainComponent) {
      return [];
    }

    const props: PropInfo[] = [];

    for (const [name, propDef] of Object.entries(mainComponent.props)) {
      props.push({
        name,
        type: propDef.type?.name ?? 'unknown',
        required: propDef.required,
        description: propDef.description ?? '',
        defaultValue: propDef.defaultValue?.value,
      });
    }

    return props;
  } catch (error) {
    // Log error but don't fail - component might not have extractable props
    console.warn(`Warning: Could not extract props from ${componentFilePath}:`, error);
    return [];
  }
}

/**
 * Find tsconfig.json in the project
 */
export function findTsConfig(sourceDir: string): string | undefined {
  let currentDir = path.resolve(sourceDir);

  while (currentDir !== path.dirname(currentDir)) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return undefined;
}

/**
 * Extract props from multiple source files
 */
export async function extractPropsFromFiles(
  sourceFiles: string[],
  tsConfigPath?: string,
): Promise<PropInfo[]> {
  const allProps: PropInfo[] = [];
  const seenProps = new Set<string>();

  for (const filePath of sourceFiles) {
    const props = await extractProps(filePath, tsConfigPath);
    for (const prop of props) {
      if (!seenProps.has(prop.name)) {
        seenProps.add(prop.name);
        allProps.push(prop);
      }
    }
  }

  return allProps;
}
