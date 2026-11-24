import type { z } from 'zod';
import { CalendarEventDetailsSchema } from './calendar-event-details.zod';

export const EditCalendarEventRequestSchema = CalendarEventDetailsSchema;

export type EditCalendarEventRequest = z.infer<
    typeof EditCalendarEventRequestSchema
>;
