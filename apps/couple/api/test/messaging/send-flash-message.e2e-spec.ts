import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { FlashMessageSentEvent } from '@cocooning/couple-server-business-logic/messaging';
import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    COUPLE_ID,
    feedItemOf,
    LOVE,
    NOW,
    PARTNER_A,
    refusal,
} from './messaging-test-data';

describe('Feature: a partner sends a flash message (R1, R2)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    describe('Scenario: a partner of a formed couple', () => {
        it('answers 201 with the word, owned by its author, without the surrounding spaces', async () => {
            const response = await messaging.sendFlashMessage(
                PARTNER_A,
                `  ${LOVE} `,
            );
            expect(response).toEqual({
                status: 201,
                body: {
                    type: 'FLASH_MESSAGE',
                    id: feedItemOf(response).id,
                    ownerId: PARTNER_A,
                    isOwner: true,
                    sentAt: NOW.toISOString(),
                    text: LOVE,
                },
            });
        });

        it('writes its outbox row, without the text', async () => {
            const id = await messaging.sentFlashMessageId(PARTNER_A);
            expect(await readMessagingEvents(messaging.prisma, id)).toEqual([
                {
                    eventName: FlashMessageSentEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: id,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: { ownerId: PARTNER_A },
                },
            ]);
        });
    });

    describe('Scenario: R2, a word the contract refuses', () => {
        it.each([
            ['an empty word', '   '],
            ['a word too long', 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1)],
        ])('refuses %s with 422', async (_label, text) => {
            const response = await messaging.sendFlashMessage(PARTNER_A, text);
            expect(response.status).toBe(422);
        });
    });

    describe('Scenario: R4, a partner without a formed couple', () => {
        it('refuses with 404 MESSAGING_COUPLE_NOT_PAIRED', async () => {
            expect(await messaging.sendFlashMessage(ALONE)).toEqual(
                refusal(
                    404,
                    MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
                    'The messages need a formed couple',
                ),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await messaging
                .unauthenticated()
                .post(ApiRouterEnum.FLASH_MESSAGE_SEND, { text: LOVE });
            expect(response).toEqual(
                refusal(
                    401,
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
                    'Session missing',
                ),
            );
        });
    });
});
