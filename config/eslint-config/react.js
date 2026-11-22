import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * The ESLint configuration of libraries that use React.
 *
 * Its plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`) are
 * declared in this package's dependencies by the phase that brings the first
 * React package, not before.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactConfig = [
    ...baseConfig,
    pluginReact.configs.flat.recommended,
    {
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
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
        settings: { react: { version: 'detect' } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            // React scope no longer necessary with new JSX transform.
            'react/react-in-jsx-scope': 'off',
            'react/self-closing-comp': 'error',
            'react/destructuring-assignment': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react/no-unused-class-component-methods': 'error',
            'react/no-array-index-key': 'error',
            'react/jsx-key': 'error',
            'react/jsx-no-constructed-context-values': 'error',
        },
    },
];
