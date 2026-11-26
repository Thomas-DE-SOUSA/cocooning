import type { CalendarLabelItem } from './calendar-label.view-model';

// What the label sheet sends (R12, R14).
export const CalendarLabelCommandEnum = {
    CREATE_CALENDAR_LABEL: 'CREATE_CALENDAR_LABEL',
    EDIT_CALENDAR_LABEL: 'EDIT_CALENDAR_LABEL',
    DELETE_CALENDAR_LABEL: 'DELETE_CALENDAR_LABEL',
} as const;

export type CalendarLabelCommand =
    (typeof CalendarLabelCommandEnum)[keyof typeof CalendarLabelCommandEnum];

export const CalendarLabelSheetModeEnum = {
    CREATE: 'CREATE',
    EDIT: 'EDIT',
} as const;

// A new label from the event sheet, or a label of the "Nous" card to rename, recolour or delete.
export type CalendarLabelSheetTarget =
    | {
          readonly mode: typeof CalendarLabelSheetModeEnum.CREATE;
          readonly labels: readonly CalendarLabelItem[];
      }
    | {
          readonly mode: typeof CalendarLabelSheetModeEnum.EDIT;
          readonly label: CalendarLabelItem;
      };
