import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    idNumber,
    JPEG,
    LOVE,
    NOW,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/messaging-test.data';

const LATER = new Date(NOW.getTime() + 3_600_000);

describe('Feature: read the message feed', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const read = (cursor: string | null = null, limit = 25) =>
        ctx.listMessageFeedUseCase().execute(AS_B, { cursor, limit });

    // Three items in sending order: ids 1, 3, 5, each event taking the next id of the fake generator.
    const givenThreeItems = async () => {
        ctx.givenFlashMessageOf(AS_A);
        ctx.advanceHours(1);
        await ctx.givenInstantPhotoOf(AS_B);
        ctx.givenFlashMessageOf(AS_B, 'Bisous');
    };

    describe('Scenario: R5, the couple has sent words and photos', () => {
        it('gives both kinds, newest first, each with its time and its author', async () => {
            await givenThreeItems();
            await expect(read()).resolves.toEqual({
                items: [
                    {
                        type: 'FLASH_MESSAGE',
                        id: idNumber(5),
                        ownerId: PARTNER_B,
                        isOwner: true,
                        sentAt: LATER,
                        text: 'Bisous',
                    },
                    {
                        type: 'INSTANT_PHOTO',
                        id: idNumber(3),
                        ownerId: PARTNER_B,
                        isOwner: true,
                        sentAt: LATER,
                        contentType: JPEG,
                    },
                    {
                        type: 'FLASH_MESSAGE',
                        id: idNumber(1),
                        ownerId: PARTNER_A,
                        isOwner: false,
                        sentAt: NOW,
                        text: LOVE,
                    },
                ],
                nextCursor: null,
            });
        });

        it('gives an empty feed to a couple that has sent nothing', async () => {
            await expect(read()).resolves.toEqual({
                items: [],
                nextCursor: null,
            });
        });
    });

    describe('Scenario: decision 0025, the feed is read page by page', () => {
        it('gives the cursor of the last item when another page follows', async () => {
            await givenThreeItems();
            const page = await read(null, 2);
            expect(page.items.map(({ id }) => id)).toEqual([
                idNumber(5),
                idNumber(3),
            ]);
            expect(page.nextCursor).toBe(idNumber(3));
        });

        it('continues after the cursor, and ends with no cursor', async () => {
            await givenThreeItems();
            const page = await read(idNumber(3), 2);
            expect(page.items.map(({ id }) => id)).toEqual([idNumber(1)]);
            expect(page.nextCursor).toBeNull();
        });

        it('gives no cursor when the page holds exactly the last items', async () => {
            await givenThreeItems();
            const page = await read(null, 3);
            expect(page.items).toHaveLength(3);
            expect(page.nextCursor).toBeNull();
        });
    });

    describe('Scenario: R6, core.md rule 27, items the reader must not see', () => {
        it('leaves out a withdrawn item', async () => {
            const flashMessage = ctx.givenFlashMessageOf(AS_A);
            await ctx
                .withdrawFlashMessageUseCase()
                .execute(AS_A, { flashMessageId: flashMessage.id.getValue() });
            await expect(read()).resolves.toEqual({
                items: [],
                nextCursor: null,
            });
        });

        it('leaves out the items of another couple', async () => {
            await givenThreeItems();
            await expect(
                ctx
                    .listMessageFeedUseCase()
                    .execute(AS_STRANGER, { cursor: null, limit: 25 }),
            ).resolves.toEqual({ items: [], nextCursor: null });
        });
    });
});
