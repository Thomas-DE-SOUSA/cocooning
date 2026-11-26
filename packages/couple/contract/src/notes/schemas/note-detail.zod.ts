import { z } from 'zod';
import { NoteCardResponseSchema } from './note-card.zod';
import { NoteListKindSchema } from './note-list-kind.zod';
import { NoteResponseSchema } from './note.zod';

// A note with its card, null outside a smart folder (R20): the page of a note and the content of a folder.
// R26: its section and emoji when it is a list, both null for an ordinary note.
export const NoteDetailResponseSchema = NoteResponseSchema.extend({
    card: NoteCardResponseSchema.nullable(),
    listKind: NoteListKindSchema.nullable(),
    emoji: z.string().nullable(),
});

export type NoteDetailResponse = z.infer<typeof NoteDetailResponseSchema>;
