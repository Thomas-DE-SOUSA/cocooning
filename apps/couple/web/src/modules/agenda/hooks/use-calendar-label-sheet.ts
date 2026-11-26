import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import { useState } from 'react';
import type { CalendarLabelCommandGateway } from '../gateways/ports/calendar-label-command.gateway';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';
import {
    type CalendarLabelCommand,
    type CalendarLabelSheetTarget,
    CalendarLabelSheetModeEnum,
} from '../view-models/calendar-label-command.view-model';
import { useCalendarLabelCommands } from './use-calendar-label-commands';
import { useCalendarLabelFeedback } from './use-calendar-label-feedback';

type Options = {
    readonly gateway: CalendarLabelCommandGateway;
    readonly target: CalendarLabelSheetTarget;
    readonly onDone: (
        command: CalendarLabelCommand,
        label: CalendarLabelItem | null,
    ) => void;
    readonly onStale: () => void;
};

// Composition hook of the label sheet: create or save, and a deletion that asks once more (R14).
export function useCalendarLabelSheet({
    gateway,
    target,
    onDone,
    onStale,
}: Options) {
    const [isDeletionAsked, setIsDeletionAsked] = useState(false);
    const feedback = useCalendarLabelFeedback({ onDone, onStale });
    const commands = useCalendarLabelCommands({ gateway, ...feedback });
    const submit = (form: CalendarLabelForm) => {
        if (target.mode === CalendarLabelSheetModeEnum.CREATE) {
            commands.createCalendarLabel(form);
            return;
        }
        commands.editCalendarLabel(target.label.calendarLabelId, form);
    };
    const deleteCalendarLabel = () => {
        if (target.mode !== CalendarLabelSheetModeEnum.EDIT) return;
        commands.deleteCalendarLabel(target.label.calendarLabelId);
    };
    return {
        pending: commands.pending,
        isBusy: commands.isBusy,
        submit,
        isDeletionAsked,
        askDeletion: () => setIsDeletionAsked(true),
        keepCalendarLabel: () => setIsDeletionAsked(false),
        deleteCalendarLabel,
    };
}
