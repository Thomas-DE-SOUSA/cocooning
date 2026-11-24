import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarEventEventParams,
    toDomainEventParams,
} from './calendar-event-event-params';

export class CalendarEventDeletedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'agenda.calendar-event.deleted' as const;

    constructor(params: CalendarEventEventParams<null>) {
        super(
            toDomainEventParams(CalendarEventDeletedEvent.EVENT_NAME, params),
        );
    }
}
