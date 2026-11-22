import {
    type ModelOperation,
    scopeOperationToNotDeleted,
} from './soft-delete.extension';

const SOFT_DELETABLE = new Set(['Note']);

const forwarded = async (
    model: string,
    operation: string,
): Promise<unknown> => {
    let received: unknown = null;
    const call: ModelOperation = {
        model,
        operation,
        args: { where: { coupleId: 'couple-1' } },
        query: (args) => {
            received = args;
            return Promise.resolve(null);
        },
    };
    await scopeOperationToNotDeleted(call, SOFT_DELETABLE);
    return received;
};

describe('Feature: soft-delete filter on queries', () => {
    describe('Scenario: a read on a soft-deletable model', () => {
        it.each(['findMany', 'findFirst', 'count', 'updateMany'])(
            'scopes %s to rows not deleted',
            async (operation) => {
                await expect(forwarded('Note', operation)).resolves.toEqual({
                    where: { coupleId: 'couple-1', deletedAt: null },
                });
            },
        );
    });

    describe('Scenario: an operation that must see every row', () => {
        it.each([
            'create',
            'createMany',
            'createManyAndReturn',
            'aggregate',
            'upsert',
        ])('leaves %s untouched', async (operation) => {
            await expect(forwarded('Note', operation)).resolves.toEqual({
                where: { coupleId: 'couple-1' },
            });
        });
    });

    describe('Scenario: a model without deletedAt', () => {
        it('leaves the query untouched', async () => {
            await expect(forwarded('NoteEvent', 'findMany')).resolves.toEqual({
                where: { coupleId: 'couple-1' },
            });
        });
    });
});
