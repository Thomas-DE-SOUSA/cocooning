import { z } from 'zod';
import { CalendarLabelColorSchema } from './calendar-label-color.zod';
import { CalendarLabelNameSchema } from './calendar-label-name.zod';

// R12: one edit renames and recolours, both sent again.
export const EditCalendarLabelRequestSchema = z.object({
    name: CalendarLabelNameSchema,
    color: CalendarLabelColorSchema,
});

export type EditCalendarLabelRequest = z.infer<
    typeof EditCalendarLabelRequestSchema
>;
