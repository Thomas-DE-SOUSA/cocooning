import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: 'couple-web',
    ...jestConfig,
    testEnvironment: 'jsdom',
    testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
        // @t3-oss/env-nextjs ships ESM only: compiled to CommonJS for Jest, Next reads it as is.
        '^.+/@t3-oss/.+\\.js$': [
            'ts-jest',
            { tsconfig: { allowJs: true, module: 'CommonJS' } },
        ],
    },
    transformIgnorePatterns: ['/node_modules/(?!\\.pnpm/@t3-oss|@t3-oss/)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@cocooning/design-system$':
            '<rootDir>/../../../packages/design-system/src/index.ts',
        '^@cocooning/client-infrastructure/(.*)$':
            '<rootDir>/../../../packages/client-infrastructure/src/$1',
        '^@cocooning/couple-shared-kernel/(.*)$':
            '<rootDir>/../../../packages/couple/shared-kernel/src/$1',
        '^@cocooning/couple-client-business-logic/(.*)$':
            '<rootDir>/../../../packages/couple/client-business-logic/src/$1',
        '^@cocooning/couple-contract/(.*)$':
            '<rootDir>/../../../packages/couple/contract/src/$1',
        '^@cocooning/shared-kernel/(.*)$':
            '<rootDir>/../../../packages/shared-kernel/src/$1',
        '^server-only$': '<rootDir>/src/testing/server-only-stub.ts',
        '\\.css$': '<rootDir>/src/testing/style-stub.ts',
    },
};
