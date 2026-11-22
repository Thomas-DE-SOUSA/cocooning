import { config } from '../../base.js';
import { createBoundaries } from '../../boundaries.js';

/**
 * Lints this fixture as if it were the repository root, with the real
 * boundaries. Used only by test/boundaries.spec.ts and by hand:
 *   pnpm exec eslint -c __fixtures__/forbidden-import/fixture.eslint.config.mjs __fixtures__/forbidden-import
 * The normal lint ignores `__fixtures__/`.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
    ...config,
    ...createBoundaries({
        rootPath: import.meta.dirname,
        domains: ['couple', 'other'],
    }),
];
