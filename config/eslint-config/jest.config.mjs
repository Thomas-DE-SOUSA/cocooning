import jestConfig from '@cocooning/jest-config';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    displayName: '@cocooning/eslint-config',
    ...jestConfig,
    testPathIgnorePatterns: ['/node_modules/', '/__fixtures__/'],
};
