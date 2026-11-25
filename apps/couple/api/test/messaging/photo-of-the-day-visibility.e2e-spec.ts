import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    feedItemOf,
    feedPageOf,
    JPEG_PHOTO,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    todayPhotoPromptOf,
} from './messaging-test-data';

describe("Feature: the partner's photo of the day stays hidden until I send mine (R9)", () => {
    const messaging = new MessagingTestApp();
    let photoPromptId: string;
    let photoOfA: string;

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(async () => {
        await messaging.reset();
        photoPromptId = await messaging.issuedPhotoPromptId();
        photoOfA = feedItemOf(
            await messaging.answerPhotoPrompt(PARTNER_A, photoPromptId),
        ).id;
    });

    const hidden = () => ({
        type: 'INSTANT_PHOTO',
        id: photoOfA,
        ownerId: PARTNER_A,
        isOwner: false,
        sentAt: NOW.toISOString(),
        photoPromptId,
        isLate: false,
        isHidden: true,
    });

    it('says in the feed that it exists, without its content type', async () => {
        const response = await messaging.feed(PARTNER_B);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ items: [hidden()], nextCursor: null });
    });

    it('answers 404 to its file, and tells the reader the partner has answered', async () => {
        expect(
            await messaging
                .as(PARTNER_B)
                .get(messaging.photoFilePath(photoOfA)),
        ).toEqual(
            refusal(
                404,
                MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
                'Instant photo not found',
            ),
        );
        const { photoPrompt } = todayPhotoPromptOf(
            await messaging.todayPhotoPrompt(PARTNER_B),
        );
        expect(photoPrompt).toMatchObject({
            myInstantPhotoId: null,
            isAnsweredByPartner: true,
        });
    });

    it('is always seen by its author', async () => {
        expect((await messaging.photoFile(PARTNER_A, photoOfA)).status).toBe(
            200,
        );
        expect(feedPageOf(await messaging.feed(PARTNER_A)).items).toMatchObject(
            [{ id: photoOfA, isHidden: false, contentType: 'image/jpeg' }],
        );
    });

    it('is seen, bytes included, once the reader has sent theirs', async () => {
        await messaging.answerPhotoPrompt(PARTNER_B, photoPromptId);
        expect(await messaging.photoFile(PARTNER_B, photoOfA)).toEqual({
            status: 200,
            contentType: 'image/jpeg',
            bytes: JPEG_PHOTO,
        });
        expect(
            feedPageOf(await messaging.feed(PARTNER_B)).items.map(
                (item) => item.type === 'INSTANT_PHOTO' && item.isHidden,
            ),
        ).toEqual([false, false]);
    });

    it('leaves a spontaneous photo seen at once', async () => {
        const spontaneous = await messaging.sentInstantPhotoId(PARTNER_A);
        expect((await messaging.photoFile(PARTNER_B, spontaneous)).status).toBe(
            200,
        );
    });

    it('shows nothing to another couple (core.md rule 27)', async () => {
        expect(feedPageOf(await messaging.feed(STRANGER)).items).toEqual([]);
        expect((await messaging.photoFile(STRANGER, photoOfA)).status).toBe(
            404,
        );
    });
});
