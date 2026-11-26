import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import { useState } from 'react';
import type { CalendarEventCommandGateway } from '../gateways/ports/calendar-event-command.gateway';
import { presentCalendarEventOf } from '../presenters/calendar-event-form.presenter';
import {
    isNothingToSave,
    presentCalendarEventSave,
} from '../presenters/calendar-event-save.presenter';
import {
    type CalendarEventDrawerTarget,
    CalendarEventDrawerModeEnum,
} from '../view-models/calendar-event-drawer.view-model';
import { useCalendarEventCommands } from './use-calendar-event-commands';
import { useCalendarEventFeedback } from './use-calendar-event-feedback';

type Options = {
    readonly gateway: CalendarEventCommandGateway;
    readonly target: CalendarEventDrawerTarget;
    readonly onClose: () => void;
};

// Composition hook of the drawer: an untouched edited event closes without a call; a deletion asks once more (R9) and
// keeps its confirmation on screen, spinning, until the answer.
export function useCalendarEventSheet({ gateway, target, onClose }: Options) {
    const [isDeletionAsked, setIsDeletionAsked] = useState(false);
    const { onDone, onFailed } = useCalendarEventFeedback(onClose);
    const commands = useCalendarEventCommands({ gateway, onDone, onFailed });
    const submit = (form: CalendarEventForm) => {
        if (target.mode === CalendarEventDrawerModeEnum.CREATE) {
            commands.createCalendarEvent(form);
            return;
        }
        const { item } = target;
        const save = presentCalendarEventSave(
            presentCalendarEventOf(item),
            form,
        );
        if (isNothingToSave(save)) {
            onClose();
            return;
        }
        commands.saveCalendarEvent(
            item.calendarEventId,
            form,
            save,
            item.isOwner,
        );
    };
    const deleteCalendarEvent = () => {
        if (target.mode !== CalendarEventDrawerModeEnum.EDIT) return;
        commands.deleteCalendarEvent(target.item.calendarEventId);
    };
    return {
        pending: commands.pending,
        isBusy: commands.isBusy,
        submit,
        isDeletionAsked,
        askDeletion: () => setIsDeletionAsked(true),
        keepCalendarEvent: () => setIsDeletionAsked(false),
        deleteCalendarEvent,
    };
}
