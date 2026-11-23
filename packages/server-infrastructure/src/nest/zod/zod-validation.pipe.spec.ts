import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';
import { VALIDATION_FAILED_CODE, ZodException } from './zod.exception';

const ShareNoteSchema = z.object({
    title: z.string().min(1),
    tags: z.array(z.string()).default([]),
});

const caught = (run: () => unknown): unknown => {
    try {
        run();
    } catch (error) {
        return error;
    }
    throw new Error('Expected an exception');
};

describe('Feature: validate a request with a Zod schema', () => {
    const pipe = new ZodValidationPipe(ShareNoteSchema);

    describe('Scenario: valid input', () => {
        it('returns the parsed value, defaults applied and unknown keys stripped', () => {
            expect(
                pipe.transform({ title: 'Courses', extra: 'ignored' }),
            ).toEqual({ title: 'Courses', tags: [] });
        });
    });

    describe('Scenario: invalid input', () => {
        it('answers 422 with one issue per invalid field', () => {
            const error = caught(() =>
                pipe.transform({ title: '', tags: [1] }),
            );
            expect(error).toBeInstanceOf(ZodException);
            const exception = error as ZodException;
            expect(exception.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
            expect(exception.getResponse()).toEqual({
                code: VALIDATION_FAILED_CODE,
                message: 'Validation failed',
                errors: [
                    expect.objectContaining({
                        path: 'title',
                        code: 'too_small',
                    }),
                    expect.objectContaining({
                        path: 'tags.0',
                        code: 'invalid_type',
                    }),
                ],
            });
        });
    });
});
