import {
    type CallHandler,
    type ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common';
import { FakeLoggerAdapter } from '@cocooning/shared-kernel/testing';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';
import { ZodResponseInterceptor } from './zod-response.interceptor';

const NoteResponseSchema = z.object({ noteId: z.string(), title: z.string() });

class NotesController {
    getNote(): void {}
}

const executionContext = {
    getClass: () => NotesController,
    getHandler: () => NotesController.prototype.getNote,
} as unknown as ExecutionContext;

const handlerReturning = (value: unknown): CallHandler<unknown> => ({
    handle: () => of(value),
});

describe('Feature: validate and whitelist a response', () => {
    let logger: FakeLoggerAdapter;
    let interceptor: ZodResponseInterceptor<typeof NoteResponseSchema>;

    beforeEach(() => {
        logger = new FakeLoggerAdapter();
        interceptor = new ZodResponseInterceptor(NoteResponseSchema, logger);
    });

    describe('Scenario: the response matches the schema', () => {
        it('returns it without the fields the schema does not declare', async () => {
            const response = interceptor.intercept(
                executionContext,
                handlerReturning({
                    noteId: 'note-1',
                    title: 'Courses',
                    ownerPasswordHash: 'secret',
                }),
            );
            await expect(firstValueFrom(response)).resolves.toEqual({
                noteId: 'note-1',
                title: 'Courses',
            });
        });
    });

    describe('Scenario: the response breaks the schema', () => {
        it('answers 500 and logs the handler and the issues', async () => {
            const response = interceptor.intercept(
                executionContext,
                handlerReturning({ noteId: 'note-1' }),
            );
            await expect(firstValueFrom(response)).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
            expect(logger.entries).toEqual([
                {
                    level: 'error',
                    message: 'Response validation failed',
                    context: {
                        handler: 'NotesController.getNote',
                        issues: [
                            expect.objectContaining({
                                path: 'title',
                                code: 'invalid_type',
                            }),
                        ],
                    },
                },
            ]);
        });
    });
});
