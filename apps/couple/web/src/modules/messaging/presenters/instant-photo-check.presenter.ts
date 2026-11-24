import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';

// R3 on the phone: only the size. The declared type is not checked: an iPhone may declare image/heif or nothing, and the
// API reads the format in the bytes. null when the photo may leave; otherwise the key of the refusal.
export function presentInstantPhotoRefusalKey(size: number): string | null {
    if (size < 1) return 'form.photo.errors.required';
    if (size > INSTANT_PHOTO_MAX_BYTES) return 'form.photo.errors.tooHeavy';
    return null;
}
