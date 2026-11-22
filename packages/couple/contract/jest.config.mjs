import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/couple-contract',
    ...jestConfig,
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$':
            '<rootDir>/../../shared-kernel/src/$1',
        '^@cocooning/couple-shared-kernel/(.*)$':
            '<rootDir>/../shared-kernel/src/$1',
    },
};
