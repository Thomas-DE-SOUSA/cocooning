// What the drawer sends: a creation, a save of an edited event (details, visibility or both), a deletion.
export const CalendarEventCommandEnum = {
    CREATE_CALENDAR_EVENT: 'CREATE_CALENDAR_EVENT',
    SAVE_CALENDAR_EVENT: 'SAVE_CALENDAR_EVENT',
    DELETE_CALENDAR_EVENT: 'DELETE_CALENDAR_EVENT',
} as const;

export type CalendarEventCommand =
    (typeof CalendarEventCommandEnum)[keyof typeof CalendarEventCommandEnum];

// R8: the author changes the visibility through share or make private, never through the edit.
export const CalendarEventVisibilityChangeEnum = {
    SHARE: 'SHARE',
    MAKE_PRIVATE: 'MAKE_PRIVATE',
} as const;

export type CalendarEventVisibilityChange =
    (typeof CalendarEventVisibilityChangeEnum)[keyof typeof CalendarEventVisibilityChangeEnum];

export type CalendarEventSave = {
    readonly editsDetails: boolean;
    readonly visibilityChange: CalendarEventVisibilityChange | null;
};

export const CalendarEventCommandFailureFollowUpEnum = {
    SIGN_IN: 'SIGN_IN',
    REFRESH: 'REFRESH',
    NONE: 'NONE',
} as const;

export type CalendarEventCommandFailureFollowUp =
    (typeof CalendarEventCommandFailureFollowUpEnum)[keyof typeof CalendarEventCommandFailureFollowUpEnum];
