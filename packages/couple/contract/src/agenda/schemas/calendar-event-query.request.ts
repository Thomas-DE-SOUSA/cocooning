import { z } from 'zod';

// The days of the list, both included; the domain checks their order and CALENDAR_EVENT_RANGE_MAX_DAYS.
export const CalendarEventQueryRequestSchema = z.object({
    from: z.iso.date(),
    to: z.iso.date(),
});

export type CalendarEventQueryRequest = z.infer<
    typeof CalendarEventQueryRequestSchema
>;
