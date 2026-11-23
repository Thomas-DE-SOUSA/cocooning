import { z } from 'zod';
import { NoteTitleSchema } from './note-title.zod';

export const CreateNoteRequestSchema = z.object({ title: NoteTitleSchema });

export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;
