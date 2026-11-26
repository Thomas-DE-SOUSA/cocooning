import type { CalendarLabelColor } from '@cocooning/couple-shared-kernel/enums';

// A label of the couple (R12), as the screens show and pick it.
export type CalendarLabelItem = {
    readonly calendarLabelId: string;
    readonly name: string;
    readonly color: CalendarLabelColor;
};
