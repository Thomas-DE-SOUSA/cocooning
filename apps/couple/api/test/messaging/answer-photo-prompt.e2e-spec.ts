import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { InstantPhotoSentEvent } from '@cocooning/couple-server-business-logic/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    feedItemOf,
    GIF_IMAGE,
    MIDNIGHT,
    MILLISECONDS_PER_MINUTE,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    SEVEN_AM,
    STRANGER,
    TEN_AM_MINUTE,
} from './messaging-test-data';

const TEN_MINUTES = 10 * MILLISECONDS_PER_MINUTE;
const alreadyAnswered = refusal(
    409,
    MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
    'Photo of the day already sent',
);
const promptNotFound = refusal(
    404,
    MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
    'Photo prompt not found',
);

describe('Feature: a partner answers the photo prompt of the day (R8)', () => {
    const messaging = new MessagingTestApp();
    let photoPromptId: string;

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(async () => {
        await messaging.reset();
        photoPromptId = await messaging.issuedPhotoPromptId();
    });

    const answer = (userId = PARTNER_A, bytes?: Uint8Array) =>
        messaging.answerPhotoPrompt(userId, photoPromptId, bytes);

    it('answers 201 with a photo of the day on time, ten minutes after the prompt', async () => {
        messaging.clock.setNow(new Date(NOW.getTime() + TEN_MINUTES));
        const response = await answer();
        expect(response.status).toBe(201);
        expect(feedItemOf(response)).toMatchObject({
            type: 'INSTANT_PHOTO',
            ownerId: PARTNER_A,
            isOwner: true,
            photoPromptId,
            isLate: false,
            isHidden: false,
            contentType: 'image/jpeg',
        });
        const events = await readMessagingEvents(
            messaging.prisma,
            feedItemOf(response).id,
        );
        expect(events).toMatchObject([
            { eventName: InstantPhotoSentEvent.EVENT_NAME, published: false },
        ]);
    });

    it('marks it late one millisecond after the ten minutes', async () => {
        messaging.clock.setNow(new Date(NOW.getTime() + TEN_MINUTES + 1));
        expect(feedItemOf(await answer())).toMatchObject({ isLate: true });
    });

    it('refuses a second photo of the day of the same partner with 409, not the other partner', async () => {
        expect((await answer(PARTNER_A)).status).toBe(201);
        expect(await answer(PARTNER_A)).toEqual(alreadyAnswered);
        expect((await answer(PARTNER_B)).status).toBe(201);
    });

    it('keeps one of two photos sent at the same moment (unique index)', async () => {
        const statuses = (await Promise.all([answer(), answer()]))
            .map(({ status }) => status)
            .sort();
        expect(statuses).toEqual([201, 409]);
        await expect(
            messaging.prisma.current.instantPhoto.count({
                where: { photoPromptId },
            }),
        ).resolves.toBe(1);
    });

    it('refuses a photo at midnight with 409, the prompt has passed', async () => {
        messaging.clock.setNow(MIDNIGHT);
        expect(await answer()).toEqual(
            refusal(
                409,
                MessagingExceptionCodeEnum.PHOTO_PROMPT_EXPIRED,
                'Photo prompt passed at midnight',
            ),
        );
    });

    it('answers 404 before the prompt is issued, its time stays secret (R7)', async () => {
        await messaging.reset();
        messaging.clock.setNow(SEVEN_AM);
        messaging.random.willReturnIntegers([TEN_AM_MINUTE, TEN_AM_MINUTE]);
        await messaging.tick();
        const drawn =
            await messaging.prisma.current.photoPrompt.findFirstOrThrow();
        expect(await messaging.answerPhotoPrompt(PARTNER_A, drawn.id)).toEqual(
            promptNotFound,
        );
    });

    it('answers 404 to another couple and to a partner without a couple (core.md rule 27, R4)', async () => {
        expect(await answer(STRANGER)).toEqual(promptNotFound);
        expect((await answer(ALONE)).status).toBe(404);
    });

    it('refuses an invalid photo or identifier with 422', async () => {
        expect((await answer(PARTNER_A, GIF_IMAGE)).status).toBe(422);
        expect(
            (await messaging.answerPhotoPrompt(PARTNER_A, 'not-a-uuid')).status,
        ).toBe(422);
    });
});
