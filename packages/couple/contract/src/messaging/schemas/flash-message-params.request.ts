import { z } from 'zod';

export const FlashMessageParamsRequestSchema = z.object({
    flashMessageId: z.uuid(),
});

export type FlashMessageParamsRequest = z.infer<
    typeof FlashMessageParamsRequestSchema
>;
