import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { CalendarLabelId } from '../value-objects/calendar-label-id.vo';
import type { CalendarLabelName } from '../value-objects/calendar-label-name.vo';

export type CalendarLabelProps = {
    readonly id: CalendarLabelId;
    readonly coupleId: string;
    readonly ownerId: string;
    name: CalendarLabelName;
    color: CalendarLabelColor;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateCalendarLabelInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly name: CalendarLabelName;
    readonly color: CalendarLabelColor;
};

export type CalendarLabelSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly name: string;
    readonly color: CalendarLabelColor;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
