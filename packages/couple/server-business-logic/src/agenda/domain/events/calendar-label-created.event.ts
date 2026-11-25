import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarLabelEventParams,
    toCalendarLabelDomainEventParams,
} from './calendar-label-event-params';

export type CalendarLabelCreatedData = {
    readonly ownerId: string;
    readonly color: CalendarLabelColor;
};

// The name belongs to the couple: no event carries it (core.md rule 33).
export class CalendarLabelCreatedEvent extends DomainEventBase<CalendarLabelCreatedData> {
    static readonly EVENT_NAME = 'agenda.calendar-label.created' as const;

    constructor(params: CalendarLabelEventParams<CalendarLabelCreatedData>) {
        super(
            toCalendarLabelDomainEventParams(
                CalendarLabelCreatedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
