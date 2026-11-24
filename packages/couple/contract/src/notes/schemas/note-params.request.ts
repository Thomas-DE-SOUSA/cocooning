import { z } from 'zod';

export const NoteParamsRequestSchema = z.object({ noteId: z.uuid() });

export type NoteParamsRequest = z.infer<typeof NoteParamsRequestSchema>;
