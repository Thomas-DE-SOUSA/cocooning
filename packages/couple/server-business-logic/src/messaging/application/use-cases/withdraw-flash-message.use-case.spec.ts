import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { FlashMessageWithdrawnEvent } from '../../domain/events/flash-message-withdrawn.event';
import { FlashMessage } from '../../domain/models/flash-message.aggregate';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    FIRST_ID,
    idNumber,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/messaging-test.data';

const WITHDRAWN_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const UNKNOWN_ID = idNumber(99);

describe('Feature: withdraw a flash message', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const withdraw = (context: ExecutionContext, flashMessageId = FIRST_ID) =>
        ctx.withdrawFlashMessageUseCase().execute(context, { flashMessageId });

    describe('Scenario: R6, the author withdraws their word', () => {
        it('withdraws it softly, for both partners', async () => {
            ctx.givenFlashMessageOf(AS_A);
            ctx.advanceHours(1);
            await withdraw(AS_A);
            expect(ctx.flashMessageRepository.storedSnapshots[0]).toMatchObject(
                {
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: WITHDRAWN_AT.toISOString(),
                        deletedAt: WITHDRAWN_AT.toISOString(),
                    },
                },
            );
        });

        it('persists then publishes one withdrawn event', async () => {
            ctx.givenFlashMessageOf(AS_A);
            ctx.advanceHours(1);
            await withdraw(AS_A);
            const expected = {
                eventId: idNumber(3),
                eventName: FlashMessageWithdrawnEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: null,
                occurredAt: WITHDRAWN_AT,
            };
            expect(ctx.flashMessageRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('answers not found once withdrawn', async () => {
            ctx.givenFlashMessageOf(AS_A);
            await withdraw(AS_A);
            await expect(withdraw(AS_A)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R6, the other partner tries to withdraw it', () => {
        it('refuses, and changes nothing', async () => {
            ctx.givenFlashMessageOf(AS_A);
            await expect(withdraw(AS_B)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_RESERVED_TO_OWNER,
            });
            expect(ctx.flashMessageRepository.storedSnapshots[0]).toMatchObject(
                {
                    version: 1,
                    metadata: { deletedAt: null },
                },
            );
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: a word the partner cannot reach', () => {
        it.each([
            ['a word of another couple', AS_STRANGER, FIRST_ID],
            ['an unknown word', AS_A, UNKNOWN_ID],
        ])('answers not found for %s', async (_label, context, id) => {
            ctx.givenFlashMessageOf(AS_A);
            await expect(withdraw(context, id)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_NOT_FOUND,
            });
            expect(ctx.flashMessageRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: the word changed since it was read', () => {
        it('refuses with a version conflict', async () => {
            const flashMessage = ctx.givenFlashMessageOf(AS_A);
            const concurrent = FlashMessage.fromSnapshot(
                flashMessage.toSnapshot(),
            );
            concurrent.withdraw(AS_A.userId, NOW);
            ctx.flashMessageRepository.simulateConcurrentSave(concurrent);
            await expect(withdraw(AS_A)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_VERSION_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
