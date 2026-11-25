import { CARD_FIELD_VALUE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R22, as the API checks it: the value written by hand in a field, trimmed, 1 to CARD_FIELD_VALUE_MAX_LENGTH signs.
export const createNoteCardFieldFormSchema = (t: Translator) =>
    z.object({
        value: z
            .string()
            .trim()
            .min(1, t('form.value.errors.required'))
            .max(CARD_FIELD_VALUE_MAX_LENGTH, t('form.value.errors.tooLong')),
    });

export type NoteCardFieldForm = z.infer<
    ReturnType<typeof createNoteCardFieldFormSchema>
>;
