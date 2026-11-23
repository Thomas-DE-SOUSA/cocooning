import { config } from '../../base.js';
import { businessLogicConfig } from '../../business-logic.js';

/**
 * Lints this fixture as a business-logic package: the base (enums, automatic
 * mocks in specs) plus the determinism rules. Used only by
 * test/restricted-code.spec.ts and by hand:
 *   pnpm exec eslint -c __fixtures__/restricted-code/fixture.eslint.config.mjs __fixtures__/restricted-code
 * The normal lint ignores `__fixtures__/`.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [...config, ...businessLogicConfig];
