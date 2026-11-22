import { scopeToNotDeleted } from './scope-to-not-deleted';

describe('Feature: hide soft-deleted rows', () => {
    describe('Scenario: no where clause', () => {
        it('keeps only rows that are not deleted', () => {
            expect(scopeToNotDeleted(undefined)).toEqual({ deletedAt: null });
        });
    });

    describe('Scenario: a where clause without deletedAt', () => {
        it('adds the filter and keeps the criteria', () => {
            expect(scopeToNotDeleted({ coupleId: 'couple-1' })).toEqual({
                coupleId: 'couple-1',
                deletedAt: null,
            });
        });
    });

    describe('Scenario: an explicit deletedAt criterion', () => {
        it('is the caller choice and stays untouched', () => {
            const where = { coupleId: 'couple-1', deletedAt: { not: null } };
            expect(scopeToNotDeleted(where)).toBe(where);
        });
    });
});
