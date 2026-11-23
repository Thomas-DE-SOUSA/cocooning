import { MAX_PAGE_SIZE } from '@cocooning/shared-kernel/domain';
import { CursorPaginationQuerySchema } from './cursor-pagination-query.request';

const LAST_ITEM_ID = '00000000-0000-7000-8000-000000000001';

describe('Feature: cursor pagination from the query string', () => {
    describe('Scenario: the first page of a feed', () => {
        it('has no cursor and 25 items', () => {
            expect(CursorPaginationQuerySchema.parse({})).toEqual({
                cursor: null,
                limit: 25,
            });
        });
    });

    describe('Scenario: the next page after the last item received', () => {
        it('keeps the cursor and converts the limit', () => {
            expect(
                CursorPaginationQuerySchema.parse({
                    cursor: LAST_ITEM_ID,
                    limit: '10',
                }),
            ).toEqual({ cursor: LAST_ITEM_ID, limit: 10 });
        });
    });

    describe('Scenario: invalid pagination', () => {
        it.each([
            ['a cursor that is not a UUID', { cursor: 'abc' }],
            ['a limit of 0', { limit: '0' }],
            ['a limit above the maximum', { limit: String(MAX_PAGE_SIZE + 1) }],
        ])('rejects %s', (_label, query) => {
            expect(CursorPaginationQuerySchema.safeParse(query).success).toBe(
                false,
            );
        });
    });
});
