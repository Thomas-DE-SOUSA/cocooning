import { isCalendarDay } from '@cocooning/shared-kernel/utils';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

const HourSchema = z.iso.time({ precision: -1 });

const isHour = (value: string): boolean => HourSchema.safeParse(value).success;

const emptyToNull = (value: string): string | null =>
    value === '' ? null : value;

// An optional field of the form: an empty input is no value. A badly written part aborts, so the order of R5 is checked only on readable parts.
const optionalField = (
    isWritten: (value: string) => boolean,
    message: string,
) =>
    z
        .string()
        .trim()
        .refine((value) => value === '' || isWritten(value), {
            error: message,
            abort: true,
        })
        .transform(emptyToNull);

// R5, how each part of the moment is written: days YYYY-MM-DD, hours HH:MM of Paris (decision 0047).
export const createCalendarEventMomentFields = (t: Translator) => ({
    startsOn: z
        .string()
        .trim()
        .min(1, {
            error: t('form.moment.errors.startsOnRequired'),
            abort: true,
        })
        .refine(isCalendarDay, {
            error: t('form.moment.errors.dayInvalid'),
            abort: true,
        }),
    endsOn: optionalField(isCalendarDay, t('form.moment.errors.dayInvalid')),
    startsAt: optionalField(isHour, t('form.moment.errors.hourInvalid')),
    endsAt: optionalField(isHour, t('form.moment.errors.hourInvalid')),
});
