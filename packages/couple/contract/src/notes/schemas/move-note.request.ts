import { z } from 'zod';
import { NoteSpaceSchema } from './note-space.zod';

// R11: a null folder is the root of the space.
export const MoveNoteRequestSchema = z.object({
    space: NoteSpaceSchema,
    folderId: z.uuid().nullable(),
});

export type MoveNoteRequest = z.infer<typeof MoveNoteRequestSchema>;
