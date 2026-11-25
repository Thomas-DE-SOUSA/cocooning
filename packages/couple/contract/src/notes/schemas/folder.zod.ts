import {
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// The body of every folder action that returns a folder: the FolderView of the use cases.
// subject and cardTemplate are those the folder holds: null on a classic folder and inside a smart tree (R18).
export const FolderResponseSchema = z.object({
    folderId: z.string(),
    space: z.enum(Object.values(NoteSpaceEnum)),
    kind: z.enum(Object.values(FolderKindEnum)),
    parentFolderId: z.string().nullable(),
    name: z.string(),
    subject: z.string().nullable(),
    cardTemplate: z.array(z.string()).nullable(),
    updatedAt: z.string(),
});

export type FolderResponse = z.infer<typeof FolderResponseSchema>;
