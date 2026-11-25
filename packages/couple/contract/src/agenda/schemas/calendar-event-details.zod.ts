import { CalendarEventAudienceEnum } from '@cocooning/couple-shared-kernel/enums';
import {
    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
    CALENDAR_EVENT_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// Days YYYY-MM-DD and hours HH:MM of Paris (decision 0047); the domain checks their order (R5).
const DaySchema = z.iso.date();
const HourSchema = z.iso.time({ precision: -1 });

// The details typed in the event form, sent whole at creation and at each edit (R2, R5, R6, R11).
// The domain checks that a private event is for its author (R11).
export const CalendarEventDetailsSchema = z.object({
    title: z.string().trim().min(1).max(CALENDAR_EVENT_TITLE_MAX_LENGTH),
    description: z
        .string()
        .trim()
        .max(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH)
        .nullable(),
    startsOn: DaySchema,
    endsOn: DaySchema.nullable(),
    startsAt: HourSchema.nullable(),
    endsAt: HourSchema.nullable(),
    audience: z.enum(Object.values(CalendarEventAudienceEnum)),
});
