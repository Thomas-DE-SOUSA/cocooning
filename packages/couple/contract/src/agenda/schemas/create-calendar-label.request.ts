import { z } from 'zod';
import { CalendarLabelColorSchema } from './calendar-label-color.zod';
import { CalendarLabelNameSchema } from './calendar-label-name.zod';

export const CreateCalendarLabelRequestSchema = z.object({
    name: CalendarLabelNameSchema,
    color: CalendarLabelColorSchema,
});

export type CreateCalendarLabelRequest = z.infer<
    typeof CreateCalendarLabelRequestSchema
>;
