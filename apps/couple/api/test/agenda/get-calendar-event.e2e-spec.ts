import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AgendaTestApp } from './agenda-test-app';
import {
    DINNER,
    PRIVATE_DINNER,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
    UNKNOWN_CALENDAR_EVENT_ID,
} from './agenda-test-data';

const NOT_FOUND = refusal(
    404,
    AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
    'Calendar event not found',
);

describe('Feature: a partner opens one calendar event (R7)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    it('gives a shared event to the other partner, who is not its author', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        expect(await agenda.get(PARTNER_B, calendarEventId)).toEqual({
            status: 200,
            body: {
                calendarEventId,
                ownerId: PARTNER_A,
                isOwner: false,
                ...DINNER,
                updatedAt: NOW.toISOString(),
            },
        });
    });

    it('answers 404 to the other partner on a private event, as if it did not exist', async () => {
        const calendarEventId = await agenda.createdId(
            PARTNER_A,
            PRIVATE_DINNER,
        );
        expect((await agenda.get(PARTNER_A, calendarEventId)).status).toBe(200);
        expect(await agenda.get(PARTNER_B, calendarEventId)).toEqual(NOT_FOUND);
        expect(await agenda.get(PARTNER_B, UNKNOWN_CALENDAR_EVENT_ID)).toEqual(
            NOT_FOUND,
        );
    });

    it('answers 404 to another couple (core.md rule 27)', async () => {
        const calendarEventId = await agenda.createdId(PARTNER_A, DINNER);
        expect(await agenda.get(STRANGER, calendarEventId)).toEqual(NOT_FOUND);
    });

    it('refuses an identifier that is not a UUID with 422', async () => {
        expect((await agenda.get(PARTNER_A, 'not-a-uuid')).status).toBe(422);
    });
});
