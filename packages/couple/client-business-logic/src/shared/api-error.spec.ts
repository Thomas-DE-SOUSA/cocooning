import { ApiErrorCodeEnum } from './api-error';

describe('Feature: error of an API call seen by the frontend', () => {
    describe('Scenario: listing the codes', () => {
        it('has one code per kind of failure, each value equal to its key', () => {
            expect(ApiErrorCodeEnum).toEqual({
                NETWORK_ERROR: 'NETWORK_ERROR',
                INVALID_RESPONSE: 'INVALID_RESPONSE',
                UNAUTHORIZED: 'UNAUTHORIZED',
                NOT_FOUND: 'NOT_FOUND',
                CONFLICT: 'CONFLICT',
                VALIDATION_ERROR: 'VALIDATION_ERROR',
                UNKNOWN: 'UNKNOWN',
            });
        });
    });
});
