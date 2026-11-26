import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_RANGE_MAX_DAYS } from '@cocooning/couple-shared-kernel/limits';
import { AgendaTestApp } from './agenda-test-app';
import {
    ALONE,
    type CalendarEventBody,
    DECEMBER,
    DINNER,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
    WEEKEND,
} from './agenda-test-data';

const SURPRISE: CalendarEventBody = {
    ...DINNER,
    title: 'Bijoutier',
    startsAt: '10:00',
    endsAt: null,
    audience: 'OWNER',
    visibility: 'PRIVATE',
};

describe('Feature: a partner lists the calendar events of a range of days (R7)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    const titlesSeenBy = async (
        userId: string,
        range: { from: string; to: string } = DECEMBER,
    ): Promise<string[]> => {
        const response = await agenda.list(userId, range);
        expect(response.status).toBe(200);
        const { items } = response.body as { items: { title: string }[] };
        return items.map(({ title }) => title);
    };

    describe('Scenario: the events of both partners', () => {
        beforeEach(async () => {
            await agenda.create(PARTNER_B, DINNER);
            await agenda.create(PARTNER_A, SURPRISE);
            await agenda.create(PARTNER_A, WEEKEND);
        });

        it('shows the author both shared events and their own private one, in day order', async () => {
            expect(await titlesSeenBy(PARTNER_A)).toEqual([
                'Bijoutier',
                'Dîner chez Paul',
                'Week-end à Lyon',
            ]);
        });

        it('never shows the private event of the other partner', async () => {
            expect(await titlesSeenBy(PARTNER_B)).toEqual([
                'Dîner chez Paul',
                'Week-end à Lyon',
            ]);
        });

        it('shows nothing of the couple to another couple (core.md rule 27)', async () => {
            expect(await titlesSeenBy(STRANGER)).toEqual([]);
        });

        it('shows an event over several days on its last day only', async () => {
            expect(
                await titlesSeenBy(PARTNER_A, {
                    from: '2026-12-13',
                    to: '2026-12-20',
                }),
            ).toEqual(['Week-end à Lyon']);
        });
    });

    describe('Scenario: a range of days too long', () => {
        it('refuses one day more than the limit with 422 CALENDAR_EVENT_RANGE_INVALID', async () => {
            const response = await agenda.list(PARTNER_A, {
                from: '2026-12-01',
                to: '2027-02-01',
            });
            expect(response).toEqual({
                status: 422,
                body: {
                    status: 422,
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RANGE_INVALID,
                    message: 'Invalid calendar event day range',
                    context: { max: CALENDAR_EVENT_RANGE_MAX_DAYS },
                },
            });
        });

        it('refuses a day that does not exist with 422', async () => {
            const response = await agenda.list(PARTNER_A, {
                from: '2026-02-30',
                to: '2026-03-01',
            });
            expect(response.status).toBe(422);
        });
    });

    describe('Scenario: R4, a partner without a formed couple', () => {
        it('refuses with 404', async () => {
            expect((await agenda.list(ALONE, DECEMBER)).status).toBe(404);
        });
    });
});
