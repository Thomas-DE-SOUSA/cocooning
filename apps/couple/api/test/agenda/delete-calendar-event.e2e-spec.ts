import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarEventDeletedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    DECEMBER,
    DINNER,
    PRIVATE_DINNER,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './agenda-test-data';

describe('Feature: a partner deletes a calendar event (R9)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    it('lets the other partner delete a shared event, for both, with 204', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        expect(await agenda.delete(PARTNER_B, calendarEventId)).toEqual({
            status: 204,
            body: null,
        });
        expect((await agenda.list(PARTNER_A, DECEMBER)).body).toEqual({
            items: [],
        });
        expect((await agenda.get(PARTNER_A, calendarEventId)).status).toBe(404);
        const events = await readAgendaEvents(agenda.prisma, calendarEventId);
        expect(events.map(({ eventName }) => eventName)).toContain(
            CalendarEventDeletedEvent.EVENT_NAME,
        );
    });

    it('keeps the row, softly deleted', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        await agenda.delete(PARTNER_A, calendarEventId);
        const row =
            await agenda.prisma.includingDeleted.calendarEvent.findFirst({
                where: { id: calendarEventId },
            });
        expect(row?.deletedAt).not.toBeNull();
    });

    it('answers 404 to the other partner on a private event, and to another couple', async () => {
        const calendarEventId = await agenda.createdId(
            PARTNER_A,
            PRIVATE_DINNER,
        );
        expect((await agenda.delete(PARTNER_B, calendarEventId)).status).toBe(
            404,
        );
        expect((await agenda.delete(STRANGER, calendarEventId)).status).toBe(
            404,
        );
        expect((await agenda.get(PARTNER_A, calendarEventId)).status).toBe(200);
    });
});
