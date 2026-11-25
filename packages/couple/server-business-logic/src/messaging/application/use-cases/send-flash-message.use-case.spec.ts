import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { FlashMessageSentEvent } from '../../domain/events/flash-message-sent.event';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    COUPLE_ID,
    FIRST_ID,
    idNumber,
    LOVE,
    NOW,
    PARTNER_A,
} from '../../__tests__/fixtures/messaging-test.data';

describe('Feature: send a flash message', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const send = (text: string) =>
        ctx.sendFlashMessageUseCase().execute(AS_A, { text });

    describe('Scenario: R1, R2, a partner sends a word', () => {
        it('returns the word, owned by its author, without the surrounding spaces', async () => {
            await expect(send(`  ${LOVE} `)).resolves.toEqual({
                type: 'FLASH_MESSAGE',
                id: FIRST_ID,
                ownerId: PARTNER_A,
                isOwner: true,
                sentAt: NOW,
                text: LOVE,
            });
        });

        it('stores the word in its couple, at version 1', async () => {
            await send(LOVE);
            expect(ctx.flashMessageRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ID,
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    text: LOVE,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one sent event, without the text', async () => {
            await send(LOVE);
            const expected = {
                eventId: idNumber(2),
                eventName: FlashMessageSentEvent.EVENT_NAME,
                aggregateId: FIRST_ID,
                context: AS_A,
                data: { ownerId: PARTNER_A },
                occurredAt: NOW,
            };
            expect(ctx.flashMessageRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                'aime',
            );
        });
    });

    describe('Scenario: R2, a word out of bounds', () => {
        it.each([
            ['an empty word', '  '],
            ['a word too long', 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1)],
        ])('refuses %s and stores nothing', async (_label, text) => {
            await expect(send(text)).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.FLASH_MESSAGE_TEXT_INVALID,
            });
            expect(ctx.flashMessageRepository.storedSnapshots).toEqual([]);
            expect(ctx.flashMessageRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the word and its event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await send(LOVE);
            expect(ctx.flashMessageRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.flashMessageRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
