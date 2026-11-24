'use client';

import { calendarEventCommandGateway } from '../../gateways';
import { useCalendarEventForm } from '../../hooks/use-calendar-event-form';
import { useCalendarEventSheet } from '../../hooks/use-calendar-event-sheet';
import {
    presentCalendarEventOf,
    presentNewCalendarEvent,
} from '../../presenters/calendar-event-form.presenter';
import {
    type CalendarEventDrawerTarget,
    CalendarEventDrawerModeEnum,
} from '../../view-models/calendar-event-drawer.view-model';
import { CalendarEventSheetView } from '../views/calendar-event-sheet.view';

type Props = {
    readonly target: CalendarEventDrawerTarget;
    readonly onClose: () => void;
};

const initialFormOf = (target: CalendarEventDrawerTarget) =>
    target.mode === CalendarEventDrawerModeEnum.CREATE
        ? presentNewCalendarEvent(target.day)
        : presentCalendarEventOf(target.item);

// R3, R8: the visibility row shows at creation and to the author of an edited event only.
export function CalendarEventSheetContainer({ target, onClose }: Props) {
    const { form, isAllDay, changeAllDay } = useCalendarEventForm(
        initialFormOf(target),
    );
    const sheet = useCalendarEventSheet({
        gateway: calendarEventCommandGateway,
        target,
        onClose,
    });
    const isEdition = target.mode === CalendarEventDrawerModeEnum.EDIT;
    return (
        <CalendarEventSheetView
            isEdition={isEdition}
            form={form}
            isAllDay={isAllDay}
            showsPrivacy={!isEdition || target.item.isOwner}
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
    );
}
