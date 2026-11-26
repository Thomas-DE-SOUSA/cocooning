import { z } from 'zod';
import { NoteListEmojiSchema } from './note-list-emoji.zod';
import { NoteTitleSchema } from './note-title.zod';

// R6, R26: the title and the emoji, sent together; null removes the emoji.
export const EditNoteListRequestSchema = z.object({
    title: NoteTitleSchema,
    emoji: NoteListEmojiSchema,
});

export type EditNoteListRequest = z.infer<typeof EditNoteListRequestSchema>;
