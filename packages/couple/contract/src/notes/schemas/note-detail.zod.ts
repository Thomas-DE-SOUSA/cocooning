import { z } from 'zod';
import { NoteCardResponseSchema } from './note-card.zod';
import { NoteResponseSchema } from './note.zod';

// A note with its card, null outside a smart folder (R20): the page of a note and the content of a folder.
export const NoteDetailResponseSchema = NoteResponseSchema.extend({
    card: NoteCardResponseSchema.nullable(),
});

export type NoteDetailResponse = z.infer<typeof NoteDetailResponseSchema>;
