import pluginNext from '@next/eslint-plugin-next';
import { reactConfig } from './react.js';

/**
 * The ESLint configuration of Next.js apps: the React configuration plus the
 * Next.js rules. Lint with `eslint .`, never `next lint` (deprecated since
 * Next 15.5).
 *
 * Its plugin (`@next/eslint-plugin-next`) is declared in this package's
 * dependencies by the phase that brings the web app, not before.
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
        },
    },
];
