import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { createOffsetPageResponseSchema } from '../../shared/offset-page.zod';

// The body of every note action that returns a note: the NoteView of the use cases.
export const NoteResponseSchema = z.object({
    noteId: z.string(),
    ownerId: z.string(),
    title: z.string(),
    visibility: z.enum(Object.values(NoteVisibilityEnum)),
    updatedAt: z.string(),
});

export type NoteResponse = z.infer<typeof NoteResponseSchema>;

export const NotePageResponseSchema =
    createOffsetPageResponseSchema(NoteResponseSchema);

export type NotePageResponse = z.infer<typeof NotePageResponseSchema>;
