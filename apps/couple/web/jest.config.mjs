import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: 'couple-web',
    ...jestConfig,
    testEnvironment: 'jsdom',
    testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@cocooning/design-system$':
            '<rootDir>/../../../packages/design-system/src/index.ts',
        '^@cocooning/couple-shared-kernel/(.*)$':
            '<rootDir>/../../../packages/couple/shared-kernel/src/$1',
        '\\.css$': '<rootDir>/src/testing/style-stub.ts',
    },
};
