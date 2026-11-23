import { reactConfig } from '../../react.js';

/**
 * Lints this fixture as a React library. Used only by
 * test/react-code.spec.ts and by hand:
 *   pnpm exec eslint -c __fixtures__/react-code/fixture.eslint.config.mjs __fixtures__/react-code
 * The normal lint ignores `__fixtures__/`.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default reactConfig;
