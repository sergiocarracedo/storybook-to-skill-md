import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'bin/cli.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  target: 'node20',
  sourcemap: true,
  onSuccess: async () => {
    // Copy SYSTEM_PROMPT.md to dist
    copyFileSync(join('src', 'generation', 'SYSTEM_PROMPT.md'), join('dist', 'SYSTEM_PROMPT.md'));
  },
});
