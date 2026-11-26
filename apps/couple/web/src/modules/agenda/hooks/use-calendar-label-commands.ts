import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { CalendarLabelCommandGateway } from '../gateways/ports/calendar-label-command.gateway';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';
import {
    type CalendarLabelCommand,
    CalendarLabelCommandEnum,
} from '../view-models/calendar-label-command.view-model';

type Options = {
    readonly gateway: CalendarLabelCommandGateway;
    readonly onDone: (
        command: CalendarLabelCommand,
        label: CalendarLabelItem | null,
    ) => void;
    readonly onFailed: (command: CalendarLabelCommand, error: ApiError) => void;
};

type Send = () => Promise<Result<CalendarLabelItem | null, ApiError>>;

// One label command at a time: every button waits while isBusy, only the pending one spins.
export function useCalendarLabelCommands({
    gateway,
    onDone,
    onFailed,
}: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<CalendarLabelCommand | null>(
        null,
    );
    const run = useCallback(
        (command: CalendarLabelCommand, send: Send) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone(command, result.value);
                    return;
                }
                onFailed(command, result.error);
            });
        },
        [onDone, onFailed],
    );
    return {
        createCalendarLabel: (form: CalendarLabelForm) =>
            run(CalendarLabelCommandEnum.CREATE_CALENDAR_LABEL, () =>
                gateway.createCalendarLabel(form),
            ),
        editCalendarLabel: (calendarLabelId: string, form: CalendarLabelForm) =>
            run(CalendarLabelCommandEnum.EDIT_CALENDAR_LABEL, () =>
                gateway.editCalendarLabel(calendarLabelId, form),
            ),
        deleteCalendarLabel: (calendarLabelId: string) =>
            run(CalendarLabelCommandEnum.DELETE_CALENDAR_LABEL, () =>
                gateway.deleteCalendarLabel(calendarLabelId),
            ),
        pending: isPending ? lastCommand : null,
        isBusy: isPending,
    };
}
