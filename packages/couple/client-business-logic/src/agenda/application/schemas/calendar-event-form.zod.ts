import {
    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
    CALENDAR_EVENT_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';
import { ViewerAudienceEnum } from '../../domain/enums/viewer-audience.enum';
import { checkCalendarEventAudience } from './calendar-event-audience.zod';
import { checkCalendarEventMomentOrder } from './calendar-event-moment-order.zod';
import { createCalendarEventMomentFields } from './calendar-event-moment.zod';

// R2, R5, R6, R11 as the API checks them; an empty optional input becomes null. isPrivate is R3's "rien que pour moi",
// audience is who the event is for seen by the partner who fills the form, labelId the label of R13 or none.
export const createCalendarEventFormSchema = (t: Translator) =>
    z
        .object({
            title: z
                .string()
                .trim()
                .min(1, t('form.title.errors.required'))
                .max(
                    CALENDAR_EVENT_TITLE_MAX_LENGTH,
                    t('form.title.errors.tooLong'),
                ),
            description: z
                .string()
                .trim()
                .max(
                    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
                    t('form.description.errors.tooLong'),
                )
                .transform((value) => (value === '' ? null : value)),
            ...createCalendarEventMomentFields(t),
            isPrivate: z.boolean(),
            audience: z.enum(Object.values(ViewerAudienceEnum), {
                error: t('form.audience.errors.required'),
            }),
            labelId: z.string().nullable(),
        })
        .superRefine(checkCalendarEventMomentOrder(t))
        .superRefine(checkCalendarEventAudience(t));

export type CalendarEventForm = z.output<
    ReturnType<typeof createCalendarEventFormSchema>
>;

export type CalendarEventFormInput = z.input<
    ReturnType<typeof createCalendarEventFormSchema>
>;
