import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarLabelEventParams,
    toCalendarLabelDomainEventParams,
} from './calendar-label-event-params';

export class CalendarLabelDeletedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'agenda.calendar-label.deleted' as const;

    constructor(params: CalendarLabelEventParams<null>) {
        super(
            toCalendarLabelDomainEventParams(
                CalendarLabelDeletedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
