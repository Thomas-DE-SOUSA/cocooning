import { z } from 'zod';

// R7, R8: the photo prompt of the day once issued, null before (its drawn time stays secret); instants as ISO strings.
const PhotoPromptResponseSchema = z.object({
    id: z.string(),
    issuedAt: z.string(),
    lateFrom: z.string(),
    closesAt: z.string(),
    myInstantPhotoId: z.string().nullable(),
    isAnsweredByPartner: z.boolean(),
});

export const TodayPhotoPromptResponseSchema = z.object({
    photoPrompt: PhotoPromptResponseSchema.nullable(),
});

export type TodayPhotoPromptResponse = z.infer<
    typeof TodayPhotoPromptResponseSchema
>;
