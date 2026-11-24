import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback, useState } from 'react';
import type { CalendarEventCommandGateway } from '../gateways/ports/calendar-event-command.gateway';
import type { CalendarEventCommand } from '../view-models/calendar-event-command.view-model';
import { useCalendarEventCommands } from './use-calendar-event-commands';
import { useCalendarEventFeedback } from './use-calendar-event-feedback';

const NO_DRAWER_TO_CLOSE = () => undefined;

// R9, a swipe in the day's list: the event slides out at once; a refusal brings it back, a success reads the month again.
export function useCalendarEventQuickDeletion(
    gateway: CalendarEventCommandGateway,
) {
    const [removedEventId, setRemovedEventId] = useState<string | null>(null);
    const { onDone, onFailed: reportFailure } =
        useCalendarEventFeedback(NO_DRAWER_TO_CLOSE);
    const onFailed = useCallback(
        (command: CalendarEventCommand, error: ApiError) => {
            setRemovedEventId(null);
            reportFailure(command, error);
        },
        [reportFailure],
    );
    const commands = useCalendarEventCommands({ gateway, onDone, onFailed });
    return {
        removedEventId,
        isBusy: commands.isBusy,
        deleteCalendarEvent: (calendarEventId: string) => {
            setRemovedEventId(calendarEventId);
            commands.deleteCalendarEvent(calendarEventId);
        },
    };
}
