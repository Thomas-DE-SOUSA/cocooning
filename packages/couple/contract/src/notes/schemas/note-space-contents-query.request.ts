import { z } from 'zod';

// Without a folder, the root of the space.
export const NoteSpaceContentsQueryRequestSchema = z.object({
    folderId: z.uuid().nullable().default(null),
});

export type NoteSpaceContentsQueryRequest = z.infer<
    typeof NoteSpaceContentsQueryRequestSchema
>;
