import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

const NoteSpaceSummarySchema = z.object({
    space: z.enum(Object.values(NoteSpaceEnum)),
    folderCount: z.number(),
    noteCount: z.number(),
});

// R10: « Partagé » then « Privé », each with what the partner sees in it.
export const NoteSpacesResponseSchema = z.object({
    spaces: z.array(NoteSpaceSummarySchema),
});

export type NoteSpacesResponse = z.infer<typeof NoteSpacesResponseSchema>;
