import { z } from 'zod';

export const InstantPhotoParamsRequestSchema = z.object({
    instantPhotoId: z.uuid(),
});

export type InstantPhotoParamsRequest = z.infer<
    typeof InstantPhotoParamsRequestSchema
>;
