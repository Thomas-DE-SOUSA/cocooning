import { z } from 'zod';
import { NoteListKindSchema } from './note-list-kind.zod';

// R28: the home of one section of the Lists tab.
export const NoteListQueryRequestSchema = z.object({
    kind: NoteListKindSchema,
});

export type NoteListQueryRequest = z.infer<typeof NoteListQueryRequestSchema>;
