import { defineConfig } from '@rslib/core';

export const rslibConfig = defineConfig({
  source: {
    entry: {
      index: ['src/**/*.ts', '!src/**/*.{test,bench}.ts'],
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      dts: true,
    },
  ],
  output: {
    target: 'node',
    cleanDistPath: true,
    sourceMap: true,
  },
});
