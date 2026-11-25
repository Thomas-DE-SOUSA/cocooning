import { z } from 'zod';

// R15: a null parent is the root of the folder's own space.
export const MoveFolderRequestSchema = z.object({
    parentFolderId: z.uuid().nullable(),
});

export type MoveFolderRequest = z.infer<typeof MoveFolderRequestSchema>;
