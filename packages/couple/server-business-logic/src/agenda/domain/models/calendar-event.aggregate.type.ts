import type { CalendarEventVisibility } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { CalendarEventDetails } from '../value-objects/calendar-event-details';
import type { CalendarEventId } from '../value-objects/calendar-event-id.vo';

export type CalendarEventProps = {
    readonly id: CalendarEventId;
    readonly coupleId: string;
    readonly ownerId: string;
    details: CalendarEventDetails;
    visibility: CalendarEventVisibility;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateCalendarEventInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly details: CalendarEventDetails;
    readonly visibility: CalendarEventVisibility;
};

export type CalendarEventSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly description: string | null;
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly visibility: CalendarEventVisibility;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
