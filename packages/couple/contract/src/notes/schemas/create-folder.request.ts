import { z } from 'zod';
import { FolderNameSchema } from './folder-name.zod';
import { NoteSpaceSchema } from './note-space.zod';

// R13: a null parent is the root of the space.
export const CreateFolderRequestSchema = z.object({
    space: NoteSpaceSchema,
    parentFolderId: z.uuid().nullable(),
    name: FolderNameSchema,
});

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;
