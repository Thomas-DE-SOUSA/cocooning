import { BaseException, isBaseException } from './base-exception';

const SampleExceptionCodeEnum = {
    SAMPLE_TITLE_TOO_LONG: 'SAMPLE_TITLE_TOO_LONG',
} as const;

class SampleException extends BaseException<
    keyof typeof SampleExceptionCodeEnum
> {}

describe('Feature: typed exceptions', () => {
    describe('Scenario: an exception without context', () => {
        it('carries its code, message, class name and a null context', () => {
            const exception = new SampleException({
                code: SampleExceptionCodeEnum.SAMPLE_TITLE_TOO_LONG,
                message: 'Title too long',
            });
            expect(exception).toBeInstanceOf(Error);
            expect(exception).toMatchObject({
                name: 'SampleException',
                code: 'SAMPLE_TITLE_TOO_LONG',
                message: 'Title too long',
                context: null,
            });
        });
    });

    describe('Scenario: an exception with bounds', () => {
        it('carries its context', () => {
            const exception = new SampleException({
                code: SampleExceptionCodeEnum.SAMPLE_TITLE_TOO_LONG,
                message: 'Title too long',
                context: { max: 120 },
            });
            expect(exception.context).toEqual({ max: 120 });
        });
    });

    describe('Scenario: narrowing an unknown error', () => {
        it('recognizes a typed exception and nothing else', () => {
            const exception = new SampleException({
                code: SampleExceptionCodeEnum.SAMPLE_TITLE_TOO_LONG,
                message: 'x',
            });
            expect(isBaseException(exception)).toBe(true);
            expect(isBaseException(new Error('x'))).toBe(false);
            expect(isBaseException(null)).toBe(false);
        });
    });
});
