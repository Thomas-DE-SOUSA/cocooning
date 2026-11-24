import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { CalendarEventDetailsSchema } from './calendar-event-details.zod';

// R3: SHARED, or PRIVATE when the author ticks "rien que pour moi".
export const CreateCalendarEventRequestSchema =
    CalendarEventDetailsSchema.extend({
        visibility: z.enum(Object.values(CalendarEventVisibilityEnum)),
    });

export type CreateCalendarEventRequest = z.infer<
    typeof CreateCalendarEventRequestSchema
>;
