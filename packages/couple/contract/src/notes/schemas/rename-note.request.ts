import { z } from 'zod';
import { NoteTitleSchema } from './note-title.zod';

export const RenameNoteRequestSchema = z.object({ title: NoteTitleSchema });

export type RenameNoteRequest = z.infer<typeof RenameNoteRequestSchema>;
