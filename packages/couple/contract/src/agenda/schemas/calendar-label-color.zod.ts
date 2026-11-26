import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// R12: one of the eight tints of the palette.
export const CalendarLabelColorSchema = z.enum(
    Object.values(CalendarLabelColorEnum),
);
