import { ViewerAudienceEnum } from '@cocooning/couple-client-business-logic/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';

// R13: an event takes the colour of its label, neutral without one (decision 0057: one design token each).
export const EventTintEnum = {
    ...CalendarLabelColorEnum,
    NEUTRAL: 'NEUTRAL',
} as const;

export type EventTint = (typeof EventTintEnum)[keyof typeof EventTintEnum];

// R11: who the event is for, seen by the reader; "rien que pour moi" has its own pill, it is always for me.
export const AudiencePillEnum = {
    ...ViewerAudienceEnum,
    PRIVATE: 'PRIVATE',
} as const;

export type AudiencePill =
    (typeof AudiencePillEnum)[keyof typeof AudiencePillEnum];
