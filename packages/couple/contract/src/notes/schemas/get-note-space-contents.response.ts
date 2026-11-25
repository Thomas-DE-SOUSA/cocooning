import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { FolderResponseSchema } from './folder.zod';
import { NoteDetailResponseSchema } from './note-detail.zod';

const FolderPathItemSchema = z.object({
    folderId: z.string(),
    name: z.string(),
});

const FolderEntrySchema = FolderResponseSchema.extend({
    folderCount: z.number(),
    noteCount: z.number(),
});

// R18: in a smart tree, the subject and the template the opened folder reads, and the folder holding them.
const CardContextSchema = z.object({
    folderId: z.string(),
    subject: z.string(),
    cardTemplate: z.array(z.string()),
});

// path runs from the root of the space to the folder opened; empty at the root. Each note comes with its card (R20).
export const NoteSpaceContentsResponseSchema = z.object({
    space: z.enum(Object.values(NoteSpaceEnum)),
    path: z.array(FolderPathItemSchema),
    cardContext: CardContextSchema.nullable(),
    folders: z.array(FolderEntrySchema),
    notes: z.array(NoteDetailResponseSchema),
});

export type NoteSpaceContentsResponse = z.infer<
    typeof NoteSpaceContentsResponseSchema
>;
