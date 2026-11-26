import { toViewerAudience } from '@cocooning/couple-client-business-logic/agenda';
import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import {
    type AudiencePill,
    AudiencePillEnum,
    type EventTint,
    EventTintEnum,
} from '../view-models/event-tint.view-model';
import type { CalendarLabelIndex } from './calendar-labels.presenter';

export type EventLabel = {
    readonly tint: EventTint;
    readonly labelName: string | null;
};

const NO_LABEL: EventLabel = { tint: EventTintEnum.NEUTRAL, labelName: null };

// R13: the colour of its label, neutral without one. A label deleted since the events were read is no label (R14).
export function presentEventLabel(
    labelId: string | null,
    labels: CalendarLabelIndex,
): EventLabel {
    const label = labelId === null ? undefined : labels.get(labelId);
    if (label === undefined) return NO_LABEL;
    return { tint: label.color, labelName: label.name };
}

// R11, R7: "Moi", "Toi" or "Nous deux" for the reader; my private event says "Rien que pour moi".
export const presentAudiencePill = (
    event: CalendarEventResponse,
): AudiencePill =>
    event.visibility === CalendarEventVisibilityEnum.PRIVATE
        ? AudiencePillEnum.PRIVATE
        : toViewerAudience(event.audience, event.isOwner);
