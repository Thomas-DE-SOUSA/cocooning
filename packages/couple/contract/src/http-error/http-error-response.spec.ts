import { HttpErrorResponseSchema } from './http-error-response.zod';

describe('Feature: describe an error response', () => {
    describe('Scenario: a domain exception', () => {
        it('keeps its code and context', () => {
            const body = {
                status: 404,
                code: 'NOTE_NOT_FOUND',
                message: 'Note not found',
                context: null,
            };
            expect(HttpErrorResponseSchema.parse(body)).toEqual(body);
        });
    });

    describe('Scenario: a validation failure', () => {
        it('keeps every issue of errors[]', () => {
            const body = {
                status: 422,
                code: 'VALIDATION_FAILED',
                message: 'Validation failed',
                errors: [
                    { path: 'title', code: 'too_big', message: 'Too long' },
                ],
            };
            expect(HttpErrorResponseSchema.parse(body)).toEqual(body);
        });
    });

    describe('Scenario: an internal error', () => {
        it('needs only a status and a message', () => {
            const body = { status: 500, message: 'Internal Server Error' };
            expect(HttpErrorResponseSchema.parse(body)).toEqual(body);
        });
    });
});
