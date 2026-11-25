import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { FolderResponseSchema } from './folder.zod';
import { NoteResponseSchema } from './note.zod';

const FolderPathItemSchema = z.object({
    folderId: z.string(),
    name: z.string(),
});

const FolderEntrySchema = FolderResponseSchema.extend({
    folderCount: z.number(),
    noteCount: z.number(),
});

// path runs from the root of the space to the folder opened; empty at the root.
export const NoteSpaceContentsResponseSchema = z.object({
    space: z.enum(Object.values(NoteSpaceEnum)),
    path: z.array(FolderPathItemSchema),
    folders: z.array(FolderEntrySchema),
    notes: z.array(NoteResponseSchema),
});

export type NoteSpaceContentsResponse = z.infer<
    typeof NoteSpaceContentsResponseSchema
>;
