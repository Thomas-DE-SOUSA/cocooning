import { fail, ok } from './result';

describe('Feature: carry an outcome without throwing', () => {
    describe('Scenario: a success', () => {
        it('holds the value', () => {
            expect(ok({ coupleId: 'couple-1' })).toEqual({
                success: true,
                value: { coupleId: 'couple-1' },
            });
        });
    });

    describe('Scenario: a failure', () => {
        it('holds the error', () => {
            expect(fail({ code: 'NETWORK_ERROR' })).toEqual({
                success: false,
                error: { code: 'NETWORK_ERROR' },
            });
        });
    });
});
