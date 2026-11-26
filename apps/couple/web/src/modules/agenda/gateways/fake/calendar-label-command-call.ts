import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';

export type CalendarLabelCommandCall =
    | {
          readonly operation: 'createCalendarLabel';
          readonly form: CalendarLabelForm;
      }
    | {
          readonly operation: 'editCalendarLabel';
          readonly calendarLabelId: string;
          readonly form: CalendarLabelForm;
      }
    | {
          readonly operation: 'deleteCalendarLabel';
          readonly calendarLabelId: string;
      };
