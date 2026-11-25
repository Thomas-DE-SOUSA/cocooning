import { EntityMetadata } from '@cocooning/shared-kernel/domain';
import { CalendarEventDescription } from '../value-objects/calendar-event-description.vo';
import { CalendarEventId } from '../value-objects/calendar-event-id.vo';
import { CalendarEventMoment } from '../value-objects/calendar-event-moment.vo';
import { CalendarEventTitle } from '../value-objects/calendar-event-title.vo';
import type {
    CalendarEventProps,
    CalendarEventSnapshot,
} from './calendar-event.aggregate.type';

// Stored data is read back without validation (domain.md rule 5).
export const calendarEventPropsFromSnapshot = (
    snapshot: CalendarEventSnapshot,
): CalendarEventProps => ({
    id: CalendarEventId.from(snapshot.id),
    coupleId: snapshot.coupleId,
    ownerId: snapshot.ownerId,
    details: {
        title: CalendarEventTitle.from(snapshot.title),
        description:
            snapshot.description === null
                ? null
                : CalendarEventDescription.from(snapshot.description),
        moment: CalendarEventMoment.from({
            startsOn: snapshot.startsOn,
            endsOn: snapshot.endsOn,
            startsAt: snapshot.startsAt,
            endsAt: snapshot.endsAt,
        }),
        audience: snapshot.audience,
    },
    visibility: snapshot.visibility,
    version: snapshot.version,
    metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
});

export const calendarEventSnapshotFromProps = ({
    id,
    coupleId,
    ownerId,
    details,
    visibility,
    version,
    metadata,
}: CalendarEventProps): CalendarEventSnapshot => ({
    id: id.getValue(),
    coupleId,
    ownerId,
    title: details.title.value,
    description:
        details.description === null ? null : details.description.value,
    ...details.moment.toSnapshot(),
    audience: details.audience,
    visibility,
    version,
    metadata: metadata.toSnapshot(),
});
