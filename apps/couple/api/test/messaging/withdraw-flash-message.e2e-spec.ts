import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { FlashMessageWithdrawnEvent } from '@cocooning/couple-server-business-logic/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    UNKNOWN_ID,
} from './messaging-test-data';

const notFound = refusal(
    404,
    MessagingExceptionCodeEnum.FLASH_MESSAGE_NOT_FOUND,
    'Flash message not found',
);

describe('Feature: the author withdraws a flash message (R6)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(() => messaging.reset());

    it('answers 204 and removes the word from the feed of both partners', async () => {
        const id = await messaging.sentFlashMessageId(PARTNER_A);
        expect(await messaging.withdrawFlashMessage(PARTNER_A, id)).toEqual({
            status: 204,
            body: null,
        });
        expect((await messaging.feed(PARTNER_B)).body).toEqual({
            items: [],
            nextCursor: null,
        });
        const events = await readMessagingEvents(messaging.prisma, id);
        expect(
            events.map(({ eventName, version }) => [eventName, version]),
        ).toContainEqual([FlashMessageWithdrawnEvent.EVENT_NAME, 2]);
    });

    it('keeps the row, softly withdrawn', async () => {
        const id = await messaging.sentFlashMessageId(PARTNER_A);
        await messaging.withdrawFlashMessage(PARTNER_A, id);
        const row =
            await messaging.prisma.includingDeleted.flashMessage.findFirst({
                where: { id },
            });
        expect(row?.deletedAt).not.toBeNull();
    });

    it('refuses the other partner with 403, and keeps the word', async () => {
        const id = await messaging.sentFlashMessageId(PARTNER_A);
        expect(await messaging.withdrawFlashMessage(PARTNER_B, id)).toEqual(
            refusal(
                403,
                MessagingExceptionCodeEnum.FLASH_MESSAGE_RESERVED_TO_OWNER,
                'Reserved to the author of the flash message',
            ),
        );
        expect((await messaging.feed(PARTNER_A)).body).toMatchObject({
            items: [{ id }],
        });
    });

    it('answers 404 to another couple, to an unknown word and once withdrawn', async () => {
        const id = await messaging.sentFlashMessageId(PARTNER_A);
        expect(await messaging.withdrawFlashMessage(STRANGER, id)).toEqual(
            notFound,
        );
        expect(
            await messaging.withdrawFlashMessage(PARTNER_A, UNKNOWN_ID),
        ).toEqual(notFound);
        await messaging.withdrawFlashMessage(PARTNER_A, id);
        expect(await messaging.withdrawFlashMessage(PARTNER_A, id)).toEqual(
            notFound,
        );
    });
});
