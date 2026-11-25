import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    CalendarEventAudienceEnum,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarEventMadePrivateEvent } from '../../domain/events/calendar-event-made-private.event';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/agenda-test.data';

const CHANGED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const DECEMBER = { from: '2026-12-01', to: '2026-12-31' };
const FOR_ITS_AUTHOR = { audience: CalendarEventAudienceEnum.OWNER };

describe('Feature: keep a calendar event "rien que pour moi"', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const run = (context: ExecutionContext, calendarEventId: string) =>
        ctx
            .makeCalendarEventPrivateUseCase()
            .execute(context, { calendarEventId });

    describe('Scenario: R7, R8, the author makes a shared event private', () => {
        it('changes the visibility and records one event', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A, FOR_ITS_AUTHOR);
            ctx.advanceHours(1);
            const view = await run(AS_A, calendarEvent.id.getValue());
            expect(view.visibility).toBe(CalendarEventVisibilityEnum.PRIVATE);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarEventMadePrivateEvent.EVENT_NAME,
                aggregateId: calendarEvent.id.getValue(),
                context: AS_A,
                data: null,
                occurredAt: CHANGED_AT,
            };
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('hides the event from the other partner', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A, FOR_ITS_AUTHOR);
            await run(AS_A, calendarEvent.id.getValue());
            await expect(
                ctx.listCalendarEventsUseCase().execute(AS_B, DECEMBER),
            ).resolves.toEqual([]);
        });
    });

    describe('Scenario: R11, a shared event that is not for its author only', () => {
        it.each([
            [CalendarEventAudienceEnum.PARTNER],
            [CalendarEventAudienceEnum.BOTH],
        ])(
            'refuses to make an event for %s private, and changes nothing',
            async (audience) => {
                const calendarEvent = ctx.givenEventOf(AS_A, { audience });
                await expect(
                    run(AS_A, calendarEvent.id.getValue()),
                ).rejects.toMatchObject({
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_AUDIENCE_INVALID,
                });
                expect(
                    ctx.calendarEventRepository.storedSnapshots[0],
                ).toMatchObject({
                    visibility: CalendarEventVisibilityEnum.SHARED,
                    version: 1,
                });
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });

    describe('Scenario: R8, the other partner tries on a shared event', () => {
        it('refuses, reserved to the author, and changes nothing', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            await expect(
                run(AS_B, calendarEvent.id.getValue()),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER,
            });
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({
                visibility: CalendarEventVisibilityEnum.SHARED,
                version: 1,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
