import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      '**/.worktrees/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['game/**/*.js', 'engine/**/*.js', 'data/**/*.js'],
      exclude: [
        'tests/**',
        'game/core/main.js',
      ],
      thresholds: {
        lines: 10,
        functions: 25,
        statements: 10,
        branches: 20,
      },
    },
  },
});
