import type { LanguageModelV1 } from 'ai';
import pLimit from 'p-limit';

import type { ComponentData, GenerationResult, SkillgenConfig } from '../types.js';
import { createSkillMeta, hashFiles, needsRegeneration, writeSkillMeta } from '../cache/index.js';

import { generateSkillMd } from './generator.js';
import { createModel } from './model-factory.js';
import { buildPrompt } from './prompt-builder.js';
import { validateSkillMd } from '../validation/skill-validator.js';
import { writeSkillFile } from '../output/writer.js';

const TOOL_VERSION = '0.1.0';

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
    // Get all files involved in this component
    const allFiles = [
      ...component.sourceFiles,
      ...component.documentation.map((d) => d.filePath),
    ];

    // Calculate file hashes
    const fileHashes = hashFiles(allFiles);

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

    // Build prompt
    const prompt = buildPrompt(component);

    // Generate SKILL.md
    const skillMdContent = await generateSkillMd(model, prompt);

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
