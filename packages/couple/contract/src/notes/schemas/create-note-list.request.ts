import { z } from 'zod';
import { NoteListEmojiSchema } from './note-list-emoji.zod';
import { NoteListKindSchema } from './note-list-kind.zod';
import { NoteSpaceSchema } from './note-space.zod';
import { NoteTitleSchema } from './note-title.zod';

// R26: a list of a section, shared (« Communes ») or private (« Rien que pour moi »), always at the root of its space.
export const CreateNoteListRequestSchema = z.object({
    kind: NoteListKindSchema,
    space: NoteSpaceSchema,
    title: NoteTitleSchema,
    emoji: NoteListEmojiSchema.default(null),
});

export type CreateNoteListRequest = z.infer<typeof CreateNoteListRequestSchema>;
