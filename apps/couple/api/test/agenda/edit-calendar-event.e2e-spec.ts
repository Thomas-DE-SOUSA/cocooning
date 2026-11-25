import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { readAgendaEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CalendarEventEditedEvent } from '@cocooning/couple-server-business-logic/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    COUPLE_ID,
    DINNER,
    PRIVATE_DINNER,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    WEEKEND,
    WEEKEND_DETAILS,
} from './agenda-test-data';

const EDITED_AT = new Date(NOW.getTime() + 60_000);

describe('Feature: a partner edits a calendar event (R9)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    describe('Scenario: the other partner edits a shared event', () => {
        it('answers 200 with every detail changed, the author kept', async () => {
            const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
            agenda.clock.setNow(EDITED_AT);
            expect(
                await agenda.edit(PARTNER_B, calendarEventId, WEEKEND_DETAILS),
            ).toEqual({
                status: 200,
                body: {
                    calendarEventId,
                    ownerId: PARTNER_A,
                    isOwner: false,
                    ...WEEKEND,
                    updatedAt: EDITED_AT.toISOString(),
                },
            });
        });

        it('appends an edited row to the outbox, without the details', async () => {
            const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
            await agenda.edit(PARTNER_B, calendarEventId, WEEKEND_DETAILS);
            const events = await readAgendaEvents(
                agenda.prisma,
                calendarEventId,
            );
            expect(events[1]).toEqual({
                eventName: CalendarEventEditedEvent.EVENT_NAME,
                coupleId: COUPLE_ID,
                aggregateId: calendarEventId,
                userId: PARTNER_B,
                version: 2,
                published: false,
                eventData: null,
            });
        });
    });

    describe('Scenario: R7, an event the partner cannot see', () => {
        it.each([
            ['the other partner on a private event', PARTNER_B],
            ['another couple', STRANGER],
        ])('answers 404 to %s', async (_label, userId) => {
            const calendarEventId = await agenda.createdId(
                PARTNER_A,
                PRIVATE_DINNER,
            );
            const response = await agenda.edit(
                userId,
                calendarEventId,
                WEEKEND_DETAILS,
            );
            expect(response.status).toBe(404);
        });
    });

    describe('Scenario: R11, who a private event is for', () => {
        it('keeps it for its author', async () => {
            const calendarEventId = await agenda.createdId(
                PARTNER_A,
                PRIVATE_DINNER,
            );
            const response = await agenda.edit(PARTNER_A, calendarEventId, {
                ...WEEKEND_DETAILS,
                audience: 'OWNER',
            });
            expect(response.body).toMatchObject({
                visibility: 'PRIVATE',
                audience: 'OWNER',
            });
        });

        it('refuses with 422 another audience, and changes nothing', async () => {
            const calendarEventId = await agenda.createdId(
                PARTNER_A,
                PRIVATE_DINNER,
            );
            const response = await agenda.edit(PARTNER_A, calendarEventId, {
                ...WEEKEND_DETAILS,
                audience: 'BOTH',
            });
            expect(response).toEqual(
                refusal(
                    422,
                    AgendaExceptionCodeEnum.CALENDAR_EVENT_AUDIENCE_INVALID,
                    'A private calendar event is for its author only',
                ),
            );
            expect(
                (await agenda.get(PARTNER_A, calendarEventId)).body,
            ).toMatchObject({ title: DINNER.title, audience: 'OWNER' });
        });
    });

    describe('Scenario: R5, a last day before the first', () => {
        it('refuses with 422', async () => {
            const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
            const response = await agenda.edit(PARTNER_A, calendarEventId, {
                ...WEEKEND_DETAILS,
                endsOn: '2026-12-11',
            });
            expect(response.status).toBe(422);
        });
    });
});
