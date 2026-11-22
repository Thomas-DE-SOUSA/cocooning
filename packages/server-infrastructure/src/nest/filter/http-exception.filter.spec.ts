import { type ArgumentsHost, NotFoundException } from '@nestjs/common';
import { BaseException } from '@cocooning/shared-kernel/exceptions';
import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import { z } from 'zod';
import { ZodException } from '../zod/zod.exception';
import { requestContext } from '../middleware/request-context';
import { HttpExceptionFilter } from './http-exception.filter';
import { INTERNAL_ERROR_MESSAGE } from './http-error-body';

const SampleExceptionCodeEnum = {
    NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
    NOTE_UNMAPPED: 'NOTE_UNMAPPED',
} as const;

class SampleException extends BaseException<
    keyof typeof SampleExceptionCodeEnum
> {}

type Reply = { status: number | null; body: unknown };

const hostFor = (reply: Reply): ArgumentsHost => {
    const response = {
        status: (status: number) => {
            reply.status = status;
            return response;
        },
        json: (body: unknown) => {
            reply.body = body;
        },
    };
    const request = { method: 'GET', path: '/notes/note-1' };
    return {
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => response,
        }),
    } as unknown as ArgumentsHost;
};

describe('Feature: translate exceptions into HTTP responses', () => {
    let logger: FakeLoggerAdapter;
    let filter: HttpExceptionFilter;
    let reply: Reply;

    const handle = (exception: unknown): void =>
        requestContext.run({ requestId: 'request-1' }, () =>
            filter.catch(exception, hostFor(reply)),
        );

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        filter = new HttpExceptionFilter(
            { [SampleExceptionCodeEnum.NOTE_NOT_FOUND]: 404 },
            logger,
        );
        reply = { status: null, body: null };
    });

    describe('Scenario: a domain exception whose code is in the table', () => {
        it('answers with the status of the table and the code', () => {
            handle(
                new SampleException({
                    code: SampleExceptionCodeEnum.NOTE_NOT_FOUND,
                    message: 'Note not found',
                }),
            );
            expect(reply).toEqual({
                status: 404,
                body: {
                    status: 404,
                    code: 'NOTE_NOT_FOUND',
                    message: 'Note not found',
                    context: null,
                },
            });
            expect(logger.entries).toEqual([
                {
                    level: 'warn',
                    message: 'Request failed',
                    context: {
                        requestId: 'request-1',
                        method: 'GET',
                        path: '/notes/note-1',
                        status: 404,
                        code: 'NOTE_NOT_FOUND',
                    },
                },
            ]);
        });
    });

    describe('Scenario: a domain exception whose code is missing from the table', () => {
        it('answers 500 without leaking its message, and logs an error with its code', () => {
            const exception = new SampleException({
                code: SampleExceptionCodeEnum.NOTE_UNMAPPED,
                message: 'internal detail',
            });
            handle(exception);
            expect(reply).toEqual({
                status: 500,
                body: { status: 500, message: INTERNAL_ERROR_MESSAGE },
            });
            expect(logger.entries).toEqual([
                expect.objectContaining({
                    level: 'error',
                    context: expect.objectContaining({
                        code: 'NOTE_UNMAPPED',
                        error: exception,
                    }),
                }),
            ]);
        });
    });

    describe('Scenario: a validation failure', () => {
        it('answers 422 with the issues', () => {
            const result = z.object({ title: z.string() }).safeParse({});
            if (result.success)
                throw new Error('Expected a validation failure');
            handle(new ZodException(result.error));
            expect(reply).toEqual({
                status: 422,
                body: {
                    status: 422,
                    code: 'VALIDATION_FAILED',
                    message: 'Validation failed',
                    errors: [expect.objectContaining({ path: 'title' })],
                },
            });
        });
    });

    describe('Scenario: a framework HTTP exception', () => {
        it('keeps its status', () => {
            handle(new NotFoundException());
            expect(reply.status).toBe(404);
            expect(reply.body).toEqual(
                expect.objectContaining({ status: 404 }),
            );
        });
    });

    describe('Scenario: an unknown error', () => {
        it('answers 500 without leaking its message', () => {
            handle(new Error('connection refused at 10.0.0.3'));
            expect(reply).toEqual({
                status: 500,
                body: { status: 500, message: INTERNAL_ERROR_MESSAGE },
            });
        });
    });
});
