import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { NoteSpaceSchema } from './note-space.zod';
import { NoteTitleSchema } from './note-title.zod';

// R2, R11, R13: a note is created at the root of « Partagé » unless the partner names a space and a folder.
export const CreateNoteRequestSchema = z.object({
    title: NoteTitleSchema,
    space: NoteSpaceSchema.default(NoteSpaceEnum.SHARED),
    folderId: z.uuid().nullable().default(null),
});

export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;
