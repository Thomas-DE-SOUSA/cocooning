import path from 'node:path';
import boundaries from 'eslint-plugin-boundaries';

/**
 * Domain boundaries of the monorepo, enforced by `eslint-plugin-boundaries`.
 *
 * Every local `eslint.config.mjs` spreads `boundaries` (ESLint uses the
 * config file closest to each linted file, so a rule that lives only in the
 * root config is never applied by `turbo lint`). Element patterns are
 * resolved from the repository root, whatever the working directory.
 */

/** Repository root: this file lives in `config/eslint-config/`. */
export const REPO_ROOT = path.resolve(import.meta.dirname, '../..');

/** Business domains: `packages/<domain>/<layer>` and `apps/<domain>/<app>`. */
export const DOMAINS = ['couple'];

const scoped = (name) => [`@cocooning/${name}`, `@cocooning/${name}/**`];
const domainPackages = (domain) => [
    `@cocooning/${domain}-*`,
    `@cocooning/${domain}-*/**`,
];
const forbid = (sources) => ({ dependency: { source: sources } });

const NEST_AND_PRISMA = [
    '@nestjs/*',
    '@nestjs/*/**',
    '@prisma/*',
    '@prisma/*/**',
    'prisma',
    'prisma/**',
];
const FRONTEND_FRAMEWORKS = [
    'next',
    'next/**',
    'react',
    'react/**',
    'react-dom',
    'react-dom/**',
    'react-native',
    'react-native/**',
    'expo',
    'expo-*',
    'expo/**',
];

/**
 * Builds the boundaries configuration.
 *
 * @param {{ rootPath?: string, domains?: string[] }} [options] `rootPath` is
 *   the folder element patterns are resolved from; `domains` lists the
 *   business domains. Both default to the real repository; tests override
 *   them.
 * @returns {import("eslint").Linter.Config[]}
 */
export function createBoundaries({
    rootPath = REPO_ROOT,
    domains = DOMAINS,
} = {}) {
    const elements = [
        ...domains.flatMap((domain) => [
            {
                type: `${domain}-server-business-logic`,
                pattern: [`packages/${domain}/server-business-logic/**`],
                partialMatch: false,
            },
            {
                type: `${domain}-client-business-logic`,
                pattern: [`packages/${domain}/client-business-logic/**`],
                partialMatch: false,
            },
            {
                type: `${domain}-contract`,
                pattern: [`packages/${domain}/contract/**`],
                partialMatch: false,
            },
            {
                type: `${domain}-packages`,
                pattern: [`packages/${domain}/*/**`],
                partialMatch: false,
            },
            {
                type: `${domain}-apps`,
                pattern: [`apps/${domain}/*/**`],
                partialMatch: false,
            },
        ]),
        {
            type: 'client-infrastructure-shared',
            pattern: ['packages/client-infrastructure/src/shared/**'],
            partialMatch: false,
        },
        {
            type: 'client-infrastructure',
            pattern: ['packages/client-infrastructure/**'],
            partialMatch: false,
        },
        {
            type: 'design-system',
            pattern: ['packages/design-system/**'],
            partialMatch: false,
        },
        {
            type: 'shared',
            pattern: [
                'packages/shared-kernel/**',
                'packages/server-infrastructure/**',
            ],
            partialMatch: false,
        },
    ];

    const anyDomain = domains.flatMap(domainPackages);

    const policies = [
        ...domains.flatMap((domain) => {
            const others = domains.filter((other) => other !== domain);
            return others.length === 0
                ? []
                : [
                      {
                          from: { element: { type: `${domain}-*` } },
                          disallow: forbid(others.flatMap(domainPackages)),
                          message: `The ${domain} domain must not import from another domain (${others.map((other) => `@cocooning/${other}-*`).join(', ')}). Use shared-kernel for cross-domain contracts.`,
                      },
                  ];
        }),
        {
            from: { element: { type: 'shared' } },
            disallow: forbid(anyDomain),
            message:
                'Shared packages (shared-kernel, server-infrastructure) must not import from a domain (@cocooning/<domain>-*). The dependency goes the other way.',
        },
        ...domains.map((domain) => ({
            from: { element: { type: `${domain}-server-business-logic` } },
            disallow: forbid([
                ...NEST_AND_PRISMA,
                '@cocooning/*-prisma',
                '@cocooning/*-prisma/**',
            ]),
            message:
                'server-business-logic is the framework-free domain and application layer: it must not import @nestjs/*, @prisma/*, prisma or a *-prisma package. Declare a port and implement it in an adapter.',
        })),
        ...domains.map((domain) => ({
            from: { element: { type: `${domain}-client-business-logic` } },
            disallow: forbid([
                ...FRONTEND_FRAMEWORKS,
                ...NEST_AND_PRISMA,
                ...scoped('client-infrastructure'),
                '@cocooning/*-client-infrastructure',
                '@cocooning/*-client-infrastructure/**',
                '@cocooning/*-server-business-logic',
                '@cocooning/*-server-business-logic/**',
            ]),
            message:
                'client-business-logic is the framework-free frontend business logic: it must not import Next.js, React, React Native, Expo, @nestjs/*, @prisma/*, an infrastructure package or server-business-logic. Declare a port and implement it in client-infrastructure.',
        })),
        ...domains.map((domain) => ({
            from: { element: { type: `${domain}-contract` } },
            disallow: forbid([
                ...NEST_AND_PRISMA,
                '@cocooning/*-server-business-logic',
                '@cocooning/*-server-business-logic/**',
                '@cocooning/*-prisma',
                '@cocooning/*-prisma/**',
            ]),
            message:
                'contract only holds the HTTP schemas shared by the API and its clients: it must not import server-business-logic, a *-prisma package, @nestjs/* or @prisma/*.',
        })),
        {
            from: { element: { type: 'client-infrastructure' } },
            disallow: forbid(anyDomain),
            message:
                'Client infrastructure is domain-agnostic and must not import from a domain (@cocooning/<domain>-*). Domain-specific adapters belong in @cocooning/<domain>-client-infrastructure.',
        },
        {
            from: { element: { type: 'client-infrastructure-shared' } },
            disallow: forbid([...anyDomain, ...FRONTEND_FRAMEWORKS]),
            message:
                'client-infrastructure/src/shared is framework-agnostic: it must not import Next.js, React, React Native, Expo or a domain package. Framework adapters live in the sibling next/ folder.',
        },
        {
            from: { element: { type: 'design-system' } },
            disallow: forbid([
                ...anyDomain,
                'next',
                'next/**',
                ...scoped('client-infrastructure'),
                ...scoped('server-infrastructure'),
            ]),
            message:
                'Design system must not import Next.js, a domain or an infrastructure package. It must remain a pure UI library.',
        },
    ];

    return [
        {
            plugins: {
                boundaries,
            },
            settings: {
                'boundaries/root-path': rootPath,
                'boundaries/elements': elements,
                'boundaries/ignore': [
                    '**/*.spec.ts',
                    '**/*.spec.tsx',
                    '**/*.test.ts',
                    '**/*.test.tsx',
                    '**/*.e2e-spec.ts',
                    '**/jest.config.*',
                    '**/__tests__/**',
                    '**/test/**',
                ],
            },
            rules: {
                'boundaries/dependencies': [
                    'error',
                    {
                        checkAllOrigins: true,
                        default: 'allow',
                        policies,
                    },
                ],
            },
        },
    ];
}

/** The boundaries of the real repository, spread by every local config. */
export const boundariesConfig = createBoundaries();
