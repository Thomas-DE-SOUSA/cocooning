import {
    CreateCalendarEventUseCase,
    EditCalendarEventUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_CALENDAR_EVENT,
    FakeAgendaGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    actOnCalendarEvent,
    createCalendarEvent,
    editCalendarEvent,
} from './calendar-event-commands.service';

const EVENT_ID = A_SHARED_CALENDAR_EVENT.calendarEventId;
const A_DINNER_INPUT = {
    title: ' Dîner chez Léa ',
    description: '',
    startsOn: '2026-12-05',
    endsOn: '',
    startsAt: '20:00',
    endsAt: '',
    isPrivate: true,
};
const THE_DINNER_DETAILS = {
    title: 'Dîner chez Léa',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    audience: 'OWNER',
    labelId: null,
};
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to owner',
    backendCode: 'CALENDAR_EVENT_RESERVED_TO_OWNER',
};

const isValidationError = (result: Awaited<ReturnType<typeof create>>) =>
    result.success === false &&
    result.error.code === ApiErrorCodeEnum.VALIDATION_ERROR;

let gateway: FakeAgendaGateway;
const create = (input: unknown) =>
    createCalendarEvent(input, {
        t: (key) => key,
        createCalendarEvent: new CreateCalendarEventUseCase(gateway),
    });
const edit = (calendarEventId: unknown, input: unknown) =>
    editCalendarEvent(calendarEventId, input, {
        t: (key) => key,
        editCalendarEvent: new EditCalendarEventUseCase(gateway),
    });

describe('Feature: calendar event commands sent by the server actions', () => {
    beforeEach(() => {
        gateway = new FakeAgendaGateway();
    });

    describe('Scenario: R1, R3, a partner adds an event', () => {
        it('sends the trimmed form once, private when asked', async () => {
            expect(await create(A_DINNER_INPUT)).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                {
                    operation: 'createCalendarEvent',
                    request: { ...THE_DINNER_DETAILS, visibility: 'PRIVATE' },
                },
            ]);
        });

        it('refuses an invalid moment without calling the API (rule 14)', async () => {
            const result = await create({
                ...A_DINNER_INPUT,
                endsAt: '19:00',
            });
            expect(isValidationError(result)).toBe(true);
            expect(gateway.calls).toEqual([]);
        });
    });

    describe('Scenario: R9, a partner edits an event', () => {
        it('sends the details without the visibility, the private event for its author (R8, R11)', async () => {
            expect(await edit(EVENT_ID, A_DINNER_INPUT)).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                {
                    operation: 'editCalendarEvent',
                    calendarEventId: EVENT_ID,
                    request: THE_DINNER_DETAILS,
                },
            ]);
        });

        it.each([
            ['an empty title', EVENT_ID, { ...A_DINNER_INPUT, title: ' ' }],
            ['an id that is not an event id', '../couple', A_DINNER_INPUT],
        ])(
            'refuses %s without calling the API',
            async (_label, calendarEventId, input) => {
                expect(
                    isValidationError(await edit(calendarEventId, input)),
                ).toBe(true);
                expect(gateway.calls).toEqual([]);
            },
        );
    });

    describe('Scenario: R8, R9, a partner acts on an event', () => {
        it('sends the event id and drops the event', async () => {
            const sent: string[] = [];
            const result = await actOnCalendarEvent(EVENT_ID, (id) => {
                sent.push(id);
                return Promise.resolve(ok(A_SHARED_CALENDAR_EVENT));
            });
            expect(result).toEqual(ok(null));
            expect(sent).toEqual([EVENT_ID]);
        });

        it('passes the refusal of the API through', async () => {
            expect(
                await actOnCalendarEvent(EVENT_ID, () =>
                    Promise.resolve(fail(REFUSAL)),
                ),
            ).toEqual(fail(REFUSAL));
        });
    });
});
