import { FakeUuidV7GeneratorProvider } from '@cocooning/shared-kernel/testing';
import type { Request, Response } from 'express';
import { getRequestId } from './request-context';
import {
    REQUEST_ID_HEADER,
    RequestIdMiddleware,
} from './request-id.middleware';

const run = (
    incoming: string | null,
): { header: string | null; seen: string | null } => {
    const outcome = {
        header: null as string | null,
        seen: null as string | null,
    };
    const request = {
        header: () => (incoming === null ? undefined : incoming),
    } as unknown as Request;
    const response = {
        setHeader: (name: string, value: string) => {
            if (name === REQUEST_ID_HEADER) outcome.header = value;
        },
    } as unknown as Response;
    new RequestIdMiddleware(new FakeUuidV7GeneratorProvider()).use(
        request,
        response,
        () => {
            outcome.seen = getRequestId();
        },
    );
    return outcome;
};

describe('Feature: tag every request with an identifier', () => {
    describe('Scenario: the client sends a valid request id', () => {
        it('keeps it on the response and in the request context', () => {
            expect(run('abc-123')).toEqual({
                header: 'abc-123',
                seen: 'abc-123',
            });
        });
    });

    describe('Scenario: no request id is sent', () => {
        it('generates one', () => {
            const generated = '00000000-0000-7000-8000-000000000001';
            expect(run(null)).toEqual({ header: generated, seen: generated });
        });
    });

    describe('Scenario: the client sends a malformed request id', () => {
        it('replaces it with a generated one', () => {
            expect(run('<script>').header).toBe(
                '00000000-0000-7000-8000-000000000001',
            );
        });
    });

    describe('Scenario: outside a request', () => {
        it('has no request id', () => {
            expect(getRequestId()).toBeNull();
        });
    });
});
