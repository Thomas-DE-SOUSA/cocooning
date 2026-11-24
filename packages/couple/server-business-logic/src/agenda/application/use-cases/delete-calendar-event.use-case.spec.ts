import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarEventDeletedEvent } from '../../domain/events/calendar-event-deleted.event';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
} from '../../__tests__/fixtures/agenda-test.data';

const DELETED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const DECEMBER = { from: '2026-12-01', to: '2026-12-31' };

describe('Feature: delete a calendar event', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const remove = (context: ExecutionContext, calendarEventId: string) =>
        ctx.deleteCalendarEventUseCase().execute(context, { calendarEventId });

    describe('Scenario: R9, the other partner deletes a shared event', () => {
        it('deletes it softly, for both partners', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            ctx.advanceHours(1);
            await remove(AS_B, calendarEvent.id.getValue());
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({
                version: 2,
                metadata: {
                    updatedAt: DELETED_AT.toISOString(),
                    deletedAt: DELETED_AT.toISOString(),
                },
            });
            await expect(
                ctx.listCalendarEventsUseCase().execute(AS_A, DECEMBER),
            ).resolves.toEqual([]);
        });

        it('persists then publishes one deleted event', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            ctx.advanceHours(1);
            await remove(AS_B, calendarEvent.id.getValue());
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarEventDeletedEvent.EVENT_NAME,
                aggregateId: calendarEvent.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: DELETED_AT,
            };
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('answers not found once deleted', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            await remove(AS_A, calendarEvent.id.getValue());
            await expect(
                remove(AS_A, calendarEvent.id.getValue()),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R9, the author deletes their private event', () => {
        it('deletes it', async () => {
            const calendarEvent = ctx.givenPrivateEventOf(AS_A);
            await remove(AS_A, calendarEvent.id.getValue());
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({
                metadata: { deletedAt: NOW.toISOString() },
            });
        });
    });

    describe('Scenario: R7, an event the partner cannot see', () => {
        it.each([
            ['the private event of the other', AS_B],
            ['an event of another couple', AS_STRANGER],
        ])(
            'answers not found for %s, and changes nothing',
            async (_label, context) => {
                const calendarEvent = ctx.givenPrivateEventOf(AS_A);
                await expect(
                    remove(context, calendarEvent.id.getValue()),
                ).rejects.toMatchObject({
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
                });
                expect(
                    ctx.calendarEventRepository.storedSnapshots[0],
                ).toMatchObject({
                    metadata: { deletedAt: null },
                });
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });
});
