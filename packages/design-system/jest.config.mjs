import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/design-system',
    ...jestConfig,
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/src/testing/resize-observer-stub.ts'],
    testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
};
