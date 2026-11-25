// R11 of agenda: who the event is for, relative to its author; the PWA says « Moi », « Toi » or « Nous deux » to the reader.
export const CalendarEventAudienceEnum = {
    OWNER: 'OWNER',
    PARTNER: 'PARTNER',
    BOTH: 'BOTH',
} as const;

export type CalendarEventAudience =
    (typeof CalendarEventAudienceEnum)[keyof typeof CalendarEventAudienceEnum];
