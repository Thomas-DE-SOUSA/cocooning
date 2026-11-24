import { z } from 'zod';

export const PhotoPromptParamsRequestSchema = z.object({
    photoPromptId: z.uuid(),
});

export type PhotoPromptParamsRequest = z.infer<
    typeof PhotoPromptParamsRequestSchema
>;
