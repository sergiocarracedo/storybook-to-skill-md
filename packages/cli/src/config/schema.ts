import { z } from 'zod';

export const providerSchema = z.enum([
  'openai',
  'openai-compatible',
  'anthropic',
  'google',
  'groq',
]);

export const configSchema = z
  .object({
    storybookUrl: z.string().url('storybookUrl must be a valid URL').optional().or(z.literal('')),
    indexFile: z.string().min(1).optional(),
    sourceDir: z.string().min(1, 'sourceDir is required'),
    outputDir: z.string().min(1, 'outputDir is required'),
    provider: providerSchema.optional(),
    model: z.string().min(1).optional(),
    apiKey: z.string().optional(),
    baseUrl: z.string().url('baseUrl must be a valid URL').optional().or(z.literal('')),
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
    concurrency: z.number().int().min(1).max(10).default(3),
    verbose: z.boolean().default(false),
    dryRun: z.boolean().default(false),
    force: z.boolean().default(false),
    logPromptsDir: z.string().optional(),
    promptFile: z.string().optional(),
    timeout: z.number().int().min(1000).default(60000),
    retries: z.number().int().min(0).max(10).default(2),
    fetchRetries: z.number().int().min(1).max(10).default(3),
    extractionConcurrency: z.number().int().min(1).max(10).default(3),
    indexSkill: z.boolean().default(true),
    indexSkillTemplate: z.string().optional(),
  })
  .refine((data) => data.storybookUrl || data.indexFile, {
    message: 'Either storybookUrl or indexFile must be provided',
    path: ['storybookUrl'],
  });

export type ConfigSchema = z.infer<typeof configSchema>;

export function validateConfig(config: unknown): ConfigSchema {
  return configSchema.parse(config);
}

export function safeValidateConfig(config: unknown): {
  success: boolean;
  data?: ConfigSchema;
  error?: z.ZodError;
} {
  const result = configSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
