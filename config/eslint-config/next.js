import pluginNext from '@next/eslint-plugin-next';
import { featureModulesConfig } from './feature-modules.js';
import { reactConfig } from './react.js';

const ENV_ACCESS =
    'Read configuration through src/env/ (validated by Zod), never process.env directly (core.md rule 31).';

/**
 * The ESLint configuration of Next.js apps: the React configuration plus the
 * Next.js rules. Lint with `eslint .`, never `next lint` (removed in Next 16).
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextConfig = [
    ...reactConfig,
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
            // App Router only: there is no pages/ directory to check links against.
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
    {
        files: ['**/src/**/*.{ts,tsx}'],
        ignores: ['**/src/env/**'],
        rules: {
            'no-restricted-properties': [
                'error',
                { object: 'process', property: 'env', message: ENV_ACCESS },
            ],
        },
    },
    ...featureModulesConfig,
];
