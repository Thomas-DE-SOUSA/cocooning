import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    idNumber,
    MIDNIGHT,
    NOW,
} from '../../__tests__/fixtures/messaging-test.data';

const PROMPT_ID = idNumber(1);
const ISSUED_TODAY = {
    id: PROMPT_ID,
    issuedAt: NOW,
    lateFrom: new Date('2026-11-24T10:10:00.000Z'),
    closesAt: MIDNIGHT,
};

describe("Feature: a partner reads today's photo prompt (R7, R8)", () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
    });
    afterEach(() => FlashMessageId.resetForTests());

    const today = (context: ExecutionContext) =>
        ctx.getTodayPhotoPromptUseCase().execute(context);

    describe('Scenario: R7, no prompt is issued yet', () => {
        it('answers null when none is drawn', async () => {
            await expect(today(AS_A)).resolves.toEqual({ photoPrompt: null });
        });

        it('answers null while the drawn time is still secret', async () => {
            ctx.dateTimeProvider.setNow(new Date('2026-11-24T06:00:00.000Z'));
            ctx.givenPhotoPromptOf(COUPLE_ID, false);
            await expect(today(AS_A)).resolves.toEqual({ photoPrompt: null });
        });

        it("answers null the next day, yesterday's prompt has passed", async () => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
            ctx.dateTimeProvider.setNow(MIDNIGHT);
            await expect(today(AS_A)).resolves.toEqual({ photoPrompt: null });
        });

        it('answers null to another couple (core.md rule 27)', async () => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
            await expect(today(AS_STRANGER)).resolves.toEqual({
                photoPrompt: null,
            });
        });
    });

    describe('Scenario: R8, the prompt is issued', () => {
        it('tells when it was issued, turns late and closes, nobody has answered', async () => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
            await expect(today(AS_A)).resolves.toEqual({
                photoPrompt: {
                    ...ISSUED_TODAY,
                    myInstantPhotoId: null,
                    isAnsweredByPartner: false,
                },
            });
        });

        it('tells each partner who has answered', async () => {
            const photoPrompt = ctx.givenPhotoPromptOf(COUPLE_ID);
            const photo = await ctx.givenPhotoOfTheDayOf(AS_A, photoPrompt);
            await expect(today(AS_A)).resolves.toEqual({
                photoPrompt: {
                    ...ISSUED_TODAY,
                    myInstantPhotoId: photo.id.getValue(),
                    isAnsweredByPartner: false,
                },
            });
            await expect(today(AS_B)).resolves.toEqual({
                photoPrompt: {
                    ...ISSUED_TODAY,
                    myInstantPhotoId: null,
                    isAnsweredByPartner: true,
                },
            });
        });
    });
});
