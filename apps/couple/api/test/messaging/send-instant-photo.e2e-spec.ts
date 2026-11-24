import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { InstantPhotoSentEvent } from '@cocooning/couple-server-business-logic/messaging';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    COUPLE_ID,
    feedItemOf,
    GIF_IMAGE,
    JPEG_PHOTO,
    NOW,
    PARTNER_A,
    PNG_PHOTO,
    refusal,
} from './messaging-test-data';

const invalidPhoto = refusal(
    422,
    MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
    'Invalid instant photo content',
    { max: INSTANT_PHOTO_MAX_BYTES },
);

const tooHeavy = (): Uint8Array => {
    const bytes = new Uint8Array(INSTANT_PHOTO_MAX_BYTES + 1);
    bytes.set(JPEG_PHOTO);
    return bytes;
};

describe('Feature: a partner sends an instant photo (R1, R3)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    describe('Scenario: a photo of the phone camera', () => {
        it('answers 201 with the photo, typed by its bytes rather than by what the phone declared', async () => {
            const response = await messaging.sendInstantPhoto(
                PARTNER_A,
                PNG_PHOTO,
                'application/octet-stream',
            );
            expect(response).toEqual({
                status: 201,
                body: {
                    type: 'INSTANT_PHOTO',
                    id: feedItemOf(response).id,
                    ownerId: PARTNER_A,
                    isOwner: true,
                    sentAt: NOW.toISOString(),
                    contentType: 'image/png',
                },
            });
        });

        it('stores its bytes under a key that starts with the couple (decision 0027)', async () => {
            const id = await messaging.sentInstantPhotoId(PARTNER_A);
            await expect(
                messaging.fileStorage.read(`${COUPLE_ID}/instant-photos/${id}`),
            ).resolves.toMatchObject({ contentType: 'image/jpeg' });
        });

        it('writes its outbox row, without the bytes', async () => {
            const id = await messaging.sentInstantPhotoId(PARTNER_A);
            expect(await readMessagingEvents(messaging.prisma, id)).toEqual([
                {
                    eventName: InstantPhotoSentEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: id,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: { ownerId: PARTNER_A },
                },
            ]);
        });

        it('accepts a photo of exactly INSTANT_PHOTO_MAX_BYTES', async () => {
            const bytes = new Uint8Array(INSTANT_PHOTO_MAX_BYTES);
            bytes.set(JPEG_PHOTO);
            const response = await messaging.sendInstantPhoto(PARTNER_A, bytes);
            expect(response.status).toBe(201);
        });
    });

    describe('Scenario: R3, a file that is not an accepted photo', () => {
        it('refuses a GIF declared as a JPEG with 422', async () => {
            expect(
                await messaging.sendInstantPhoto(
                    PARTNER_A,
                    GIF_IMAGE,
                    'image/jpeg',
                ),
            ).toEqual(invalidPhoto);
        });

        it('refuses a photo heavier than INSTANT_PHOTO_MAX_BYTES with 422, stopped by multer', async () => {
            expect(
                await messaging.sendInstantPhoto(PARTNER_A, tooHeavy()),
            ).toEqual(invalidPhoto);
        });

        it('refuses a form without the photo with 422', async () => {
            const response = await messaging
                .as(PARTNER_A)
                .postForm(ApiRouterEnum.INSTANT_PHOTO_SEND, new FormData());
            expect(response).toEqual(invalidPhoto);
        });
    });

    describe('Scenario: R4, a partner without a formed couple', () => {
        it('refuses with 404 MESSAGING_COUPLE_NOT_PAIRED', async () => {
            expect((await messaging.sendInstantPhoto(ALONE)).status).toBe(404);
        });
    });
});
