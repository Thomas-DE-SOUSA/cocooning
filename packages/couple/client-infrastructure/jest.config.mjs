import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/couple-client-infrastructure',
    ...jestConfig,
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$':
            '<rootDir>/../../shared-kernel/src/$1',
        '^@cocooning/client-infrastructure/(.*)$':
            '<rootDir>/../../client-infrastructure/src/$1',
        '^@cocooning/couple-client-business-logic/(.*)$':
            '<rootDir>/../client-business-logic/src/$1',
        '^@cocooning/couple-contract/(.*)$': '<rootDir>/../contract/src/$1',
    },
};
