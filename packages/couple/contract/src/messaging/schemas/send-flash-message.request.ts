import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R2: typed or a ready-made word, trimmed, 1 to FLASH_MESSAGE_TEXT_MAX_LENGTH signs.
export const SendFlashMessageRequestSchema = z.object({
    text: z.string().trim().min(1).max(FLASH_MESSAGE_TEXT_MAX_LENGTH),
});

export type SendFlashMessageRequest = z.infer<
    typeof SendFlashMessageRequestSchema
>;
