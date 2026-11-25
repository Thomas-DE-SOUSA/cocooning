import { ListMessageFeedUseCase } from '@cocooning/couple-client-business-logic/messaging';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_FLASH_MESSAGE,
    A_MESSAGE_FEED_PAGE,
    FakeMessageFeedGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { ok } from '@cocooning/shared-kernel/utils';
import { listOlderMessages } from './older-messages.service';

describe('Feature: the older pages of the feed (R5)', () => {
    it('reads the page after the cursor, 25 items at most', async () => {
        const gateway = new FakeMessageFeedGateway();

        const page = await listOlderMessages(
            A_FLASH_MESSAGE.id,
            new ListMessageFeedUseCase(gateway),
        );

        expect(page).toEqual(ok(A_MESSAGE_FEED_PAGE));
        expect(gateway.queries).toEqual([
            { cursor: A_FLASH_MESSAGE.id, limit: 25 },
        ]);
    });

    it.each([
        ['a cursor that is not an item id', 'yesterday'],
        ['no cursor, which would read the first page again', null],
    ])('refuses %s without calling the API', async (_label, cursor) => {
        const gateway = new FakeMessageFeedGateway();

        const page = await listOlderMessages(
            cursor,
            new ListMessageFeedUseCase(gateway),
        );

        expect(page.success === false && page.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(gateway.queries).toEqual([]);
    });
});
