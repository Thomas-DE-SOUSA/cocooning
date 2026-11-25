import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R19, as the API checks it: the name typed in a smart folder becomes the title of the note (R8).
export const createNoteCardNameFormSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, t('form.name.errors.required'))
            .max(NOTE_TITLE_MAX_LENGTH, t('form.name.errors.tooLong')),
    });

export type NoteCardNameForm = z.infer<
    ReturnType<typeof createNoteCardNameFormSchema>
>;
