import config from '@wiretap/eslint-config/node-package';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ['node_modules/**', 'dist/**', 'encore.gen/**', '.encore/**']
  }
];
