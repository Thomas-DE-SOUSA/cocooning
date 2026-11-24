import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CALENDAR_EVENT_RANGE_MAX_DAYS } from '@cocooning/couple-shared-kernel/limits';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    WEEKEND,
} from '../../__tests__/fixtures/agenda-test.data';

const DECEMBER = { from: '2026-12-01', to: '2026-12-31' };

describe('Feature: list the calendar events over a range of days', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const titlesSeenBy = async (
        context: ExecutionContext,
        range: { from: string; to: string } = DECEMBER,
    ) =>
        (await ctx.listCalendarEventsUseCase().execute(context, range)).map(
            ({ title }) => title,
        );

    describe('Scenario: R7, the events of both partners', () => {
        it('shows the shared events of both and the own private ones, in day order', async () => {
            ctx.givenEventOf(AS_B, {
                title: 'Ciné',
                startsOn: '2026-12-05',
                startsAt: '21:00',
            });
            ctx.givenPrivateEventOf(AS_A, {
                title: 'Bijoutier',
                startsOn: '2026-12-05',
                startsAt: '10:00',
            });
            ctx.givenEventOf(AS_A, {
                title: 'Marché',
                startsOn: '2026-12-05',
                startsAt: null,
            });
            ctx.givenEventOf(AS_A, {
                title: 'Noël',
                startsOn: '2026-12-24',
                startsAt: null,
            });

            expect(await titlesSeenBy(AS_A)).toEqual([
                'Marché',
                'Bijoutier',
                'Ciné',
                'Noël',
            ]);
            expect(await titlesSeenBy(AS_B)).toEqual([
                'Marché',
                'Ciné',
                'Noël',
            ]);
        });

        it('gives each event its author, so the PWA can colour it', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            const [view] = await ctx
                .listCalendarEventsUseCase()
                .execute(AS_B, DECEMBER);
            expect(view).toMatchObject({
                calendarEventId: calendarEvent.id.getValue(),
                ownerId: AS_A.userId,
                isOwner: false,
            });
        });

        it('hides a deleted event', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            calendarEvent.delete(AS_A.userId, ctx.dateTimeProvider.now());
            ctx.calendarEventRepository.seed(calendarEvent);
            expect(await titlesSeenBy(AS_A)).toEqual([]);
        });

        it('shows nothing of the couple to another couple (core.md rule 27)', async () => {
            ctx.givenEventOf(AS_A);
            expect(await titlesSeenBy(AS_STRANGER)).toEqual([]);
        });
    });

    describe('Scenario: R5, an event over several days', () => {
        it.each([
            ['its first day', { from: '2026-12-12', to: '2026-12-12' }],
            ['its last day', { from: '2026-12-13', to: '2026-12-13' }],
            ['a range around it', { from: '2026-12-01', to: '2026-12-31' }],
        ])('shows it on %s', async (_label, range) => {
            ctx.givenEventOf(AS_A, WEEKEND);
            expect(await titlesSeenBy(AS_A, range)).toEqual([WEEKEND.title]);
        });

        it.each([
            ['the day before', { from: '2026-12-11', to: '2026-12-11' }],
            ['the day after', { from: '2026-12-14', to: '2026-12-14' }],
        ])('hides it on %s', async (_label, range) => {
            ctx.givenEventOf(AS_A, WEEKEND);
            expect(await titlesSeenBy(AS_A, range)).toEqual([]);
        });
    });

    describe('Scenario: the range of days', () => {
        it(`reads at most ${CALENDAR_EVENT_RANGE_MAX_DAYS} days, both included`, async () => {
            ctx.givenEventOf(AS_A, { startsOn: '2027-01-31' });
            expect(
                await titlesSeenBy(AS_A, {
                    from: '2026-12-01',
                    to: '2027-01-31',
                }),
            ).toHaveLength(1);
        });

        it.each([
            ['one day too many', '2026-12-01', '2027-02-01'],
            ['a last day before the first', '2026-12-02', '2026-12-01'],
            ['a first day that does not exist', '2026-02-29', '2026-03-01'],
            ['a last day that is not a day', '2026-12-01', 'demain'],
        ])('refuses %s', async (_label, from, to) => {
            await expect(
                ctx.listCalendarEventsUseCase().execute(AS_A, { from, to }),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RANGE_INVALID,
                context: { max: CALENDAR_EVENT_RANGE_MAX_DAYS },
            });
        });
    });
});
