'use client';

import { calendarLabelCommandGateway } from '../../gateways';
import { useCalendarLabelForm } from '../../hooks/use-calendar-label-form';
import { useCalendarLabelSheet } from '../../hooks/use-calendar-label-sheet';
import {
    presentCalendarLabelOf,
    presentNewCalendarLabel,
} from '../../presenters/calendar-label-form.presenter';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import {
    type CalendarLabelCommand,
    type CalendarLabelSheetTarget,
    CalendarLabelSheetModeEnum,
} from '../../view-models/calendar-label-command.view-model';
import { CalendarLabelSheetView } from '../views/calendar-label-sheet.view';

type Props = {
    readonly target: CalendarLabelSheetTarget;
    readonly onClose: () => void;
    readonly onDone: (
        command: CalendarLabelCommand,
        label: CalendarLabelItem | null,
    ) => void;
    readonly onStale: () => void;
};

const initialFormOf = (target: CalendarLabelSheetTarget) =>
    target.mode === CalendarLabelSheetModeEnum.CREATE
        ? presentNewCalendarLabel(target.labels)
        : presentCalendarLabelOf(target.label);

// The label sheet, in the event sheet (a new label) or in the "Nous" card (an existing one); its drawer is the caller's.
export function CalendarLabelSheetContainer({
    target,
    onClose,
    onDone,
    onStale,
}: Props) {
    const form = useCalendarLabelForm(initialFormOf(target));
    const sheet = useCalendarLabelSheet({
        gateway: calendarLabelCommandGateway,
        target,
        onDone,
        onStale,
    });
    return (
        <CalendarLabelSheetView
            isEdition={target.mode === CalendarLabelSheetModeEnum.EDIT}
            form={form}
            pending={sheet.pending}
            isBusy={sheet.isBusy}
            isDeletionAsked={sheet.isDeletionAsked}
            onCancel={onClose}
            onSubmit={sheet.submit}
            onAskDeletion={sheet.askDeletion}
            onConfirmDeletion={sheet.deleteCalendarLabel}
            onKeep={sheet.keepCalendarLabel}
        />
    );
}
