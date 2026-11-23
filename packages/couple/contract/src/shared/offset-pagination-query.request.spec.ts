import { MAX_PAGE_SIZE } from '@cocooning/shared-kernel/domain';
import { OffsetPaginationQuerySchema } from './offset-pagination-query.request';

describe('Feature: offset pagination from the query string', () => {
    describe('Scenario: no pagination given', () => {
        it('starts at page 1 with 25 items', () => {
            expect(OffsetPaginationQuerySchema.parse({})).toEqual({
                page: 1,
                pageSize: 25,
            });
        });
    });

    describe('Scenario: pagination given as strings', () => {
        it('converts them to numbers', () => {
            expect(
                OffsetPaginationQuerySchema.parse({
                    page: '3',
                    pageSize: '10',
                }),
            ).toEqual({ page: 3, pageSize: 10 });
        });
    });

    describe('Scenario: invalid pagination', () => {
        it.each([
            ['page 0', { page: '0' }],
            ['a decimal page', { page: '1.5' }],
            [
                'a page size above the maximum',
                { pageSize: String(MAX_PAGE_SIZE + 1) },
            ],
            ['a non-numeric page size', { pageSize: 'many' }],
        ])('rejects %s', (_label, query) => {
            expect(OffsetPaginationQuerySchema.safeParse(query).success).toBe(
                false,
            );
        });
    });
});
