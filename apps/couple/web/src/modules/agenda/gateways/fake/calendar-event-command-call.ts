import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';

export type CalendarEventCommandCall =
    | {
          readonly operation: 'createCalendarEvent';
          readonly form: CalendarEventForm;
      }
    | {
          readonly operation: 'editCalendarEvent';
          readonly calendarEventId: string;
          readonly form: CalendarEventForm;
      }
    | {
          readonly operation:
              | 'shareCalendarEvent'
              | 'makeCalendarEventPrivate'
              | 'deleteCalendarEvent';
          readonly calendarEventId: string;
      };
