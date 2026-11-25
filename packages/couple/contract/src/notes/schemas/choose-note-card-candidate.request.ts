import { CARD_CANDIDATE_MAX_COUNT } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R19: the position of the chosen candidate in the card's list; the domain checks it exists.
export const ChooseNoteCardCandidateRequestSchema = z.object({
    candidateIndex: z
        .number()
        .int()
        .min(0)
        .max(CARD_CANDIDATE_MAX_COUNT - 1),
});

export type ChooseNoteCardCandidateRequest = z.infer<
    typeof ChooseNoteCardCandidateRequestSchema
>;
