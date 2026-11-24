import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { CalendarEvent } from '../../domain/models/calendar-event.aggregate';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NOW,
    PARTNER_A,
    WEEKEND,
} from '../../__tests__/fixtures/agenda-test.data';

describe('Feature: open one calendar event', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const open = (context: ExecutionContext, calendarEvent: CalendarEvent) =>
        ctx
            .getCalendarEventUseCase()
            .execute(context, { calendarEventId: calendarEvent.id.getValue() });

    describe('Scenario: R7, an event the partner sees', () => {
        it('gives the shared event to the other partner, who is not its author', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A, WEEKEND);
            await expect(open(AS_B, calendarEvent)).resolves.toEqual({
                calendarEventId: calendarEvent.id.getValue(),
                ownerId: PARTNER_A,
                isOwner: false,
                ...WEEKEND,
                visibility: CalendarEventVisibilityEnum.SHARED,
                updatedAt: NOW,
            });
        });

        it('gives the author their private event', async () => {
            const view = await open(AS_A, ctx.givenPrivateEventOf(AS_A));
            expect(view.isOwner).toBe(true);
            expect(view.visibility).toBe(CalendarEventVisibilityEnum.PRIVATE);
        });
    });

    describe('Scenario: R7, an event the partner does not see', () => {
        it.each([
            ['the other partner on a private event', AS_B],
            ['another couple', AS_STRANGER],
        ])(
            'refuses %s, as if the event did not exist',
            async (_label, context) => {
                const calendarEvent = ctx.givenPrivateEventOf(AS_A);
                await expect(
                    open(context, calendarEvent),
                ).rejects.toMatchObject({
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
                });
            },
        );
    });
});
