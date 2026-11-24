import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/agenda-test.data';

describe('Feature: the couple of the agenda (decision 0041)', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    it('gives the execution context of a partner of a formed couple', async () => {
        ctx.pairedCoupleProvider.givenPairedCouple(COUPLE_ID, [
            PARTNER_A,
            PARTNER_B,
        ]);
        await expect(
            ctx
                .agendaCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_B }),
        ).resolves.toEqual({ coupleId: COUPLE_ID, userId: PARTNER_B });
    });

    it('refuses a partner without a formed couple (R4)', async () => {
        await expect(
            ctx
                .agendaCoupleGuardService()
                .resolveExecutionContext({ userId: PARTNER_A }),
        ).rejects.toMatchObject({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
        });
    });
});
