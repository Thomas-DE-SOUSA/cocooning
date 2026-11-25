import { NOTE_CARD_QUERY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R19: « je précise », what the partner types to search again.
export const RefineNoteCardRequestSchema = z.object({
    query: z.string().trim().min(1).max(NOTE_CARD_QUERY_MAX_LENGTH),
});

export type RefineNoteCardRequest = z.infer<typeof RefineNoteCardRequestSchema>;
