import globals from 'globals';
import tseslint from 'typescript-eslint';
import { config as baseConfig } from './base.js';

/**
 * The ESLint configuration of NestJS apps and server-side TypeScript
 * libraries: the base configuration plus the type-checked rules of
 * typescript-eslint, resolved through the TypeScript project service.
 *
 * `tsconfigRootDir` is the working directory, which is the package folder
 * when turbo runs `eslint .`. A local config may override it with
 * `import.meta.dirname`.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nestConfig = [
    ...baseConfig,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: process.cwd(),
            },
        },
    },
    {
        rules: {
            'no-await-in-loop': 'error',
            'no-constructor-return': 'error',
            'no-duplicate-imports': 'error',
            'no-promise-executor-return': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'no-unused-private-class-members': 'error',
            'no-use-before-define': 'error',
            'no-useless-assignment': 'error',
            'require-atomic-updates': 'error',

            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
        },
    },
    {
        // Jest asymmetric matchers (expect.any, expect.objectContaining) are typed `any`.
        files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.integration-spec.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/unbound-method': 'off',
        },
    },
    {
        // Last, so no typed rule enabled above reaches a plain JavaScript file.
        files: ['**/*.{js,mjs,cjs}'],
        ...tseslint.configs.disableTypeChecked,
    },
];
