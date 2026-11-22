import jestConfig from '@cocooning/jest-config';

const packages = '<rootDir>/../../../packages';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: 'couple-api',
    ...jestConfig,
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@cocooning/shared-kernel/(.*)$': `${packages}/shared-kernel/src/$1`,
        '^@cocooning/server-infrastructure/(.*)$': `${packages}/server-infrastructure/src/$1`,
        '^@cocooning/couple-shared-kernel/(.*)$': `${packages}/couple/shared-kernel/src/$1`,
        '^@cocooning/couple-contract/(.*)$': `${packages}/couple/contract/src/$1`,
        '^@cocooning/couple-prisma/(.*)$': `${packages}/couple/prisma/src/$1`,
    },
};
