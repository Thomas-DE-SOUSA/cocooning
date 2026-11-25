import jestConfig from '@cocooning/jest-config';

const packages = '<rootDir>/../../../packages';

// Every @cocooning package is read from its src: a dist/ mixed with src/ loads two copies of a class.
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: 'couple-api (e2e)',
    ...jestConfig,
    rootDir: '../..',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.e2e-spec.ts'],
    // A file's first hook starts a real Nest app and sends its first queries: on a busy machine it passed 5 s.
    testTimeout: 15_000,
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$': `${packages}/shared-kernel/src/$1`,
        '^@cocooning/server-infrastructure/(.*)$': `${packages}/server-infrastructure/src/$1`,
        '^@cocooning/couple-shared-kernel/(.*)$': `${packages}/couple/shared-kernel/src/$1`,
        '^@cocooning/couple-contract/(.*)$': `${packages}/couple/contract/src/$1`,
        '^@cocooning/couple-server-business-logic/(.*)$': `${packages}/couple/server-business-logic/src/$1`,
        '^@cocooning/couple-prisma/(.*)$': `${packages}/couple/prisma/src/$1`,
        '^@cocooning/couple-e2e-shared/(.*)$': `${packages}/couple/e2e-shared/src/$1`,
    },
    globalSetup: `${packages}/couple/e2e-shared/src/setup/global-setup.ts`,
    globalTeardown: `${packages}/couple/e2e-shared/src/setup/global-teardown.ts`,
    setupFiles: ['<rootDir>/test/shared/env/test-environment.ts'],
};
