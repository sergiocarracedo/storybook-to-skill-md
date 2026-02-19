import type { LanguageModelV1 } from 'ai';
import pLimit from 'p-limit';

import type { ComponentData, GenerationResult, SkillgenConfig } from '../types.js';
import { createSkillMeta, hashContents, hashFiles, needsRegeneration, writeSkillMeta } from '../cache/index.js';
import { logExtractedData, logResponse, logSystemPrompt, logUserPrompt } from '../debug/index.js';

import { generateSkillMd } from './generator.js';
import { createModel } from './model-factory.js';
import { buildPrompt, buildSubcomponentsPrompt } from './prompt-builder.js';
import { validateSkillMd } from '../validation/skill-validator.js';
import { writeSkillFile, writeReferenceFile } from '../output/writer.js';

const TOOL_VERSION = '0.1.0';

/**
 * Parse reference files from the generated content
 */
function parseReferenceFiles(content: string, subPages: string[]): Array<{ name: string; content: string }> {
  const refs: Array<{ name: string; content: string }> = [];
  
  // Split by [COMPONENT_START] marker
  const parts = content.split('[COMPONENT_START]');
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    // Extract name from "name: xxx"
    const nameMatch = part.match(/name:\s*(.+?)(?:\n|$)/);
    if (nameMatch?.[1]) {
      const name = nameMatch[1].trim();
      
      // Get content between --- and [COMPONENT_END]
      let contentBody = part;
      
      // Find the --- separator and get everything after it
      const dashIndex = contentBody.indexOf('---');
      if (dashIndex >= 0) {
        contentBody = contentBody.slice(dashIndex + 3);
      }
      
      // Remove [COMPONENT_END] if present
      contentBody = contentBody.replace(/\[COMPONENT_END\]\s*$/, '').trim();
      
      if (contentBody) {
        refs.push({ name, content: contentBody });
      }
    }
  }
  
  // If parsing failed, create empty refs from subPages
  if (refs.length === 0 && subPages.length > 0) {
    for (const subPage of subPages) {
      const name = subPage.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      refs.push({
        name,
        content: '## ' + subPage + '\n\nDocumentation for ' + subPage + '.'
      });
    }
  }
  
  return refs;
}

/**
 * Create a lean SKILL.md with references instead of full content
 */
function createLeanSkillMd(content: string, subPages: string[]): string {
  // Extract frontmatter
  const fmMatch = content.match(/^---\n[\s\S]*?\n---\n/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  let body = content.slice(frontmatter.length);
  
  // Find the sub-components section and truncate after it
  const subComponentsMatch = body.match(/#{1,3}\s+[^#]+Sub-components?[#\s]*/i);
  if (subComponentsMatch) {
    const subStart = body.indexOf(subComponentsMatch[0]);
    // Keep intro and add sub-components list
    const introPart = body.slice(0, Math.max(0, subStart));
    
    // Create sub-components list with references
    const subComponentsList = subPages.map(sub => {
      const name = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return '- **' + sub + '**: See ./references/' + name + '.md';
    }).join('\n');
    
    body = introPart + '\n\n## Sub-components\n\n' + subComponentsList + '\n\n## Related Skills\n\n' +
      subPages.map(sub => {
        const name = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return '- For **' + sub + '**, see ./references/' + name + '.md';
      }).join('\n');
  } else {
    // No sub-components section found, add one at the end
    const subComponentsList = subPages.map(sub => {
      const name = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return '- **' + sub + '**: See ./references/' + name + '.md';
    }).join('\n');
    
    body = body.trim() + '\n\n## Sub-components\n\n' + subComponentsList;
  }
  
  return frontmatter + body;
}

/**
 * Orchestrate generation for all components with concurrency control
 */
export async function orchestrateGeneration(
  components: ComponentData[],
  config: SkillgenConfig,
): Promise<GenerationResult[]> {
  // For dry run, we don't need provider/model/apiKey
  if (!config.dryRun) {
    if (!config.provider) {
      throw new Error('Provider is required. Use -p/--provider or set it in config file.');
    }
    if (!config.model) {
      throw new Error('Model is required. Use -m/--model or set it in config file.');
    }
  }

  // Create the LLM model (only if not dry run)
  let model: LanguageModelV1 | null = null;
  if (!config.dryRun && config.provider && config.model) {
    model = await createModel(config.provider, config.model, config.apiKey);
  }

  // Set up concurrency limiter
  const limit = pLimit(config.concurrency);

  // Create generation tasks
  const tasks = components.map((component) =>
    limit(() => generateComponentSkill(component, model, config)),
  );

  // Execute all tasks
  const results = await Promise.all(tasks);

  return results;
}

/**
 * Generate SKILL.md for a single component
 */
async function generateComponentSkill(
  component: ComponentData,
  model: LanguageModelV1 | null,
  config: SkillgenConfig,
): Promise<GenerationResult> {
  const { slug, title, stories, props } = component;

  try {
    // Determine if we're in server-only mode (no local source files)
    const isServerOnly = component.sourceFiles.length === 0;

    // Calculate hashes based on mode
    let fileHashes: Record<string, string>;

    if (isServerOnly) {
      // Server-only mode: hash the extracted content
      const contents: Record<string, string> = {};

      // Hash documentation content
      for (const doc of component.documentation) {
        contents[doc.filePath] = doc.textContent;
      }

      // Hash props as JSON (they affect the output)
      if (component.props.length > 0) {
        contents['__props__'] = JSON.stringify(component.props);
      }

      // Hash stories as JSON (they affect the output)
      if (component.stories.length > 0) {
        contents['__stories__'] = JSON.stringify(component.stories);
      }

      // Hash subPages
      if (component.subPages.length > 0) {
        contents['__subPages__'] = JSON.stringify(component.subPages);
      }

      fileHashes = hashContents(contents);
    } else {
      // Local mode: hash actual files
      const allFiles = [
        ...component.sourceFiles,
        ...component.documentation.map((d) => d.filePath),
      ];
      fileHashes = hashFiles(allFiles);
    }

    // Check if regeneration is needed
    const { needsRegen, reason } = needsRegeneration(
      config.outputDir,
      slug,
      fileHashes,
      TOOL_VERSION,
      config.force,
    );

    if (!needsRegen) {
      if (config.verbose) {
        console.log(`⏭️  ${title} — unchanged, skipped`);
      }
      return {
        slug,
        status: 'skipped',
        message: 'unchanged',
        storiesCount: stories.length,
        propsCount: props.length,
      };
    }

    if (config.verbose) {
      console.log(`🔄 ${title} — generating (${reason})...`);
    }

    // Dry run - don't actually generate
    if (config.dryRun) {
      // Log extracted data and prompts even in dry run mode (useful for debugging)
      if (config.logPromptsDir) {
        logExtractedData(config.logPromptsDir, slug, component);
        const prompt = buildPrompt(component);
        logSystemPrompt(config.logPromptsDir, slug, prompt.system);
        logUserPrompt(config.logPromptsDir, slug, prompt.user);
      }

      console.log(`🔍 ${title} — would generate (dry run)`);
      return {
        slug,
        status: 'skipped',
        message: 'dry run',
        storiesCount: stories.length,
        propsCount: props.length,
      };
    }

    // Model is required for actual generation
    if (!model) {
      throw new Error('Model not initialized. Provider and model are required for generation.');
    }

    // Log extracted data before building prompt
    if (config.logPromptsDir) {
      logExtractedData(config.logPromptsDir, slug, component);
    }

    // Build prompt
    const prompt = buildPrompt(component);

    // Log prompts
    if (config.logPromptsDir) {
      logSystemPrompt(config.logPromptsDir, slug, prompt.system);
      logUserPrompt(config.logPromptsDir, slug, prompt.user);
    }

    // Generate SKILL.md (main content)
    let skillMdContent = await generateSkillMd(model, prompt);

    // If there are sub-components, generate reference files
    if (component.subPages.length > 0) {
      const subPrompt = buildSubcomponentsPrompt(component);
      
      if (config.logPromptsDir) {
        logUserPrompt(config.logPromptsDir, slug + '-subcomponents', subPrompt.user);
      }

      const subContent = await generateSkillMd(model, subPrompt);
      
      // Parse and write reference files for each sub-component
      const refFiles = parseReferenceFiles(subContent, component.subPages);
      
      // Write reference files
      for (const ref of refFiles) {
        writeReferenceFile(config.outputDir, slug, `${ref.name}.md`, ref.content);
        if (config.verbose) {
          console.log(`  📄 Created reference: references/${ref.name}.md`);
        }
      }

      // Update main SKILL.md to have lean content with references
      skillMdContent = createLeanSkillMd(skillMdContent, component.subPages);

      if (config.logPromptsDir) {
        logResponse(config.logPromptsDir, slug, skillMdContent);
      }
    }

    // Validate the generated content
    const validation = validateSkillMd(skillMdContent);
    if (!validation.valid) {
      console.warn(`⚠️  ${title} — validation errors:`, validation.errors);
      // Try to regenerate with feedback (simplified - just log for now)
    }

    if (validation.warnings.length > 0 && config.verbose) {
      console.log(`⚠️  ${title} — warnings:`, validation.warnings);
    }

    // Write the SKILL.md file
    writeSkillFile(config.outputDir, slug, skillMdContent);

    // Write meta file (provider and model are guaranteed to exist here since we're not in dry run)
    const meta = createSkillMeta(config.provider!, config.model!, fileHashes, TOOL_VERSION);
    writeSkillMeta(config.outputDir, slug, meta);

    console.log(`✅ ${title} — generated (${stories.length} stories, ${props.length} props)`);

    return {
      slug,
      status: 'generated',
      storiesCount: stories.length,
      propsCount: props.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${title} — failed: ${errorMessage}`);

    return {
      slug,
      status: 'failed',
      message: errorMessage,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
}
