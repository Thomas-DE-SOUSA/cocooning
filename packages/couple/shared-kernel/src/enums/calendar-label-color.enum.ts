// R12 of agenda: the eight tints of the palette a label takes, set for both themes by the PWA.
export const CalendarLabelColorEnum = {
    SAGE: 'SAGE',
    ROSE: 'ROSE',
    TERRACOTTA: 'TERRACOTTA',
    OCHRE: 'OCHRE',
    SLATE: 'SLATE',
    PLUM: 'PLUM',
    MINT: 'MINT',
    PEBBLE: 'PEBBLE',
} as const;

export type CalendarLabelColor =
    (typeof CalendarLabelColorEnum)[keyof typeof CalendarLabelColorEnum];
