import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { createCoupleHttpConfig } from './couple-http-config';

const config = createCoupleHttpConfig(5000);

const anErrorBody = (status: number, code: string | null) => ({
    status,
    message: 'Refused by the API',
    ...(code === null ? {} : { code }),
});

describe('Feature: translate an API failure into an ApiError', () => {
    describe('Scenario: the API refuses with a known status', () => {
        it.each([
            [400, ApiErrorCodeEnum.VALIDATION_ERROR],
            [401, ApiErrorCodeEnum.UNAUTHORIZED],
            [404, ApiErrorCodeEnum.NOT_FOUND],
            [409, ApiErrorCodeEnum.CONFLICT],
            [422, ApiErrorCodeEnum.VALIDATION_ERROR],
        ])('maps %i to %s and keeps the backend code', (status, code) => {
            expect(
                config.mapHttpError(
                    status,
                    anErrorBody(status, 'PAIRING_COUPLE_NOT_FOUND'),
                ),
            ).toEqual({
                code,
                message: 'Refused by the API',
                backendCode: 'PAIRING_COUPLE_NOT_FOUND',
            });
        });
    });

    describe('Scenario: the API refuses with another status', () => {
        it('maps it to UNKNOWN', () => {
            expect(config.mapHttpError(500, anErrorBody(500, null))).toEqual({
                code: ApiErrorCodeEnum.UNKNOWN,
                message: 'Refused by the API',
                backendCode: null,
            });
        });
    });

    describe('Scenario: the error body is not the contract error response', () => {
        it('keeps the status in the message', () => {
            expect(config.mapHttpError(502, null)).toEqual({
                code: ApiErrorCodeEnum.UNKNOWN,
                message: 'HTTP 502',
                backendCode: null,
            });
        });
    });

    describe('Scenario: the API cannot be reached or answers garbage', () => {
        it('builds a network error', () => {
            expect(config.createNetworkError('fetch failed')).toEqual({
                code: ApiErrorCodeEnum.NETWORK_ERROR,
                message: 'fetch failed',
                backendCode: null,
            });
        });

        it('builds an invalid response error', () => {
            expect(
                config.createInvalidResponseError('Response body is not JSON'),
            ).toEqual({
                code: ApiErrorCodeEnum.INVALID_RESPONSE,
                message: 'Response body is not JSON',
                backendCode: null,
            });
        });
    });

    it('carries the timeout it was built with', () => {
        expect(config.timeoutMs).toBe(5000);
    });
});
