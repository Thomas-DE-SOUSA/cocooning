import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    CalendarEventAudienceEnum,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { CalendarEventEditedEvent } from '../../domain/events/calendar-event-edited.event';
import type { CalendarEvent } from '../../domain/models/calendar-event.aggregate';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { AgendaTestContext } from '../../__tests__/fixtures/agenda-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    COUPLE_ID,
    DINNER,
    MILLISECONDS_PER_HOUR,
    NOW,
    PARTNER_A,
    WEEKEND,
} from '../../__tests__/fixtures/agenda-test.data';

const EDITED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: edit a calendar event', () => {
    let ctx: AgendaTestContext;

    beforeEach(() => {
        ctx = new AgendaTestContext();
    });
    afterEach(() => CalendarEventId.resetForTests());

    const edit = (
        context: ExecutionContext,
        calendarEvent: CalendarEvent,
        details = WEEKEND,
    ) =>
        ctx.editCalendarEventUseCase().execute(context, {
            calendarEventId: calendarEvent.id.getValue(),
            ...details,
        });

    describe('Scenario: R9, the other partner edits a shared event', () => {
        let calendarEvent: CalendarEvent;

        beforeEach(() => {
            calendarEvent = ctx.givenEventOf(AS_A, DINNER);
            ctx.advanceHours(1);
        });

        it('returns the edited event, still owned by its author', async () => {
            await expect(edit(AS_B, calendarEvent)).resolves.toEqual({
                calendarEventId: calendarEvent.id.getValue(),
                ownerId: PARTNER_A,
                isOwner: false,
                ...WEEKEND,
                visibility: CalendarEventVisibilityEnum.SHARED,
                updatedAt: EDITED_AT,
            });
        });

        it('stores every detail, at the next version', async () => {
            await edit(AS_B, calendarEvent);
            expect(ctx.calendarEventRepository.storedSnapshots).toEqual([
                {
                    id: calendarEvent.id.getValue(),
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    ...WEEKEND,
                    visibility: CalendarEventVisibilityEnum.SHARED,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: EDITED_AT.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one edited event, without its content', async () => {
            await edit(AS_B, calendarEvent);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CalendarEventEditedEvent.EVENT_NAME,
                aggregateId: calendarEvent.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: EDITED_AT,
            };
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([
                expected,
            ]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R9, R11, the author edits their private event', () => {
        it('edits it and keeps it private, for its author', async () => {
            const calendarEvent = ctx.givenPrivateEventOf(AS_A);
            const view = await edit(AS_A, calendarEvent, {
                ...WEEKEND,
                audience: CalendarEventAudienceEnum.OWNER,
            });
            expect(view).toMatchObject({
                title: WEEKEND.title,
                visibility: CalendarEventVisibilityEnum.PRIVATE,
                audience: CalendarEventAudienceEnum.OWNER,
            });
        });

        it.each([
            [CalendarEventAudienceEnum.PARTNER],
            [CalendarEventAudienceEnum.BOTH],
        ])('refuses the audience %s and changes nothing', async (audience) => {
            const calendarEvent = ctx.givenPrivateEventOf(AS_A);
            await expect(
                edit(AS_A, calendarEvent, { ...WEEKEND, audience }),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_AUDIENCE_INVALID,
            });
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({
                audience: CalendarEventAudienceEnum.OWNER,
                version: 1,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R11, a partner says a shared event is for one of them', () => {
        it('keeps it shared, for the chosen partner', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            const view = await edit(AS_B, calendarEvent, {
                ...WEEKEND,
                audience: CalendarEventAudienceEnum.PARTNER,
            });
            expect(view).toMatchObject({
                visibility: CalendarEventVisibilityEnum.SHARED,
                audience: CalendarEventAudienceEnum.PARTNER,
            });
        });
    });

    describe('Scenario: R13, the label of the event', () => {
        it('puts a label of the couple on the event, then takes it off', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            const labelId = ctx.givenLabelOf(AS_B).id.getValue();
            const labelled = await edit(AS_B, calendarEvent, {
                ...WEEKEND,
                labelId,
            });
            expect(labelled.labelId).toBe(labelId);
            const unlabelled = await edit(AS_A, calendarEvent);
            expect(unlabelled.labelId).toBeNull();
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({ labelId: null, version: 3 });
        });

        it('refuses a label of another couple, and changes nothing', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            const labelId = ctx.givenLabelOf(AS_STRANGER).id.getValue();
            await expect(
                edit(AS_A, calendarEvent, { ...WEEKEND, labelId }),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
            });
            expect(
                ctx.calendarEventRepository.storedSnapshots[0],
            ).toMatchObject({ labelId: null, version: 1 });
            expect(ctx.eventPublisher.published).toEqual([]);
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
                    edit(context, calendarEvent),
                ).rejects.toMatchObject({
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND,
                });
                expect(
                    ctx.calendarEventRepository.storedSnapshots[0],
                ).toMatchObject({
                    title: 'Surprise',
                    version: 1,
                });
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });

    describe('Scenario: R5, an end hour without a start hour', () => {
        it('refuses it and changes nothing', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            await expect(
                edit(AS_A, calendarEvent, {
                    ...DINNER,
                    startsAt: null,
                    endsAt: '22:00',
                }),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_MOMENT_INVALID,
            });
            expect(ctx.calendarEventRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: both partners edit at the same time', () => {
        it('refuses the second write on the version', async () => {
            const calendarEvent = ctx.givenEventOf(AS_A);
            ctx.calendarEventRepository.simulateConcurrentSave(calendarEvent);
            await expect(edit(AS_B, calendarEvent)).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_VERSION_CONFLICT,
            });
        });
    });
});
