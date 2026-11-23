import { config } from '@cocooning/eslint-config';
import { boundariesConfig } from '@cocooning/eslint-config/boundaries';
import globals from 'globals';

/**
 * Root configuration: lints the files that no package config covers (root
 * files, config packages without their own `eslint.config.mjs`), mostly
 * through lint-staged. ESLint uses the config closest to each file, so every
 * package also spreads `boundariesConfig` in its own `eslint.config.mjs`.
 *
 * @type {import("eslint").Linter.Config[]}
 */
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
        ignores: [
            'node_modules/**',
            '.github/**',
            '.husky/**',
            '.claude/**',
            '_brain/**',
            '_malta-blueprint/**',
            '_cocooning-output/**',
            'dist/**',
            'coverage/**',
            '**/__fixtures__/**',
        ],
    },
];
