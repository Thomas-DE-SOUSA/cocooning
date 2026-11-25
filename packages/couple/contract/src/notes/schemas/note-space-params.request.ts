import { z } from 'zod';
import { NoteSpaceSchema } from './note-space.zod';

export const NoteSpaceParamsRequestSchema = z.object({
    space: NoteSpaceSchema,
});

export type NoteSpaceParamsRequest = z.infer<
    typeof NoteSpaceParamsRequestSchema
>;
