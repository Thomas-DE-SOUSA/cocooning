import { z } from 'zod';
import { createCursorPageResponseSchema } from './cursor-page.zod';
import { createOffsetPageResponseSchema } from './offset-page.zod';

const ItemSchema = z.object({ id: z.string() });
const ITEM = { id: 'note-1' };

describe('Feature: describe a page of results', () => {
    describe('Scenario: an offset page', () => {
        it('keeps the items, the total and the page position', () => {
            const page = { items: [ITEM], total: 26, page: 2, pageSize: 25 };
            expect(
                createOffsetPageResponseSchema(ItemSchema).parse(page),
            ).toEqual(page);
        });
    });

    describe('Scenario: the last page of a feed', () => {
        it('has no next cursor', () => {
            const page = { items: [ITEM], nextCursor: null };
            expect(
                createCursorPageResponseSchema(ItemSchema).parse(page),
            ).toEqual(page);
        });
    });

    describe('Scenario: an item outside the contract', () => {
        it('drops its undeclared fields', () => {
            const page = {
                items: [{ ...ITEM, body: 'secret' }],
                nextCursor: null,
            };
            expect(
                createCursorPageResponseSchema(ItemSchema).parse(page).items,
            ).toEqual([ITEM]);
        });
    });
});
