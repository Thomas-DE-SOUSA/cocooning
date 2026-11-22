import { ZodException } from '../zod/zod.exception';
import { MAX_PAGE_SIZE } from './offset-pagination.schema';
import { parseOffsetPagination } from './parse-offset-pagination';

describe('Feature: read offset pagination from the query string', () => {
    describe('Scenario: no pagination given', () => {
        it('starts at page 1 with 25 items', () => {
            expect(parseOffsetPagination({})).toEqual({
                page: 1,
                pageSize: 25,
            });
        });
    });

    describe('Scenario: pagination given as strings', () => {
        it('converts them to numbers', () => {
            expect(
                parseOffsetPagination({ page: '3', pageSize: '10' }),
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
        ])('answers 422 for %s', (_label, query) => {
            expect(() => parseOffsetPagination(query)).toThrow(ZodException);
        });
    });
});
