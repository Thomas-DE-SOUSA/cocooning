import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeCalendarEventCommandGateway } from '../gateways/fake/fake-calendar-event-command.gateway';
import {
    CalendarEventCommandEnum,
    CalendarEventVisibilityChangeEnum,
} from '../view-models/calendar-event-command.view-model';
import { useCalendarEventCommands } from './use-calendar-event-commands';

const EVENT_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const A_DINNER: CalendarEventForm = {
    title: 'Dîner chez Léa',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    isPrivate: true,
};
const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Version conflict',
    backendCode: 'CALENDAR_EVENT_VERSION_CONFLICT',
};

function renderCommands(gateway: FakeCalendarEventCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useCalendarEventCommands({
            gateway,
            onDone: (command) => events.push(`${command}:done`),
            onFailed: (command, error) =>
                events.push(`${command}:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: the commands of the event drawer', () => {
    describe('Scenario: R1, a partner adds an event', () => {
        it('sends the form once and reports it done', async () => {
            const gateway = new FakeCalendarEventCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.createCalendarEvent(A_DINNER));

            expect(gateway.calls).toEqual([
                { operation: 'createCalendarEvent', form: A_DINNER },
            ]);
            expect(events).toEqual(['CREATE_CALENDAR_EVENT:done']);
            expect(result.current.pending).toBeNull();
        });
    });

    describe('Scenario: R8, R9, a partner saves an edited event', () => {
        it('sends the details, then the new visibility', async () => {
            const gateway = new FakeCalendarEventCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () =>
                result.current.saveCalendarEvent(EVENT_ID, A_DINNER, {
                    editsDetails: true,
                    visibilityChange:
                        CalendarEventVisibilityChangeEnum.MAKE_PRIVATE,
                }),
            );

            expect(gateway.calls).toEqual([
                {
                    operation: 'editCalendarEvent',
                    calendarEventId: EVENT_ID,
                    form: A_DINNER,
                },
                {
                    operation: 'makeCalendarEventPrivate',
                    calendarEventId: EVENT_ID,
                },
            ]);
            expect(events).toEqual(['SAVE_CALENDAR_EVENT:done']);
        });

        it('shares the event alone when only the visibility changed', async () => {
            const gateway = new FakeCalendarEventCommandGateway();
            const { result } = renderCommands(gateway);

            await act(async () =>
                result.current.saveCalendarEvent(EVENT_ID, A_DINNER, {
                    editsDetails: false,
                    visibilityChange: CalendarEventVisibilityChangeEnum.SHARE,
                }),
            );

            expect(gateway.calls).toEqual([
                { operation: 'shareCalendarEvent', calendarEventId: EVENT_ID },
            ]);
        });

        it('stops before the visibility when the edit is refused', async () => {
            const gateway = new FakeCalendarEventCommandGateway();
            gateway.givenOutcome('editCalendarEvent', fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () =>
                result.current.saveCalendarEvent(EVENT_ID, A_DINNER, {
                    editsDetails: true,
                    visibilityChange: CalendarEventVisibilityChangeEnum.SHARE,
                }),
            );

            expect(gateway.calls.map(({ operation }) => operation)).toEqual([
                'editCalendarEvent',
            ]);
            expect(events).toEqual(['SAVE_CALENDAR_EVENT:CONFLICT']);
        });
    });

    describe('Scenario: R9, a partner deletes an event', () => {
        it('tells that the deletion runs until the answer arrives', async () => {
            const gateway = new FakeCalendarEventCommandGateway();
            const release = gateway.holdAnswers();
            const { result, events } = renderCommands(gateway);

            act(() => result.current.deleteCalendarEvent(EVENT_ID));

            expect(result.current.pending).toBe(
                CalendarEventCommandEnum.DELETE_CALENDAR_EVENT,
            );
            expect(result.current.isBusy).toBe(true);
            await act(async () => release());
            expect(result.current.pending).toBeNull();
            expect(events).toEqual(['DELETE_CALENDAR_EVENT:done']);
        });
    });
});
