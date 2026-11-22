import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/couple-e2e-shared (integration)',
    ...jestConfig,
    testMatch: ['**/*.integration-spec.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$':
            '<rootDir>/../../shared-kernel/src/$1',
        '^@cocooning/couple-prisma/(.*)$': '<rootDir>/../prisma/src/$1',
    },
    globalSetup: '<rootDir>/src/setup/global-setup.ts',
    globalTeardown: '<rootDir>/src/setup/global-teardown.ts',
};
