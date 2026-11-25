import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    JPEG_PHOTO,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    UNKNOWN_ID,
} from './messaging-test-data';

describe('Feature: a partner opens an instant photo (R5)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    it.each([
        ['its author', PARTNER_A],
        ['the other partner', PARTNER_B],
    ])(
        'answers 200 to %s with the bytes and their content type',
        async (_label, userId) => {
            const id = await messaging.sentInstantPhotoId(PARTNER_A);
            expect(await messaging.photoFile(userId, id)).toEqual({
                status: 200,
                contentType: 'image/jpeg',
                bytes: JPEG_PHOTO,
            });
        },
    );

    it('answers 404 to another couple and to an unknown photo (core.md rule 27)', async () => {
        const id = await messaging.sentInstantPhotoId(PARTNER_A);
        const notFound = refusal(
            404,
            MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            'Instant photo not found',
        );
        expect(
            await messaging.as(STRANGER).get(messaging.photoFilePath(id)),
        ).toEqual(notFound);
        expect(
            await messaging
                .as(PARTNER_A)
                .get(messaging.photoFilePath(UNKNOWN_ID)),
        ).toEqual(notFound);
    });

    it('answers 404 to a partner without a formed couple (R4)', async () => {
        const id = await messaging.sentInstantPhotoId(PARTNER_A);
        expect((await messaging.photoFile(ALONE, id)).status).toBe(404);
    });

    it('refuses an identifier that is not a UUID with 422', async () => {
        expect(
            (await messaging.photoFile(PARTNER_A, 'not-a-uuid')).status,
        ).toBe(422);
    });
});
