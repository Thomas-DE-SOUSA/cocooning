import { violatedUniqueConstraint } from './violated-unique-constraint';

const prismaErrorWith = (cause: Record<string, unknown>) => ({
    code: 'P2010',
    meta: { driverAdapterError: { name: 'DriverAdapterError', cause } },
});

describe('Feature: identify a unique violation', () => {
    describe('Scenario: a violation named by its index', () => {
        it('returns the constraint name', () => {
            const error = prismaErrorWith({
                kind: 'UniqueConstraintViolation',
                constraint: { index: 'note_title_key' },
            });
            expect(violatedUniqueConstraint(error)).toBe('note_title_key');
        });
    });

    describe('Scenario: a violation named by its fields', () => {
        it('returns the joined fields', () => {
            const error = prismaErrorWith({
                kind: 'UniqueConstraintViolation',
                constraint: { fields: ['couple_id', 'title'] },
            });
            expect(violatedUniqueConstraint(error)).toBe('couple_id,title');
        });
    });

    describe('Scenario: another error', () => {
        it.each([
            [
                'another Postgres error',
                prismaErrorWith({ kind: 'postgres', code: '55P03' }),
            ],
            ['an error without meta', new Error('boom')],
            ['a non-object', 'boom'],
        ])('returns null for %s', (_label, error) => {
            expect(violatedUniqueConstraint(error)).toBeNull();
        });
    });
});
