import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R8, as the API checks it: trimmed, never empty, at most NOTE_TITLE_MAX_LENGTH signs.
export const createNoteTitleFormSchema = (t: Translator) =>
    z.object({
        title: z
            .string()
            .trim()
            .min(1, t('form.title.errors.required'))
            .max(NOTE_TITLE_MAX_LENGTH, t('form.title.errors.tooLong')),
    });

export type NoteTitleForm = z.infer<
    ReturnType<typeof createNoteTitleFormSchema>
>;
