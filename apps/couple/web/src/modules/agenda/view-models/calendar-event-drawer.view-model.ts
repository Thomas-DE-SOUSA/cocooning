import type { AgendaDayItem } from './agenda-screen.view-model';

export const CalendarEventDrawerModeEnum = {
    CREATE: 'CREATE',
    EDIT: 'EDIT',
} as const;

// What the drawer works on: a new event on the chosen day, or an event of the day list.
export type CalendarEventDrawerTarget =
    | {
          readonly mode: typeof CalendarEventDrawerModeEnum.CREATE;
          readonly day: string;
      }
    | {
          readonly mode: typeof CalendarEventDrawerModeEnum.EDIT;
          readonly item: AgendaDayItem;
      };
