import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    feedPageOf,
    LOVE,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './messaging-test-data';

const LATER = new Date(NOW.getTime() + 60_000);

describe('Feature: a partner reads the message feed (R5)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    // A word of A, then a photo and a word of B a minute later.
    const sendThree = async () => {
        const love = await messaging.sentFlashMessageId(PARTNER_A);
        messaging.clock.setNow(LATER);
        const photo = await messaging.sentInstantPhotoId(PARTNER_B);
        const kiss = await messaging.sentFlashMessageId(PARTNER_B, 'Bisous');
        return { kiss, photo, love };
    };

    it('answers 200 with both kinds, newest first, each with its time and its author', async () => {
        const { kiss, photo, love } = await sendThree();
        expect(await messaging.feed(PARTNER_A)).toEqual({
            status: 200,
            body: {
                items: [
                    {
                        type: 'FLASH_MESSAGE',
                        id: kiss,
                        ownerId: PARTNER_B,
                        isOwner: false,
                        sentAt: LATER.toISOString(),
                        text: 'Bisous',
                    },
                    {
                        type: 'INSTANT_PHOTO',
                        id: photo,
                        ownerId: PARTNER_B,
                        isOwner: false,
                        sentAt: LATER.toISOString(),
                        contentType: 'image/jpeg',
                    },
                    {
                        type: 'FLASH_MESSAGE',
                        id: love,
                        ownerId: PARTNER_A,
                        isOwner: true,
                        sentAt: NOW.toISOString(),
                        text: LOVE,
                    },
                ],
                nextCursor: null,
            },
        });
    });

    it('reads page by page with the cursor of the last item (decision 0025)', async () => {
        const { kiss, photo, love } = await sendThree();
        const first = feedPageOf(
            await messaging.feed(PARTNER_B, { limit: '2' }),
        );
        expect(first.items.map(({ id }) => id)).toEqual([kiss, photo]);
        expect(first.nextCursor).toBe(photo);
        const second = feedPageOf(
            await messaging.feed(PARTNER_B, { limit: '2', cursor: photo }),
        );
        expect(second.items.map(({ id }) => id)).toEqual([love]);
        expect(second.nextCursor).toBeNull();
    });

    it('gives nothing of the couple to another couple (core.md rule 27)', async () => {
        await sendThree();
        expect(await messaging.feed(STRANGER)).toEqual({
            status: 200,
            body: { items: [], nextCursor: null },
        });
    });

    it('refuses a cursor that is not an identifier with 422', async () => {
        expect(
            (await messaging.feed(PARTNER_A, { cursor: 'not-a-uuid' })).status,
        ).toBe(422);
    });

    it('refuses a partner without a formed couple with 404 (R4)', async () => {
        expect(await messaging.feed(ALONE)).toEqual(
            refusal(
                404,
                MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
                'The messages need a formed couple',
            ),
        );
    });
});
