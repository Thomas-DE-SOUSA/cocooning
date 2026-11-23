import { fail, ok } from '@cocooning/shared-kernel/utils';
import { z } from 'zod';
import { TEST_HTTP_CONFIG } from './__tests__/test-http-config';
import { parseResponse } from './parse-response';

const CoupleSchema = z.object({ coupleId: z.string() });

describe('Feature: check a response against its contract', () => {
    describe('Scenario: the body matches the contract', () => {
        it('returns the typed body', () => {
            expect(
                parseResponse(
                    ok({ coupleId: 'couple-1' }),
                    CoupleSchema,
                    TEST_HTTP_CONFIG,
                ),
            ).toEqual(ok({ coupleId: 'couple-1' }));
        });
    });

    describe('Scenario: the body does not match the contract', () => {
        it('reports an invalid response', () => {
            expect(
                parseResponse(ok({ id: 1 }), CoupleSchema, TEST_HTTP_CONFIG),
            ).toEqual(
                fail({
                    kind: 'invalid-response',
                    message: 'Response does not match its contract',
                }),
            );
        });
    });

    describe('Scenario: the request already failed', () => {
        it('passes the failure through', () => {
            const failure = fail({
                kind: 'network' as const,
                message: 'fetch failed',
            });

            expect(parseResponse(failure, CoupleSchema, TEST_HTTP_CONFIG)).toBe(
                failure,
            );
        });
    });
});
