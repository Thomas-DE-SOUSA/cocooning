import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R12: trimmed, never empty, at most CALENDAR_LABEL_NAME_MAX_LENGTH signs; the domain checks it again.
export const CalendarLabelNameSchema = z
    .string()
    .trim()
    .min(1)
    .max(CALENDAR_LABEL_NAME_MAX_LENGTH);
