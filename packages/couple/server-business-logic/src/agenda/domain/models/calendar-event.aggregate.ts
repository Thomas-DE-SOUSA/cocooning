import {
    type CalendarEventVisibility,
    CalendarEventVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { CalendarEventCreatedEvent } from '../events/calendar-event-created.event';
import { CalendarEventDeletedEvent } from '../events/calendar-event-deleted.event';
import { CalendarEventEditedEvent } from '../events/calendar-event-edited.event';
import {
    type CalendarEventFactClass,
    eventParamsOf,
} from '../events/calendar-event-event-params';
import { CalendarEventMadePrivateEvent } from '../events/calendar-event-made-private.event';
import { CalendarEventSharedEvent } from '../events/calendar-event-shared.event';
import { CalendarEventAccessValidator } from '../services/calendar-event-access.validator';
import { CalendarEventAudienceValidator } from '../services/calendar-event-audience.validator';
import type { CalendarEventDetails } from '../value-objects/calendar-event-details';
import { CalendarEventId } from '../value-objects/calendar-event-id.vo';
import {
    calendarEventPropsFromSnapshot,
    calendarEventSnapshotFromProps,
} from './calendar-event.aggregate.snapshot';
import type {
    CalendarEventProps,
    CalendarEventSnapshot,
    CreateCalendarEventInput,
} from './calendar-event.aggregate.type';

const INITIAL_VERSION = 1;

export class CalendarEvent extends AggregateRoot {
    private constructor(private readonly props: CalendarEventProps) {
        super();
    }

    // R1, R3: the author owns the event, shared unless kept "rien que pour moi" at creation. R11: for whom.
    static create(input: CreateCalendarEventInput, now: Date): CalendarEvent {
        const { ownerId, visibility } = input;
        CalendarEventAudienceValidator.ensureFits(
            visibility,
            input.details.audience,
        );
        const calendarEvent = new CalendarEvent({
            ...input,
            id: CalendarEventId.generate(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        const data = { ownerId, visibility };
        const params = eventParamsOf(calendarEvent.props, ownerId, now, data);
        calendarEvent.addDomainEvent(new CalendarEventCreatedEvent(params));
        return calendarEvent;
    }

    static fromSnapshot(snapshot: CalendarEventSnapshot): CalendarEvent {
        return new CalendarEvent(calendarEventPropsFromSnapshot(snapshot));
    }

    // R9: whoever sees the event edits it; the repository only hands out visible events (R7). R11: a private one stays for its author.
    edit(userId: string, details: CalendarEventDetails, now: Date): void {
        CalendarEventAudienceValidator.ensureFits(
            this.props.visibility,
            details.audience,
        );
        this.props.details = details;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.record(CalendarEventEditedEvent, userId, now);
    }

    // R8: only the author changes the visibility.
    share(userId: string, now: Date): void {
        this.changeVisibility(userId, CalendarEventVisibilityEnum.SHARED, now);
        this.record(CalendarEventSharedEvent, userId, now);
    }

    makePrivate(userId: string, now: Date): void {
        this.changeVisibility(userId, CalendarEventVisibilityEnum.PRIVATE, now);
        this.record(CalendarEventMadePrivateEvent, userId, now);
    }

    // R9: whoever sees the event deletes it, softly, for both partners.
    delete(userId: string, now: Date): void {
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.record(CalendarEventDeletedEvent, userId, now);
    }

    get id(): CalendarEventId {
        return this.props.id;
    }

    get updatedAt(): Date {
        return this.props.metadata.updatedAt;
    }

    toSnapshot(): CalendarEventSnapshot {
        return calendarEventSnapshotFromProps(this.props);
    }

    private changeVisibility(
        userId: string,
        visibility: CalendarEventVisibility,
        now: Date,
    ): void {
        CalendarEventAccessValidator.ensureOwner(this.props.ownerId, userId);
        // R11: only an event for its author becomes private; sharing keeps the audience.
        CalendarEventAudienceValidator.ensureFits(
            visibility,
            this.props.details.audience,
        );
        this.props.visibility = visibility;
        this.props.metadata = this.props.metadata.recordUpdate(now);
    }

    private record(
        Event: CalendarEventFactClass,
        userId: string,
        now: Date,
    ): void {
        this.addDomainEvent(
            new Event(eventParamsOf(this.props, userId, now, null)),
        );
    }
}
