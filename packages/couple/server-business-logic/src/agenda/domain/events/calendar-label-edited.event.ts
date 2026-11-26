import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarLabelEventParams,
    toCalendarLabelDomainEventParams,
} from './calendar-label-event-params';

export type CalendarLabelEditedData = {
    readonly color: CalendarLabelColor;
};

// The name belongs to the couple: no event carries it (core.md rule 33).
export class CalendarLabelEditedEvent extends DomainEventBase<CalendarLabelEditedData> {
    static readonly EVENT_NAME = 'agenda.calendar-label.edited' as const;

    constructor(params: CalendarLabelEventParams<CalendarLabelEditedData>) {
        super(
            toCalendarLabelDomainEventParams(
                CalendarLabelEditedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
