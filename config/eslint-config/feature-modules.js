import { ENUM_DECLARATION, UNIT_SPECS } from './base.js';

/** Deepest folder level under `src/modules/<module>/` the depth blocks cover. */
const MAX_MODULE_DEPTH = 6;
const VIEW_DEPTH = 2;

const SERVER_ERROR_MESSAGE = {
    selector:
        "CallExpression[callee.object.name='toast'][callee.property.name='error'] MemberExpression[property.name='message']",
    message:
        'A toast describes a server error with describeApiResultError(error, t), never error.message (decision 0010).',
};

const VIEW_HOOK_MESSAGE =
    'A view only calls useTranslation and useForm (decision 0009): move the hook to the container or a hook of the module.';
const VIEW_HOOKS = [
    {
        selector:
            'CallExpression[callee.name=/^use(?!Translation$|Form$)[A-Z]/]',
        message: VIEW_HOOK_MESSAGE,
    },
    {
        selector:
            'CallExpression[callee.property.name=/^use(?!Translation$|Form$)[A-Z]/]',
        message: VIEW_HOOK_MESSAGE,
    },
];

const MODULE_INTERIOR = {
    regex: '^@/modules/[^/]+/.+',
    message:
        'Import another module through its entry point @/modules/<module> only (decision 0011).',
};

const VIEW_IMPORTS = [
    {
        regex: '^next/navigation$',
        message:
            'A view does not navigate (decision 0009): the container calls useRouter.',
    },
    {
        regex: '(^|/)(gateways|actions)(/|$)',
        message:
            'A view imports neither a gateway nor a server action (decision 0009): data comes through its props.',
    },
];

const escapingModule = (depth) => ({
    regex: `^(\\.\\./){${depth + 1},}`,
    message:
        'A module never reaches into another module by a relative path (decision 0011): go through @/modules/<module>.',
});

const filesAtDepth = (depth, leaf) => [
    `**/src/modules/*/${'*/'.repeat(depth)}${leaf}`,
];

const restrictImports = (patterns) => [
    'error',
    { patterns: patterns.map(({ regex, message }) => ({ regex, message })) },
];

const depths = Array.from({ length: MAX_MODULE_DEPTH + 1 }, (_, i) => i);

/**
 * Guardrails of the Feature Module Pattern in a Next.js app (decisions 0009,
 * 0010, 0011). Flat config replaces a rule's options block by block: every
 * block repeats the patterns of the broader blocks before it.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const featureModulesConfig = [
    {
        files: ['**/src/**/*.{ts,tsx}'],
        rules: { 'no-restricted-imports': restrictImports([MODULE_INTERIOR]) },
    },
    {
        files: ['**/src/modules/**/*.{ts,tsx}'],
        ignores: UNIT_SPECS,
        rules: {
            'no-restricted-syntax': [
                'error',
                ENUM_DECLARATION,
                SERVER_ERROR_MESSAGE,
            ],
        },
    },
    ...depths.map((depth) => ({
        files: filesAtDepth(depth, '*.{ts,tsx}'),
        rules: {
            'no-restricted-imports': restrictImports([
                MODULE_INTERIOR,
                escapingModule(depth),
            ]),
        },
    })),
    ...depths
        .filter((depth) => depth >= VIEW_DEPTH)
        .map((depth) => ({
            files: filesAtDepth(depth - VIEW_DEPTH, 'ui/views/*.view.tsx'),
            rules: {
                'no-restricted-syntax': [
                    'error',
                    ENUM_DECLARATION,
                    SERVER_ERROR_MESSAGE,
                    ...VIEW_HOOKS,
                ],
                'no-restricted-imports': restrictImports([
                    MODULE_INTERIOR,
                    escapingModule(depth),
                    ...VIEW_IMPORTS,
                ]),
            },
        })),
];
