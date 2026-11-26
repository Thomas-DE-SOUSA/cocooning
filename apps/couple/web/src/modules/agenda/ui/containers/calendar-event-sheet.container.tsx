'use client';

import { calendarEventCommandGateway } from '../../gateways';
import { useCalendarEventForm } from '../../hooks/use-calendar-event-form';
import { useCalendarEventSheet } from '../../hooks/use-calendar-event-sheet';
import { useNewCalendarLabel } from '../../hooks/use-new-calendar-label';
import {
    presentCalendarEventOf,
    presentNewCalendarEvent,
} from '../../presenters/calendar-event-form.presenter';
import { mergeCalendarLabels } from '../../presenters/calendar-labels.presenter';
import {
    type CalendarEventDrawerTarget,
    CalendarEventDrawerModeEnum,
} from '../../view-models/calendar-event-drawer.view-model';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { CalendarEventSheetView } from '../views/calendar-event-sheet.view';
import { NewCalendarLabelDrawerContainer } from './new-calendar-label-drawer.container';

type Props = {
    readonly target: CalendarEventDrawerTarget;
    readonly labels: readonly CalendarLabelItem[];
    readonly onClose: () => void;
};

const initialFormOf = (target: CalendarEventDrawerTarget) =>
    target.mode === CalendarEventDrawerModeEnum.CREATE
        ? presentNewCalendarEvent(target.day)
        : presentCalendarEventOf(target.item);

// R3, R8: the visibility row shows at creation and to the author of an edited event only. R13: a label created from
// here is picked on the event.
export function CalendarEventSheetContainer({
    target,
    labels,
    onClose,
}: Props) {
    const { form, isAllDay, changeAllDay, pickLabel } = useCalendarEventForm(
        initialFormOf(target),
    );
    const newLabel = useNewCalendarLabel(pickLabel);
    const allLabels = mergeCalendarLabels(labels, newLabel.created);
    const sheet = useCalendarEventSheet({
        gateway: calendarEventCommandGateway,
        target,
        onClose,
    });
    const isEdition = target.mode === CalendarEventDrawerModeEnum.EDIT;
    return (
        <>
            <CalendarEventSheetView
                isEdition={isEdition}
                form={form}
                isAllDay={isAllDay}
                showsPrivacy={!isEdition || target.item.isOwner}
                labels={allLabels}
                onNewLabel={newLabel.open}
                pending={sheet.pending}
                isBusy={sheet.isBusy}
                isDeletionAsked={sheet.isDeletionAsked}
                onAllDayChange={changeAllDay}
                onCancel={onClose}
                onSubmit={sheet.submit}
                onAskDeletion={sheet.askDeletion}
                onConfirmDeletion={sheet.deleteCalendarEvent}
                onKeep={sheet.keepCalendarEvent}
            />
            <NewCalendarLabelDrawerContainer
                isOpen={newLabel.isOpen}
                opening={newLabel.opening}
                labels={allLabels}
                onClose={newLabel.close}
                onDone={newLabel.onDone}
            />
        </>
    );
}
