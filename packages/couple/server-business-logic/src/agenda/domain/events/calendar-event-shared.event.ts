import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarEventEventParams,
    toDomainEventParams,
} from './calendar-event-event-params';

export class CalendarEventSharedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'agenda.calendar-event.shared' as const;

    constructor(params: CalendarEventEventParams<null>) {
        super(toDomainEventParams(CalendarEventSharedEvent.EVENT_NAME, params));
    }
}
