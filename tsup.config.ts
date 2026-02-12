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
  target: 'node22',
  sourcemap: true,
});
