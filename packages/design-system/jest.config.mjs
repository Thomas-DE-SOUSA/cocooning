import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/design-system',
    ...jestConfig,
    testEnvironment: 'jsdom',
    testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
};
