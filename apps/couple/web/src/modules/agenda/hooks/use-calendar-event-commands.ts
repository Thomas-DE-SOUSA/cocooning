import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { CalendarEventCommandGateway } from '../gateways/ports/calendar-event-command.gateway';
import {
    type CalendarEventCommand,
    CalendarEventCommandEnum,
    type CalendarEventSave,
    CalendarEventVisibilityChangeEnum,
} from '../view-models/calendar-event-command.view-model';

type Options = {
    readonly gateway: CalendarEventCommandGateway;
    readonly onDone: (command: CalendarEventCommand) => void;
    readonly onFailed: (command: CalendarEventCommand, error: ApiError) => void;
};

type Send = () => Promise<Result<null, ApiError>>;

// R8, R9: the details first, then the visibility; a refused edit stops before the visibility.
async function sendSave(
    gateway: CalendarEventCommandGateway,
    calendarEventId: string,
    form: CalendarEventForm,
    save: CalendarEventSave,
    isOwner: boolean,
): Promise<Result<null, ApiError>> {
    if (save.editsDetails) {
        const edited = await gateway.editCalendarEvent(
            calendarEventId,
            form,
            isOwner,
        );
        if (!edited.success) return edited;
    }
    if (save.visibilityChange === CalendarEventVisibilityChangeEnum.SHARE) {
        return gateway.shareCalendarEvent(calendarEventId);
    }
    if (
        save.visibilityChange === CalendarEventVisibilityChangeEnum.MAKE_PRIVATE
    ) {
        return gateway.makeCalendarEventPrivate(calendarEventId);
    }
    return ok(null);
}

// One command at a time: every button waits while isBusy, only the pending one spins.
export function useCalendarEventCommands({
    gateway,
    onDone,
    onFailed,
}: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<CalendarEventCommand | null>(
        null,
    );
    const run = useCallback(
        (command: CalendarEventCommand, send: Send) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone(command);
                    return;
                }
                onFailed(command, result.error);
            });
        },
        [onDone, onFailed],
    );
    return {
        createCalendarEvent: (form: CalendarEventForm) =>
            run(CalendarEventCommandEnum.CREATE_CALENDAR_EVENT, () =>
                gateway.createCalendarEvent(form),
            ),
        saveCalendarEvent: (
            calendarEventId: string,
            form: CalendarEventForm,
            save: CalendarEventSave,
            isOwner: boolean,
        ) =>
            run(CalendarEventCommandEnum.SAVE_CALENDAR_EVENT, () =>
                sendSave(gateway, calendarEventId, form, save, isOwner),
            ),
        deleteCalendarEvent: (calendarEventId: string) =>
            run(CalendarEventCommandEnum.DELETE_CALENDAR_EVENT, () =>
                gateway.deleteCalendarEvent(calendarEventId),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
