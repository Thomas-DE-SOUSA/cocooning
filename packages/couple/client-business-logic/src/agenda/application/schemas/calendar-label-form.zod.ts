import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R12, as the API checks it: a trimmed name of 1 to CALENDAR_LABEL_NAME_MAX_LENGTH signs and a colour of the palette.
export const createCalendarLabelFormSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, t('form.labelName.errors.required'))
            .max(
                CALENDAR_LABEL_NAME_MAX_LENGTH,
                t('form.labelName.errors.tooLong'),
            ),
        color: z.enum(Object.values(CalendarLabelColorEnum), {
            error: t('form.labelColor.errors.required'),
        }),
    });

export type CalendarLabelForm = z.output<
    ReturnType<typeof createCalendarLabelFormSchema>
>;

export type CalendarLabelFormInput = z.input<
    ReturnType<typeof createCalendarLabelFormSchema>
>;
