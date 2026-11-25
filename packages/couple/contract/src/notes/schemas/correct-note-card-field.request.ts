import { CARD_FIELD_VALUE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import { CardFieldNameSchema } from './card-template.zod';

// R22: the value a partner writes by hand in one field of the card.
export const CorrectNoteCardFieldRequestSchema = z.object({
    name: CardFieldNameSchema,
    value: z.string().trim().min(1).max(CARD_FIELD_VALUE_MAX_LENGTH),
});

export type CorrectNoteCardFieldRequest = z.infer<
    typeof CorrectNoteCardFieldRequestSchema
>;
