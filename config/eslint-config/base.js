import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export const ENUM_DECLARATION = {
    selector: 'TSEnumDeclaration',
    message:
        'TypeScript enums are forbidden. Use an `as const` object and a union type instead.',
};

const AUTOMATIC_MOCK = {
    selector:
        "CallExpression[callee.object.name='jest'][callee.property.name=/^(fn|spyOn|mock)$/]",
    message:
        'Automatic mocks are forbidden outside E2E specs (decision 0001). Write a hand-made fake that extends the port.',
};

/** Unit and integration specs; `*.e2e-spec.ts` keeps its exception (decision 0001). */
export const UNIT_SPECS = [
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.integration-spec.ts',
];

/**
 * The shared ESLint configuration of the repository.
 *
 * No `eslint-plugin-only-warn` here: an `error` must fail the lint, and every
 * `lint` script runs with `--max-warnings=0`.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: {
            turbo: turboPlugin,
        },
        rules: {
            'turbo/no-undeclared-env-vars': 'warn',
        },
    },
    {
        rules: {
            'no-restricted-syntax': ['error', ENUM_DECLARATION],
        },
    },
    {
        // Flat config replaces the options of a rule per block: keep the enum selector.
        files: UNIT_SPECS,
        rules: {
            'no-restricted-syntax': ['error', ENUM_DECLARATION, AUTOMATIC_MOCK],
        },
    },
    {
        ignores: ['dist/**', 'coverage/**'],
    },
];
