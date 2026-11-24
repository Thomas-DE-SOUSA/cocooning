import { z } from 'zod';

export const CalendarEventParamsRequestSchema = z.object({
    calendarEventId: z.uuid(),
});

export type CalendarEventParamsRequest = z.infer<
    typeof CalendarEventParamsRequestSchema
>;
