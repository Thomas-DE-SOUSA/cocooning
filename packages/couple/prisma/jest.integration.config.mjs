import unitConfig from './jest.config.mjs';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    ...unitConfig,
    displayName: '@cocooning/couple-prisma (integration)',
    testMatch: ['**/*.integration-spec.ts'],
};
