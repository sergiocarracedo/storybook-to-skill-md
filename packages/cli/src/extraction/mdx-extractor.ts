import type { MdxContent } from '../types.js';
import type { Node } from 'unist';

import fs from 'node:fs';

interface MdastNode extends Node {
  type: string;
  value?: string;
  children?: MdastNode[];
  depth?: number;
  lang?: string | null;
}

/**
 * Extract text content from MDX documentation files
 */
export async function extractMdxContent(mdxFilePath: string): Promise<MdxContent> {
  if (!fs.existsSync(mdxFilePath)) {
    return {
      filePath: mdxFilePath,
      textContent: '',
      codeExamples: [],
      headings: [],
    };
  }

  try {
    const { unified } = await import('unified');
    const remarkParse = (await import('remark-parse')).default;
    const { visit } = await import('unist-util-visit');

    const content = fs.readFileSync(mdxFilePath, 'utf-8');

    // Remove JSX/MDX components for pure markdown parsing
    const cleanedContent = content
      // Remove import statements
      .replace(/^import\s+.*$/gm, '')
      // Remove JSX components (simple heuristic)
      .replace(/<[A-Z][^>]*\/>/g, '')
      .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '')
      // Remove MDX expressions
      .replace(/\{[^}]*\}/g, '');

    const processor = unified().use(remarkParse);
    const tree = processor.parse(cleanedContent);

    const textParts: string[] = [];
    const codeExamples: string[] = [];
    const headings: { level: number; text: string }[] = [];
    let title: string | undefined;

    visit(tree, (node: Node) => {
      const mdastNode = node as MdastNode;
      switch (mdastNode.type) {
        case 'heading': {
          const headingText = extractTextFromNode(mdastNode);
          if (mdastNode.depth !== undefined) {
            headings.push({ level: mdastNode.depth, text: headingText });
            if (mdastNode.depth === 1 && !title) {
              title = headingText;
            }
          }
          textParts.push(headingText);
          break;
        }
        case 'paragraph': {
          const paragraphText = extractTextFromNode(mdastNode);
          if (paragraphText.trim()) {
            textParts.push(paragraphText);
          }
          break;
        }
        case 'code': {
          if (mdastNode.value) {
            codeExamples.push(mdastNode.value);
            // Also add to text for context
            textParts.push(`\`\`\`${mdastNode.lang ?? ''}\n${mdastNode.value}\n\`\`\``);
          }
          break;
        }
        case 'list': {
          const listText = extractTextFromNode(mdastNode);
          if (listText.trim()) {
            textParts.push(listText);
          }
          break;
        }
      }
    });

    return {
      filePath: mdxFilePath,
      ...(title != null ? { title } : {}),
      textContent: textParts.join('\n\n'),
      codeExamples,
      headings,
    };
  } catch (error) {
    console.warn(`Warning: Could not parse MDX from ${mdxFilePath}:`, error);
    // Fallback: return raw content
    const content = fs.readFileSync(mdxFilePath, 'utf-8');
    return {
      filePath: mdxFilePath,
      textContent: content,
      codeExamples: [],
      headings: [],
    };
  }
}

/**
 * Extract plain text from a MDAST node
 */
function extractTextFromNode(node: MdastNode): string {
  if (node.value) {
    return node.value;
  }

  if (node.children) {
    return node.children.map(extractTextFromNode).join('');
  }

  return '';
}

/**
 * Extract MDX content from multiple files
 */
export async function extractMdxContentFromFiles(mdxFiles: string[]): Promise<MdxContent[]> {
  const contents: MdxContent[] = [];

  for (const filePath of mdxFiles) {
    const content = await extractMdxContent(filePath);
    if (content.textContent.trim()) {
      contents.push(content);
    }
  }

  return contents;
}

/**
 * Truncate documentation content to stay within token limits
 */
export function truncateDocumentation(content: MdxContent, maxChars = 1500): MdxContent {
  if (content.textContent.length <= maxChars) {
    return content;
  }

  return {
    ...content,
    textContent: content.textContent.slice(0, maxChars) + '\n\n[...truncated]',
    codeExamples: content.codeExamples.slice(0, 3), // Keep only first 3 code examples
  };
}
