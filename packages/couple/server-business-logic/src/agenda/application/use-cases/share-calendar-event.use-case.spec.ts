import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarEventSharedEvent } from '../../domain/events/calendar-event-shared.event';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/agenda-test.data';

const CHANGED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: share a calendar event', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const run = (context: ExecutionContext, calendarEventId: string) =>
        ctx.shareCalendarEventUseCase().execute(context, { calendarEventId });

    describe('Scenario: R8, the author shares a private event', () => {
        it('changes the visibility and records one event', async () => {
            const calendarEvent = ctx.givenPrivateEventOf(AS_A);
            ctx.advanceHours(1);
            const view = await run(AS_A, calendarEvent.id.getValue());
            expect(view.visibility).toBe(CalendarEventVisibilityEnum.SHARED);
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({
                visibility: CalendarEventVisibilityEnum.SHARED,
                version: 2,
                metadata: { updatedAt: CHANGED_AT.toISOString() },
            });
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarEventSharedEvent.EVENT_NAME,
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
    });

    describe('Scenario: R8, the other partner tries on a shared event', () => {
        it('refuses, reserved to the author, and changes nothing', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            await expect(
                run(AS_B, calendarEvent.id.getValue()),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER,
            });
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R7, the other partner tries on a private event', () => {
        it('answers not found', async () => {
            const calendarEvent = ctx.givenPrivateEventOf(AS_A);
            await expect(
                run(AS_B, calendarEvent.id.getValue()),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
            });
        });
    });
});
