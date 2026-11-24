import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';
import { isInstantPhotoContentType } from '../../domain/models/instant-photo-content-type';

// R3 before the upload, from what the phone declares; the API stays the authority and reads the bytes.
export const createInstantPhotoFormSchema = (t: Translator) =>
    z.object({
        contentType: z
            .string()
            .refine(
                isInstantPhotoContentType,
                t('form.photo.errors.formatInvalid'),
            ),
        size: z
            .number()
            .int()
            .min(1, t('form.photo.errors.required'))
            .max(INSTANT_PHOTO_MAX_BYTES, t('form.photo.errors.tooHeavy')),
    });

export type InstantPhotoForm = z.output<
    ReturnType<typeof createInstantPhotoFormSchema>
>;
