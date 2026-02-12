import fs from 'node:fs';

import type { ArgTypeInfo, StoryInfo, StoryMeta } from '../types.js';

/**
 * Extract story metadata from a .stories.tsx file using @storybook/csf-tools
 */
export async function extractStoryMeta(storyFilePath: string): Promise<StoryMeta> {
  if (!fs.existsSync(storyFilePath)) {
    return {
      argTypes: {},
      args: {},
      stories: [],
    };
  }

  try {
    const { loadCsf } = await import('@storybook/csf-tools');
    const code = fs.readFileSync(storyFilePath, 'utf-8');

    const csf = loadCsf(code, { makeTitle: (title) => title });
    await csf.parse();

    const meta = csf.meta ?? {};
    const stories: StoryInfo[] = [];
    const argTypes: Record<string, ArgTypeInfo> = {};

    // Extract meta-level argTypes from _metaAnnotations
    const csfAny = csf as unknown as {
      _metaAnnotations?: Record<string, unknown>;
      _storyAnnotations?: Record<string, Record<string, unknown>>;
      stories?: Array<{ name: string; id: string; parameters?: Record<string, unknown> }>;
    };

    const metaAnnotations = csfAny._metaAnnotations ?? {};

    // Parse argTypes from AST (it's an ObjectExpression node)
    const metaArgTypesNode = metaAnnotations.argTypes;
    const parsedArgTypes = parseArgTypesFromAnnotation(metaArgTypesNode);
    for (const [name, argType] of Object.entries(parsedArgTypes)) {
      argTypes[name] = argType;
    }

    // Extract stories from the stories array and combine with annotations
    const storyAnnotations = csfAny._storyAnnotations ?? {};

    if (Array.isArray(csf.stories)) {
      for (const story of csf.stories) {
        const storyName = story.name;
        if (!storyName) continue;

        const annotations = storyAnnotations[storyName] ?? {};

        // Parse args from AST if available (annotations.args is an AST node)
        const argsObj = parseArgsFromAnnotation(annotations.args, code);

        const storyInfo: StoryInfo = {
          name: storyName,
          args: argsObj,
        };
        if (story.parameters) {
          storyInfo.parameters = story.parameters;
        }
        stories.push(storyInfo);

        // Merge story-level argTypes
        const storyArgTypesNode = annotations.argTypes;
        const storyArgTypes = parseArgTypesFromAnnotation(storyArgTypesNode);
        for (const [name, argType] of Object.entries(storyArgTypes)) {
          if (!argTypes[name]) {
            argTypes[name] = argType;
          }
        }
      }
    }

    // Extract meta args from annotations
    const metaArgsAnnotation = metaAnnotations.args;
    const metaArgs = parseArgsFromAnnotation(metaArgsAnnotation, code);

    const result: StoryMeta = {
      argTypes,
      args: metaArgs,
      stories,
    };

    if (meta.title != null) {
      result.title = meta.title;
    }
    if (meta.component != null) {
      result.component = meta.component as string;
    }
    if (meta.tags != null) {
      result.tags = meta.tags;
    }

    return result;
  } catch (error) {
    // Fallback to regex-based extraction if CSF parsing fails
    console.warn(`Warning: Could not parse CSF from ${storyFilePath}, using fallback:`, error);
    return extractStoryMetaFallback(storyFilePath);
  }
}

/**
 * Parse argTypes from AST annotation node
 */
function parseArgTypesFromAnnotation(argTypesNode: unknown): Record<string, ArgTypeInfo> {
  if (!argTypesNode || typeof argTypesNode !== 'object') {
    return {};
  }

  const node = argTypesNode as {
    type?: string;
    properties?: Array<{
      type?: string;
      key?: { type?: string; name?: string; value?: string };
      value?: unknown;
    }>;
  };

  if (node.type !== 'ObjectExpression' || !Array.isArray(node.properties)) {
    return {};
  }

  const result: Record<string, ArgTypeInfo> = {};

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') continue;

    // Get the key name (prop name like 'variant', 'size', etc.)
    let keyName: string | undefined;
    if (prop.key?.type === 'Identifier') {
      keyName = prop.key.name;
    } else if (prop.key?.type === 'StringLiteral') {
      keyName = prop.key.value;
    }

    if (!keyName) continue;

    // Parse the argType value (which is itself an object)
    const argTypeObj = parseArgTypeObject(prop.value);
    result[keyName] = {
      name: keyName,
      ...argTypeObj,
    };
  }

  return result;
}

/**
 * Parse an individual argType object from AST
 */
function parseArgTypeObject(valueNode: unknown): Omit<ArgTypeInfo, 'name'> {
  if (!valueNode || typeof valueNode !== 'object') {
    return {};
  }

  const node = valueNode as {
    type?: string;
    properties?: Array<{
      type?: string;
      key?: { type?: string; name?: string; value?: string };
      value?: unknown;
    }>;
  };

  if (node.type !== 'ObjectExpression' || !Array.isArray(node.properties)) {
    return {};
  }

  const result: Omit<ArgTypeInfo, 'name'> = {};

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') continue;

    let keyName: string | undefined;
    if (prop.key?.type === 'Identifier') {
      keyName = prop.key.name;
    } else if (prop.key?.type === 'StringLiteral') {
      keyName = prop.key.value;
    }

    if (!keyName) continue;

    switch (keyName) {
      case 'description': {
        const val = parseValueNode(prop.value);
        if (typeof val === 'string') {
          result.description = val;
        }
        break;
      }
      case 'control': {
        const controlObj = parseControlObject(prop.value);
        if (controlObj) {
          result.control = controlObj;
        }
        break;
      }
      case 'defaultValue': {
        result.defaultValue = parseValueNode(prop.value);
        break;
      }
      case 'table': {
        const tableObj = parseTableObject(prop.value);
        if (tableObj) {
          result.table = tableObj;
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Parse control object from AST
 */
function parseControlObject(
  valueNode: unknown,
): NonNullable<ArgTypeInfo['control']> | undefined {
  if (!valueNode || typeof valueNode !== 'object') {
    return undefined;
  }

  const node = valueNode as {
    type?: string;
    properties?: Array<{
      type?: string;
      key?: { type?: string; name?: string; value?: string };
      value?: unknown;
    }>;
  };

  if (node.type !== 'ObjectExpression' || !Array.isArray(node.properties)) {
    return undefined;
  }

  let type: string | undefined;
  let options: string[] | undefined;

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') continue;

    let keyName: string | undefined;
    if (prop.key?.type === 'Identifier') {
      keyName = prop.key.name;
    } else if (prop.key?.type === 'StringLiteral') {
      keyName = prop.key.value;
    }

    if (keyName === 'type') {
      const val = parseValueNode(prop.value);
      if (typeof val === 'string') {
        type = val;
      }
    } else if (keyName === 'options') {
      const val = parseValueNode(prop.value);
      if (Array.isArray(val)) {
        options = val.filter((v): v is string => typeof v === 'string');
      }
    }
  }

  if (!type) return undefined;

  const result: NonNullable<ArgTypeInfo['control']> = { type };
  if (options) {
    result.options = options;
  }
  return result;
}

/**
 * Parse table object from AST
 */
function parseTableObject(
  valueNode: unknown,
): NonNullable<ArgTypeInfo['table']> | undefined {
  if (!valueNode || typeof valueNode !== 'object') {
    return undefined;
  }

  const node = valueNode as {
    type?: string;
    properties?: Array<{
      type?: string;
      key?: { type?: string; name?: string; value?: string };
      value?: unknown;
    }>;
  };

  if (node.type !== 'ObjectExpression' || !Array.isArray(node.properties)) {
    return undefined;
  }

  const result: NonNullable<ArgTypeInfo['table']> = {};

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') continue;

    let keyName: string | undefined;
    if (prop.key?.type === 'Identifier') {
      keyName = prop.key.name;
    } else if (prop.key?.type === 'StringLiteral') {
      keyName = prop.key.value;
    }

    if (keyName === 'category') {
      const val = parseValueNode(prop.value);
      if (typeof val === 'string') {
        result.category = val;
      }
    }
    // Add type and defaultValue parsing if needed
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Parse args from AST annotation node to actual values
 * This is a simplified parser that handles common cases
 */
function parseArgsFromAnnotation(
  argsNode: unknown,
  _sourceCode: string,
): Record<string, unknown> {
  if (!argsNode || typeof argsNode !== 'object') {
    return {};
  }

  const node = argsNode as {
    type?: string;
    properties?: Array<{
      type?: string;
      key?: { type?: string; name?: string; value?: string };
      value?: { type?: string; value?: unknown; name?: string };
    }>;
  };

  if (node.type !== 'ObjectExpression' || !Array.isArray(node.properties)) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const prop of node.properties) {
    if (prop.type !== 'ObjectProperty') continue;

    // Get the key name
    let keyName: string | undefined;
    if (prop.key?.type === 'Identifier') {
      keyName = prop.key.name;
    } else if (prop.key?.type === 'StringLiteral') {
      keyName = prop.key.value;
    }

    if (!keyName) continue;

    // Get the value
    const value = parseValueNode(prop.value);
    if (value !== undefined) {
      result[keyName] = value;
    }
  }

  return result;
}

/**
 * Parse a value node from the AST
 */
function parseValueNode(
  valueNode: unknown,
): unknown {
  if (!valueNode || typeof valueNode !== 'object') {
    return undefined;
  }

  const node = valueNode as {
    type?: string;
    value?: unknown;
    name?: string;
    elements?: unknown[];
    properties?: unknown[];
  };

  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'Identifier':
      // Handle special identifiers
      if (node.name === 'undefined') return undefined;
      if (node.name === 'true') return true;
      if (node.name === 'false') return false;
      // Return the identifier name as a reference
      return `[${node.name}]`;
    case 'ArrayExpression':
      if (Array.isArray(node.elements)) {
        return node.elements.map(parseValueNode);
      }
      return [];
    case 'ObjectExpression':
      // For nested objects, just indicate it's an object
      return '[Object]';
    default:
      return undefined;
  }
}

/**
 * Fallback regex-based story extraction
 */
function extractStoryMetaFallback(storyFilePath: string): StoryMeta {
  const code = fs.readFileSync(storyFilePath, 'utf-8');
  const stories: StoryInfo[] = [];

  // Extract exported story names (export const Primary = ...)
  const storyExportRegex = /export\s+const\s+(\w+)\s*[=:]/g;
  let match;

  while ((match = storyExportRegex.exec(code)) !== null) {
    const storyName = match[1];
    if (storyName && storyName !== 'default' && storyName !== 'meta') {
      stories.push({
        name: storyName,
        args: {},
      });
    }
  }

  // Try to extract title from meta
  const titleMatch = code.match(/title:\s*['"]([^'"]+)['"]/);
  const title = titleMatch?.[1];

  const result: StoryMeta = {
    argTypes: {},
    args: {},
    stories,
  };

  if (title != null) {
    result.title = title;
  }

  return result;
}

/**
 * Extract story metadata from multiple story files
 */
export async function extractStoryMetaFromFiles(storyFiles: string[]): Promise<StoryMeta> {
  const combined: StoryMeta = {
    argTypes: {},
    args: {},
    stories: [],
  };

  for (const filePath of storyFiles) {
    const meta = await extractStoryMeta(filePath);

    // Merge argTypes
    for (const [name, argType] of Object.entries(meta.argTypes)) {
      if (!combined.argTypes[name]) {
        combined.argTypes[name] = argType;
      }
    }

    // Merge args (later files override earlier)
    combined.args = { ...combined.args, ...meta.args };

    // Add stories
    combined.stories.push(...meta.stories);

    // Use first title/component found
    if (!combined.title && meta.title) {
      combined.title = meta.title;
    }
    if (!combined.component && meta.component) {
      combined.component = meta.component;
    }
  }

  return combined;
}
