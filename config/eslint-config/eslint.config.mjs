import globals from 'globals';
import { config } from './base.js';
import { boundariesConfig } from './boundaries.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...config,
    ...boundariesConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        // Fixtures break the rules on purpose; test/boundaries.spec.ts lints them.
        ignores: ['__fixtures__/**'],
    },
];
