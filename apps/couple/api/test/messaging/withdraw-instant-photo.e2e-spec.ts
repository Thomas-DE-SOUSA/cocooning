import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { InstantPhotoWithdrawnEvent } from '@cocooning/couple-server-business-logic/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './messaging-test-data';

const fileKeyOf = (id: string): string => `${COUPLE_ID}/instant-photos/${id}`;

describe('Feature: the author withdraws an instant photo (R6)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    it('answers 204, removes the photo from the feed and deletes its file', async () => {
        const id = await messaging.sentInstantPhotoId(PARTNER_A);
        expect(await messaging.withdrawInstantPhoto(PARTNER_A, id)).toEqual({
            status: 204,
            body: null,
        });
        expect((await messaging.feed(PARTNER_B)).body).toEqual({
            items: [],
            nextCursor: null,
        });
        await expect(
            messaging.fileStorage.read(fileKeyOf(id)),
        ).resolves.toBeNull();
        expect((await messaging.photoFile(PARTNER_B, id)).status).toBe(404);
        const events = await readMessagingEvents(messaging.prisma, id);
        expect(events.map(({ eventName }) => eventName)).toContain(
            InstantPhotoWithdrawnEvent.EVENT_NAME,
        );
    });

    it('refuses the other partner with 403, and keeps the photo and its file', async () => {
        const id = await messaging.sentInstantPhotoId(PARTNER_A);
        expect(await messaging.withdrawInstantPhoto(PARTNER_B, id)).toEqual(
            refusal(
                403,
                MessagingExceptionCodeEnum.INSTANT_PHOTO_RESERVED_TO_OWNER,
                'Reserved to the author of the instant photo',
            ),
        );
        await expect(
            messaging.fileStorage.read(fileKeyOf(id)),
        ).resolves.not.toBeNull();
    });

    it('answers 404 to another couple, and keeps the file', async () => {
        const id = await messaging.sentInstantPhotoId(PARTNER_A);
        expect(await messaging.withdrawInstantPhoto(STRANGER, id)).toEqual(
            refusal(
                404,
                MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
                'Instant photo not found',
            ),
        );
        await expect(
            messaging.fileStorage.read(fileKeyOf(id)),
        ).resolves.not.toBeNull();
    });
});
