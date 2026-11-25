import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarLabelDeletedEvent } from '../../domain/events/calendar-label-deleted.event';
import type { CalendarLabel } from '../../domain/models/calendar-label.aggregate';
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

describe('Feature: delete a calendar label (R12, R14)', () => {
    let ctx: AgendaTestContext;
    let label: CalendarLabel;

    beforeEach(() => {
        ctx = new AgendaTestContext();
        label = ctx.givenLabelOf(AS_A);
        ctx.advanceHours(1);
    });
    afterEach(() => CalendarEventId.resetForTests());

    const remove = (context: ExecutionContext) =>
        ctx
            .deleteCalendarLabelUseCase()
            .execute(context, { calendarLabelId: label.id.getValue() });

    describe('Scenario: the other partner deletes a label of the couple', () => {
        it('deletes it softly and records one event', async () => {
            await remove(AS_B);
            expect(
                ctx.calendarLabelRepository.storedSnapshots[0],
            ).toMatchObject({
                version: 2,
                metadata: { deletedAt: DELETED_AT.toISOString() },
            });
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarLabelDeletedEvent.EVENT_NAME,
                aggregateId: label.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: DELETED_AT,
            };
            expect(ctx.calendarLabelRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('takes it out of the list of the couple', async () => {
            await remove(AS_B);
            await expect(
                ctx.listCalendarLabelsUseCase().execute(AS_A),
            ).resolves.toEqual([]);
        });
    });

    describe('Scenario: R13, a label of another couple', () => {
        it('answers not found and changes nothing', async () => {
            await expect(remove(AS_STRANGER)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
            });
            expect(
                ctx.calendarLabelRepository.storedSnapshots[0],
            ).toMatchObject({ version: 1, metadata: { deletedAt: null } });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
