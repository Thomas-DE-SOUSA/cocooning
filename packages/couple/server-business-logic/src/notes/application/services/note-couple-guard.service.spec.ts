import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    COUPLE_ID,
    NotesTestContext,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: the couple of the notes (decision 0041)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    it('gives the execution context of a partner of a formed couple', async () => {
        ctx.pairedCoupleProvider.givenPairedCouple(COUPLE_ID, [
            PARTNER_A,
            PARTNER_B,
        ]);
        await expect(
            ctx
                .noteCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_B }),
        ).resolves.toEqual({ coupleId: COUPLE_ID, userId: PARTNER_B });
    });

    it('refuses a partner without a formed couple (R3)', async () => {
        await expect(
            ctx
                .noteCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_A }),
        ).rejects.toMatchObject({
            code: NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
        });
    });
});
