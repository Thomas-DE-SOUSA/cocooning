import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// R28: a list on the home of its section, with the number of lines left to check; the NoteListView of the use cases.
export const NoteListResponseSchema = z.object({
    noteId: z.string(),
    title: z.string(),
    emoji: z.string().nullable(),
    visibility: z.enum(Object.values(NoteVisibilityEnum)),
    isOwner: z.boolean(),
    openItemCount: z.number(),
    updatedAt: z.string(),
});

export type NoteListResponse = z.infer<typeof NoteListResponseSchema>;

// The lists of one section the partner sees, the most recently changed first.
export const NoteListIndexResponseSchema = z.object({
    items: z.array(NoteListResponseSchema),
});

export type NoteListIndexResponse = z.infer<typeof NoteListIndexResponseSchema>;
