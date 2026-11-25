import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/messaging-test.data';

describe('Feature: the couple of the messages (decision 0041)', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    it('gives the execution context of a partner of a formed couple', async () => {
        ctx.pairedCoupleProvider.givenPairedCouple(COUPLE_ID, [
            PARTNER_A,
            PARTNER_B,
        ]);
        await expect(
            ctx
                .messagingCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_B }),
        ).resolves.toEqual({ coupleId: COUPLE_ID, userId: PARTNER_B });
    });

    it('refuses a partner without a formed couple (R4)', async () => {
        await expect(
            ctx
                .messagingCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_A }),
        ).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
        });
    });
});
