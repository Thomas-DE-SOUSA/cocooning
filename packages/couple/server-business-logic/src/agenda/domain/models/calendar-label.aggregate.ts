import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { CalendarLabelCreatedEvent } from '../events/calendar-label-created.event';
import { CalendarLabelDeletedEvent } from '../events/calendar-label-deleted.event';
import { CalendarLabelEditedEvent } from '../events/calendar-label-edited.event';
import type { CalendarLabelEventParams } from '../events/calendar-label-event-params';
import { CalendarLabelId } from '../value-objects/calendar-label-id.vo';
import { CalendarLabelName } from '../value-objects/calendar-label-name.vo';
import type {
    CalendarLabelProps,
    CalendarLabelSnapshot,
    CreateCalendarLabelInput,
} from './calendar-label.aggregate.type';

const INITIAL_VERSION = 1;

// R12: the labels belong to the couple; both partners create, edit and delete them.
export class CalendarLabel extends AggregateRoot {
    private constructor(private readonly props: CalendarLabelProps) {
        super();
    }

    static create(input: CreateCalendarLabelInput, now: Date): CalendarLabel {
        const label = new CalendarLabel({
            ...input,
            id: CalendarLabelId.generate(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        const data = { ownerId: input.ownerId, color: input.color };
        label.addDomainEvent(
            new CalendarLabelCreatedEvent(
                label.eventParams(input.ownerId, now, data),
            ),
        );
        return label;
    }

    static fromSnapshot(snapshot: CalendarLabelSnapshot): CalendarLabel {
        return new CalendarLabel({
            id: CalendarLabelId.from(snapshot.id),
            coupleId: snapshot.coupleId,
            ownerId: snapshot.ownerId,
            name: CalendarLabelName.from(snapshot.name),
            color: snapshot.color,
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R12: one edit renames and recolours.
    edit(
        userId: string,
        name: CalendarLabelName,
        color: CalendarLabelColor,
        now: Date,
    ): void {
        this.props.name = name;
        this.props.color = color;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new CalendarLabelEditedEvent(
                this.eventParams(userId, now, { color }),
            ),
        );
    }

    // R14: softly; its events lose it through the repository, in the same unit of work.
    delete(userId: string, now: Date): void {
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.addDomainEvent(
            new CalendarLabelDeletedEvent(this.eventParams(userId, now, null)),
        );
    }

    get id(): CalendarLabelId {
        return this.props.id;
    }

    get coupleId(): string {
        return this.props.coupleId;
    }

    get updatedAt(): Date {
        return this.props.metadata.updatedAt;
    }

    toSnapshot(): CalendarLabelSnapshot {
        return {
            id: this.props.id.getValue(),
            coupleId: this.props.coupleId,
            ownerId: this.props.ownerId,
            name: this.props.name.value,
            color: this.props.color,
            version: this.props.version,
            metadata: this.props.metadata.toSnapshot(),
        };
    }

    private eventParams<TData>(
        userId: string,
        now: Date,
        data: TData,
    ): CalendarLabelEventParams<TData> {
        return {
            coupleId: this.props.coupleId,
            userId,
            calendarLabelId: this.props.id.getValue(),
            occurredAt: now,
            data,
        };
    }
}
