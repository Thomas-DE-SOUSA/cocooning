import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// The body of every calendar event action that returns one: the CalendarEventView of the use cases.
export const CalendarEventResponseSchema = z.object({
    calendarEventId: z.string(),
    ownerId: z.string(),
    isOwner: z.boolean(),
    title: z.string(),
    description: z.string().nullable(),
    startsOn: z.string(),
    endsOn: z.string().nullable(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
    visibility: z.enum(Object.values(CalendarEventVisibilityEnum)),
    updatedAt: z.string(),
});

export type CalendarEventResponse = z.infer<typeof CalendarEventResponseSchema>;

// The events of a range of days, in day order.
export const CalendarEventListResponseSchema = z.object({
    items: z.array(CalendarEventResponseSchema),
});

export type CalendarEventListResponse = z.infer<
    typeof CalendarEventListResponseSchema
>;
