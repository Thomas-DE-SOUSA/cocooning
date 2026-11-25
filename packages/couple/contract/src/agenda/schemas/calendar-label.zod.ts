import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// The body of every label action that returns one: the CalendarLabelView of the use cases.
export const CalendarLabelResponseSchema = z.object({
    calendarLabelId: z.string(),
    name: z.string(),
    color: z.enum(Object.values(CalendarLabelColorEnum)),
    updatedAt: z.string(),
});

export type CalendarLabelResponse = z.infer<typeof CalendarLabelResponseSchema>;

// The live labels of the couple, in creation order.
export const CalendarLabelListResponseSchema = z.object({
    items: z.array(CalendarLabelResponseSchema),
});

export type CalendarLabelListResponse = z.infer<
    typeof CalendarLabelListResponseSchema
>;
