import type { CalendarEventVisibility } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type CalendarEventEventParams,
    toDomainEventParams,
} from './calendar-event-event-params';

export type CalendarEventCreatedData = {
    readonly ownerId: string;
    readonly visibility: CalendarEventVisibility;
};

// The title, the description and the days belong to the couple: no event carries them (core.md rule 33).
export class CalendarEventCreatedEvent extends DomainEventBase<CalendarEventCreatedData> {
    static readonly EVENT_NAME = 'agenda.calendar-event.created' as const;

    constructor(params: CalendarEventEventParams<CalendarEventCreatedData>) {
        super(
            toDomainEventParams(CalendarEventCreatedEvent.EVENT_NAME, params),
        );
    }
}
