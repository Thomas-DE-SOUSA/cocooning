import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    CalendarEventMadePrivateEvent,
    CalendarEventSharedEvent,
} from '@cocooning/couple-server-business-logic/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    DECEMBER,
    DINNER,
    PARTNER_A,
    PARTNER_B,
    refusal,
} from './agenda-test-data';

const RESERVED = refusal(
    403,
    AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER,
    'Reserved to the author of the calendar event',
);

describe('Feature: the author changes the visibility of a calendar event (R8)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    it('makes an event private, then shares it again, with one outbox row each', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        const madePrivate = await agenda.makePrivate(
            PARTNER_A,
            calendarEventId,
        );
        expect(madePrivate.status).toBe(200);
        expect(madePrivate.body).toMatchObject({ visibility: 'PRIVATE' });
        expect((await agenda.list(PARTNER_B, DECEMBER)).body).toEqual({
            items: [],
        });
        const shared = await agenda.share(PARTNER_A, calendarEventId);
        expect(shared.body).toMatchObject({ visibility: 'SHARED' });
        const events = await readAgendaEvents(agenda.prisma, calendarEventId);
        expect(events.map(({ eventName }) => eventName).slice(1)).toEqual([
            CalendarEventMadePrivateEvent.EVENT_NAME,
            CalendarEventSharedEvent.EVENT_NAME,
        ]);
    });

    it('refuses the other partner with 403 on a shared event', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        expect(await agenda.makePrivate(PARTNER_B, calendarEventId)).toEqual(
            RESERVED,
        );
        expect(await agenda.share(PARTNER_B, calendarEventId)).toEqual(
            RESERVED,
        );
    });

    it('answers 404 to the other partner on a private event (R7)', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, {
            ...DINNER,
            visibility: 'PRIVATE',
        });
        expect((await agenda.share(PARTNER_B, calendarEventId)).status).toBe(
            404,
        );
    });
});
