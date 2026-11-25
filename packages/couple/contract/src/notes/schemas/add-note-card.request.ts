import { z } from 'zod';
import { NoteTitleSchema } from './note-title.zod';

// R19, R20: the name typed in a smart folder becomes the title of the note and the query of its card.
export const AddNoteCardRequestSchema = z.object({ name: NoteTitleSchema });

export type AddNoteCardRequest = z.infer<typeof AddNoteCardRequestSchema>;
