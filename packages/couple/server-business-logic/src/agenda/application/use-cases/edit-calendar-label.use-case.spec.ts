import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarLabelEditedEvent } from '../../domain/events/calendar-label-edited.event';
import type { CalendarLabel } from '../../domain/models/calendar-label.aggregate';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    MILLISECONDS_PER_HOUR,
    NOW,
    PARTNER_A,
} from '../../__tests__/fixtures/agenda-test.data';

const EDITED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);
const PLUM = CalendarLabelColorEnum.PLUM;

describe('Feature: rename and recolour a calendar label (R12)', () => {
    let ctx: AgendaTestContext;
    let label: CalendarLabel;

    beforeEach(() => {
        ctx = new AgendaTestContext();
        label = ctx.givenLabelOf(AS_A, 'Sport');
        ctx.advanceHours(1);
    });
    afterEach(() => CalendarEventId.resetForTests());

    const edit = (
        context: ExecutionContext,
        name = ' Yoga ',
        calendarLabelId = label.id.getValue(),
    ) =>
        ctx
            .editCalendarLabelUseCase()
            .execute(context, { calendarLabelId, name, color: PLUM });

    describe('Scenario: the other partner edits a label of the couple', () => {
        it('returns the label with its new name and colour', async () => {
            await expect(edit(AS_B)).resolves.toEqual({
                calendarLabelId: label.id.getValue(),
                name: 'Yoga',
                color: PLUM,
                updatedAt: EDITED_AT,
            });
        });

        it('stores it at the next version, still owned by its creator', async () => {
            await edit(AS_B);
            expect(ctx.calendarLabelRepository.storedSnapshots).toEqual([
                {
                    id: label.id.getValue(),
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    name: 'Yoga',
                    color: PLUM,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: EDITED_AT.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one edited event, with the colour only', async () => {
            await edit(AS_B);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarLabelEditedEvent.EVENT_NAME,
                aggregateId: label.id.getValue(),
                context: AS_B,
                data: { color: PLUM },
                occurredAt: EDITED_AT,
            };
            expect(ctx.calendarLabelRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R13, a label the partner cannot reach', () => {
        it('answers not found to another couple, and changes nothing', async () => {
            await expect(edit(AS_STRANGER)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
            });
            expect(
                ctx.calendarLabelRepository.storedSnapshots[0],
            ).toMatchObject({ name: 'Sport', version: 1 });
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it('answers not found for a deleted label', async () => {
            await ctx
                .deleteCalendarLabelUseCase()
                .execute(AS_A, { calendarLabelId: label.id.getValue() });
            await expect(edit(AS_B)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R12, an empty name', () => {
        it('refuses it and changes nothing', async () => {
            await expect(edit(AS_B, ' ')).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID,
            });
            expect(
                ctx.calendarLabelRepository.storedSnapshots[0],
            ).toMatchObject({ name: 'Sport', version: 1 });
        });
    });

    describe('Scenario: both partners edit the label at once', () => {
        it('refuses the stale write with CALENDAR_LABEL_VERSION_CONFLICT', async () => {
            const other = await ctx.calendarLabelRepository.findById(
                COUPLE_ID,
                label.id.getValue(),
            );
            other?.delete(PARTNER_A, NOW);
            ctx.calendarLabelRepository.simulateConcurrentSave(
                other as CalendarLabel,
            );
            await expect(edit(AS_B)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
