import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { InstantPhotoSentEvent } from '../../domain/events/instant-photo-sent.event';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    idNumber,
    JPEG,
    JPEG_PHOTO,
    MIDNIGHT,
    MILLISECONDS_PER_MINUTE,
    NOW,
    PARTNER_A,
} from '../../__tests__/fixtures/messaging-test.data';

const PROMPT_ID = idNumber(1);
const PHOTO_ID = idNumber(4);
const TEN_MINUTES_LATER = new Date(
    NOW.getTime() + 10 * MILLISECONDS_PER_MINUTE,
);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe('Feature: a partner answers the photo prompt of the day (R8)', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const answer = (
        context: ExecutionContext = AS_A,
        photoPromptId = PROMPT_ID,
        content = JPEG_PHOTO,
    ) =>
        ctx
            .answerPhotoPromptUseCase()
            .execute(context, { photoPromptId, content });

    const refusedWith = async (code: string, promise: Promise<unknown>) => {
        await expect(promise).rejects.toMatchObject({ code });
    };

    describe('Scenario: R8, the prompt was issued at NOW', () => {
        beforeEach(() => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
        });

        it('sends the photo of the day on time, ten minutes after the prompt', async () => {
            ctx.dateTimeProvider.setNow(TEN_MINUTES_LATER);
            await expect(answer()).resolves.toEqual({
                type: 'INSTANT_PHOTO',
                id: PHOTO_ID,
                ownerId: PARTNER_A,
                isOwner: true,
                sentAt: TEN_MINUTES_LATER,
                photoPromptId: PROMPT_ID,
                isLate: false,
                isHidden: false,
                contentType: JPEG,
            });
        });

        it('stores it late one millisecond after the ten minutes', async () => {
            ctx.dateTimeProvider.setNow(
                new Date(TEN_MINUTES_LATER.getTime() + 1),
            );
            await answer();
            expect(ctx.instantPhotoRepository.storedSnapshots).toEqual([
                {
                    id: PHOTO_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    contentType: JPEG,
                    photoPromptId: PROMPT_ID,
                    isLate: true,
                    version: 1,
                    metadata: {
                        createdAt: '2026-11-24T10:10:00.001Z',
                        updatedAt: '2026-11-24T10:10:00.001Z',
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('stores its bytes and persists then publishes one sent event', async () => {
            await answer();
            const key = `${COUPLE_ID}/instant-photos/${PHOTO_ID}`;
            await expect(ctx.fileStorage.read(key)).resolves.toEqual({
                key,
                content: JPEG_PHOTO,
                contentType: JPEG,
            });
            const expected = [
                {
                    eventId: idNumber(5),
                    eventName: InstantPhotoSentEvent.EVENT_NAME,
                    aggregateId: PHOTO_ID,
                    context: AS_A,
                    data: { ownerId: PARTNER_A },
                    occurredAt: NOW,
                },
            ];
            expect(ctx.instantPhotoRepository.persistedEvents).toEqual(
                expected,
            );
            expect(ctx.eventPublisher.published).toEqual(expected);
        });

        it('accepts the photo of each partner', async () => {
            await answer(AS_A);
            await answer(AS_B);
            expect(ctx.instantPhotoRepository.storedSnapshots).toHaveLength(2);
        });

        it('refuses a second photo of the day of the same partner', async () => {
            await answer();
            await refusedWith(
                MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
                answer(),
            );
            expect(ctx.instantPhotoRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.eventPublisher.published).toHaveLength(1);
        });

        it('accepts another photo once the first is withdrawn, which no longer counts', async () => {
            await answer();
            await ctx
                .withdrawInstantPhotoUseCase()
                .execute(AS_A, { instantPhotoId: PHOTO_ID });
            await expect(answer()).resolves.toMatchObject({ isHidden: false });
        });

        it('accepts a photo one millisecond before midnight', async () => {
            ctx.dateTimeProvider.setNow(new Date(MIDNIGHT.getTime() - 1));
            await expect(answer()).resolves.toMatchObject({ isLate: true });
        });

        it('refuses a photo at midnight, the prompt has passed', async () => {
            ctx.dateTimeProvider.setNow(MIDNIGHT);
            await refusedWith(
                MessagingExceptionCodeEnum.PHOTO_PROMPT_EXPIRED,
                answer(),
            );
            expect(ctx.instantPhotoRepository.storedSnapshots).toEqual([]);
        });

        it('answers not found to another couple (core.md rule 27)', async () => {
            await refusedWith(
                MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
                answer(AS_STRANGER),
            );
        });

        it('refuses a file that is not an accepted photo, and stores nothing', async () => {
            await refusedWith(
                MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
                answer(AS_A, PROMPT_ID, GIF),
            );
            expect(ctx.instantPhotoRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R7, a prompt that is not issued or does not exist', () => {
        it('answers not found before the prompt is issued, its time stays secret', async () => {
            ctx.dateTimeProvider.setNow(new Date('2026-11-24T06:00:00.000Z'));
            ctx.givenPhotoPromptOf(COUPLE_ID, false);
            await refusedWith(
                MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
                answer(),
            );
        });

        it('answers not found to an unknown prompt', async () => {
            await refusedWith(
                MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
                answer(),
            );
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the photo of the day and its event, and logs one warning', async () => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
            ctx.eventPublisher.failWith(new Error('bus down'));
            await answer();
            expect(ctx.instantPhotoRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
