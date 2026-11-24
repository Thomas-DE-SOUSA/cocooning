import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import {
    A_CALENDAR_EVENT_LIST,
    A_SHARED_CALENDAR_EVENT,
    FakeAgendaGateway,
} from '../../../testing/fake-agenda.gateway';
import type { CalendarEventForm } from '../schemas/calendar-event-form.zod';
import { CreateCalendarEventUseCase } from './create-calendar-event.use-case';
import { DeleteCalendarEventUseCase } from './delete-calendar-event.use-case';
import { EditCalendarEventUseCase } from './edit-calendar-event.use-case';
import { GetCalendarEventUseCase } from './get-calendar-event.use-case';
import { ListCalendarEventsUseCase } from './list-calendar-events.use-case';
import { MakeCalendarEventPrivateUseCase } from './make-calendar-event-private.use-case';
import { ShareCalendarEventUseCase } from './share-calendar-event.use-case';

const EVENT_ID = A_SHARED_CALENDAR_EVENT.calendarEventId;
const DETAILS = {
    title: 'Week-end a Lyon',
    description: 'Train de 9 h',
    startsOn: '2026-12-12',
    endsOn: '2026-12-13',
    startsAt: null,
    endsAt: null,
};
const FORM: CalendarEventForm = { ...DETAILS, isPrivate: false };
const RESERVED = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to the owner of the calendar event',
    backendCode: 'CALENDAR_EVENT_RESERVED_TO_OWNER',
};

describe('Feature: the agenda of the couple from the PWA', () => {
    let gateway: FakeAgendaGateway;

    beforeEach(() => {
        gateway = new FakeAgendaGateway();
    });

    it('lists the events of a range of days (R7)', async () => {
        const query = { from: '2026-11-30', to: '2027-01-03' };
        await expect(
            new ListCalendarEventsUseCase(gateway).execute(query),
        ).resolves.toEqual(ok(A_CALENDAR_EVENT_LIST));
        expect(gateway.calls).toEqual([
            { operation: 'listCalendarEvents', query },
        ]);
    });

    it('opens one event (R7)', async () => {
        await expect(
            new GetCalendarEventUseCase(gateway).execute(EVENT_ID),
        ).resolves.toEqual(ok(A_SHARED_CALENDAR_EVENT));
    });

    it.each([
        [false, CalendarEventVisibilityEnum.SHARED],
        [true, CalendarEventVisibilityEnum.PRIVATE],
    ])(
        'creates an event, private %s, with its visibility (R1, R3)',
        async (isPrivate, visibility) => {
            await new CreateCalendarEventUseCase(gateway).execute({
                ...FORM,
                isPrivate,
            });
            expect(gateway.calls).toEqual([
                {
                    operation: 'createCalendarEvent',
                    request: { ...DETAILS, visibility },
                },
            ]);
        },
    );

    it('edits an event with its details only (R9)', async () => {
        await new EditCalendarEventUseCase(gateway).execute(EVENT_ID, FORM);
        expect(gateway.calls).toEqual([
            {
                operation: 'editCalendarEvent',
                calendarEventId: EVENT_ID,
                request: DETAILS,
            },
        ]);
    });

    it('shares, makes private and deletes an event (R8, R9)', async () => {
        await new ShareCalendarEventUseCase(gateway).execute(EVENT_ID);
        const madePrivate = await new MakeCalendarEventPrivateUseCase(
            gateway,
        ).execute(EVENT_ID);
        await expect(
            new DeleteCalendarEventUseCase(gateway).execute(EVENT_ID),
        ).resolves.toEqual(ok(null));
        expect(madePrivate).toEqual(
            ok({
                ...A_SHARED_CALENDAR_EVENT,
                visibility: CalendarEventVisibilityEnum.PRIVATE,
            }),
        );
        expect(gateway.calls.map(({ operation }) => operation)).toEqual([
            'shareCalendarEvent',
            'makeCalendarEventPrivate',
            'deleteCalendarEvent',
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        gateway.givenRefusal(RESERVED);
        await expect(
            new ShareCalendarEventUseCase(gateway).execute(EVENT_ID),
        ).resolves.toEqual(fail(RESERVED));
    });
});
