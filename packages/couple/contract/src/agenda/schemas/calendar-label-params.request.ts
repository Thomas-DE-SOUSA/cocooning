import { z } from 'zod';

export const CalendarLabelParamsRequestSchema = z.object({
    calendarLabelId: z.uuid(),
});

export type CalendarLabelParamsRequest = z.infer<
    typeof CalendarLabelParamsRequestSchema
>;
