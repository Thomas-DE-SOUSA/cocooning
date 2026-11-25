import { NOTE_CARD_QUERY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R19, as the API checks it: « je précise », trimmed, 1 to NOTE_CARD_QUERY_MAX_LENGTH signs.
export const createNoteCardQueryFormSchema = (t: Translator) =>
    z.object({
        query: z
            .string()
            .trim()
            .min(1, t('form.query.errors.required'))
            .max(NOTE_CARD_QUERY_MAX_LENGTH, t('form.query.errors.tooLong')),
    });

export type NoteCardQueryForm = z.infer<
    ReturnType<typeof createNoteCardQueryFormSchema>
>;
