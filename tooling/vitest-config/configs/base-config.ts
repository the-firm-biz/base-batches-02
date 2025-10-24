import { defineConfig } from 'vitest/config';

export const baseConfig = defineConfig({
  test: {
    testTimeout: 10000, // 10 second timeout instead of default 5
    coverage: {
      provider: 'istanbul',
      reporter: [
        [
          'json',
          {
            file: `../coverage.json`,
          },
        ],
      ],
      enabled: true,
    },
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
        execArgv: ['--env-file=.env.test'],
      },
      forks: { singleFork: true, execArgv: ['--env-file=.env.test'] },
    },
  },
});
