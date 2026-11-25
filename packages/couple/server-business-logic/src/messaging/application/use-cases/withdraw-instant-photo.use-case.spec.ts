import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { InstantPhotoWithdrawnEvent } from '../../domain/events/instant-photo-withdrawn.event';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    FIRST_ID,
    idNumber,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/messaging-test.data';

const WITHDRAWN_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const FILE_KEY = `${COUPLE_ID}/instant-photos/${FIRST_ID}`;

describe('Feature: withdraw an instant photo', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const withdraw = (context: ExecutionContext, instantPhotoId = FIRST_ID) =>
        ctx.withdrawInstantPhotoUseCase().execute(context, { instantPhotoId });

    describe('Scenario: R6, the author withdraws their photo', () => {
        it('withdraws it softly and deletes its file', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            ctx.advanceHours(1);
            await withdraw(AS_A);
            expect(ctx.instantPhotoRepository.storedSnapshots[0]).toMatchObject(
                {
                    version: 2,
                    metadata: {
                        updatedAt: WITHDRAWN_AT.toISOString(),
                        deletedAt: WITHDRAWN_AT.toISOString(),
                    },
                },
            );
            await expect(ctx.fileStorage.read(FILE_KEY)).resolves.toBeNull();
        });

        it('persists then publishes one withdrawn event', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            ctx.advanceHours(1);
            await withdraw(AS_A);
            const expected = {
                eventId: idNumber(3),
                eventName: InstantPhotoWithdrawnEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: null,
                occurredAt: WITHDRAWN_AT,
            };
            expect(ctx.instantPhotoRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R6, the other partner tries to withdraw it', () => {
        it('refuses, and keeps the photo and its file', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            await expect(withdraw(AS_B)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_RESERVED_TO_OWNER,
            });
            expect(ctx.instantPhotoRepository.storedSnapshots[0]).toMatchObject(
                {
                    metadata: { deletedAt: null },
                },
            );
            await expect(
                ctx.fileStorage.read(FILE_KEY),
            ).resolves.not.toBeNull();
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: a photo the partner cannot reach', () => {
        it.each([
            ['a photo of another couple', AS_STRANGER, FIRST_ID],
            ['an unknown photo', AS_A, idNumber(99)],
        ])(
            'answers not found for %s, and keeps the file',
            async (_label, context, id) => {
                await ctx.givenInstantPhotoOf(AS_A);
                await expect(withdraw(context, id)).rejects.toMatchObject({
                    code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
                });
                await expect(
                    ctx.fileStorage.read(FILE_KEY),
                ).resolves.not.toBeNull();
            },
        );

        it('answers not found once withdrawn', async () => {
            await ctx.givenInstantPhotoOf(AS_A);
            await withdraw(AS_A);
            await expect(withdraw(AS_A)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            });
        });
    });
});
