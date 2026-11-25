import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarLabelDeletedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './agenda-test-data';

describe('Feature: a partner deletes a label of the couple (R12, R14)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    it('answers 204, takes it out of the list and writes its outbox row', async () => {
        const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
        expect(await agenda.deleteLabel(PARTNER_B, calendarLabelId)).toEqual({
            status: 204,
            body: null,
        });
        expect((await agenda.listLabels(PARTNER_A)).body).toEqual({
            items: [],
        });
        const events = await readAgendaEvents(agenda.prisma, calendarLabelId);
        expect(events[1]).toEqual({
            eventName: CalendarLabelDeletedEvent.EVENT_NAME,
            coupleId: COUPLE_ID,
            aggregateId: calendarLabelId,
            userId: PARTNER_B,
            version: 2,
            published: false,
            eventData: null,
        });
    });

    it('answers 404 to another couple, and keeps the label', async () => {
        const calendarLabelId = await agenda.createdLabelId(PARTNER_A);
        expect(await agenda.deleteLabel(STRANGER, calendarLabelId)).toEqual(
            refusal(
                404,
                AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
                'Calendar label not found',
            ),
        );
        expect((await agenda.listLabels(PARTNER_A)).body).toMatchObject({
            items: [{ calendarLabelId }],
        });
    });
});
