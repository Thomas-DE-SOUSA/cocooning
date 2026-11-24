export const CalendarEventVisibilityEnum = {
    PRIVATE: 'PRIVATE',
    SHARED: 'SHARED',
} as const;

export type CalendarEventVisibility =
    (typeof CalendarEventVisibilityEnum)[keyof typeof CalendarEventVisibilityEnum];
