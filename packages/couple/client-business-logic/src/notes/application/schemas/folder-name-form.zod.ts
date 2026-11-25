import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R13, as the API checks it: trimmed, never empty, at most FOLDER_NAME_MAX_LENGTH signs.
export const createFolderNameFormSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, t('form.name.errors.required'))
            .max(FOLDER_NAME_MAX_LENGTH, t('form.name.errors.tooLong')),
    });

export type FolderNameForm = z.infer<
    ReturnType<typeof createFolderNameFormSchema>
>;
