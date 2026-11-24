import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// R2 as the API checks it: the spaces around do not count, 1 to FLASH_MESSAGE_TEXT_MAX_LENGTH signs.
export const createFlashMessageFormSchema = (t: Translator) =>
    z.object({
        text: z
            .string()
            .trim()
            .min(1, t('form.text.errors.required'))
            .max(FLASH_MESSAGE_TEXT_MAX_LENGTH, t('form.text.errors.tooLong')),
    });

export type FlashMessageForm = z.output<
    ReturnType<typeof createFlashMessageFormSchema>
>;
