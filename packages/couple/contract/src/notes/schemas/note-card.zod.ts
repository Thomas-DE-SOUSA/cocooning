import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// A null value is « non trouvé » (R21); isManual marks a value corrected by hand (R22).
const NoteCardFieldSchema = z.object({
    name: z.string(),
    value: z.string().nullable(),
    isManual: z.boolean(),
});

const CardCandidateSchema = z.object({
    label: z.string(),
    detail: z.string(),
});

// The body of every card action: the NoteCardView of the use cases.
export const NoteCardResponseSchema = z.object({
    noteCardId: z.string(),
    noteId: z.string(),
    status: z.enum(Object.values(NoteCardStatusEnum)),
    query: z.string(),
    fields: z.array(NoteCardFieldSchema),
    candidates: z.array(CardCandidateSchema),
    sources: z.array(z.string()),
    searchedAt: z.string().nullable(),
    updatedAt: z.string(),
});

export type NoteCardResponse = z.infer<typeof NoteCardResponseSchema>;
