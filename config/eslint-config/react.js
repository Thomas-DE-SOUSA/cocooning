import pluginReact from '@eslint-react/eslint-plugin';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { config as baseConfig } from './base.js';

/** Hard ceiling of a React file (decision 0008); the ~125-line target is a review finding. */
const MAX_REACT_FILE_LINES = 200;

/**
 * The ESLint configuration of libraries that use React.
 *
 * `@eslint-react/eslint-plugin` replaces `eslint-plugin-react`, whose 7.x
 * line crashes under ESLint 10 (it calls `context.getFilename`).
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactConfig = [
    ...baseConfig,
    {
        files: ['**/*.{ts,tsx}'],
        ...pluginReact.configs['recommended-typescript'],
        rules: {
            ...pluginReact.configs['recommended-typescript'].rules,
            '@eslint-react/no-array-index-key': 'error',
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
        },
    },
    {
        plugins: {
            'react-hooks': pluginReactHooks,
        },
        rules: {
            ...pluginReactHooks.configs.flat.recommended.rules,
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    {
        files: ['**/*.tsx'],
        rules: {
            'max-lines': [
                'error',
                {
                    max: MAX_REACT_FILE_LINES,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
        },
    },
];
