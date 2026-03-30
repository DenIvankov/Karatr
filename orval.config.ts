import { defineConfig } from 'orval';

export default defineConfig({
  karate: {
    output: {
      mode: 'tags-split',
      target: 'src/generated/api.ts',
      schemas: 'src/generated/model',
      client: 'axios',
      mock: false,
      prettier: true,
      tsconfig: './tsconfig.json',
      override: {
        fetch: {
          includeHttpResponseReturnType: true,
        },
      },
    },
    input: {
      target: 'http://localhost:3000/api/docs-json',
      override: {
        transformer: './orval-transformer.js',
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
