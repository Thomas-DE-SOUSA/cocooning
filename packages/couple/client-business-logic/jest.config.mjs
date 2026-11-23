import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/couple-client-business-logic',
    ...jestConfig,
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$':
            '<rootDir>/../../shared-kernel/src/$1',
        '^@cocooning/couple-shared-kernel/(.*)$':
            '<rootDir>/../shared-kernel/src/$1',
        '^@cocooning/couple-contract/(.*)$': '<rootDir>/../contract/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/__tests__/**',
        '!src/testing/**',
        '!src/**/*.spec.ts',
        '!src/**/index.ts',
    ],
    coverageThreshold: {
        global: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
};
