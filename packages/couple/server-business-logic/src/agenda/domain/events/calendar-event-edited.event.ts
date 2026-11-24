import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarEventEventParams,
    toDomainEventParams,
} from './calendar-event-event-params';

export class CalendarEventEditedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'agenda.calendar-event.edited' as const;

    constructor(params: CalendarEventEventParams<null>) {
        super(toDomainEventParams(CalendarEventEditedEvent.EVENT_NAME, params));
    }
}
