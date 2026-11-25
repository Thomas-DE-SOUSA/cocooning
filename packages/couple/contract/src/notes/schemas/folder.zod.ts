import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// The body of every folder action that returns a folder: the FolderView of the use cases.
export const FolderResponseSchema = z.object({
    folderId: z.string(),
    space: z.enum(Object.values(NoteSpaceEnum)),
    parentFolderId: z.string().nullable(),
    name: z.string(),
    updatedAt: z.string(),
});

export type FolderResponse = z.infer<typeof FolderResponseSchema>;
