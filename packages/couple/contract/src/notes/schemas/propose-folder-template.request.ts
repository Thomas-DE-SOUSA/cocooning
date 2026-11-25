import { z } from 'zod';
import { FolderNameSchema } from './folder-name.zod';
import { NoteSpaceSchema } from './note-space.zod';

// R17: the name and the place of the smart folder about to be created.
export const ProposeFolderTemplateRequestSchema = z.object({
    space: NoteSpaceSchema,
    parentFolderId: z.uuid().nullable(),
    name: FolderNameSchema,
});

export type ProposeFolderTemplateRequest = z.infer<
    typeof ProposeFolderTemplateRequestSchema
>;
