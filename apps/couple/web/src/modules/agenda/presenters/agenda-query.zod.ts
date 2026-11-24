import { isCalendarDay } from '@cocooning/shared-kernel/utils';
import { z } from 'zod';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// The query parameters of /agenda; a missing or invalid one becomes null and falls back to today.
export const AgendaQueryParamsSchema = z.object({
    day: z.string().refine(isCalendarDay).nullable().catch(null),
    month: z.string().regex(MONTH_PATTERN).nullable().catch(null),
});
