import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

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
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSEnumDeclaration',
                    message:
                        'TypeScript enums are forbidden. Use an `as const` object and a union type instead.',
                },
            ],
        },
    },
    {
        ignores: ['dist/**', 'coverage/**'],
    },
];
