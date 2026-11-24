import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarEventEventParams,
    toDomainEventParams,
} from './calendar-event-event-params';

export class CalendarEventMadePrivateEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'agenda.calendar-event.made-private' as const;

    constructor(params: CalendarEventEventParams<null>) {
        super(
            toDomainEventParams(
                CalendarEventMadePrivateEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
