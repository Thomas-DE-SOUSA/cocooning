import type { InstantPhotoUpload } from '@cocooning/couple-client-business-logic/messaging';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';

// R3: the photo goes as multipart/form-data in the field the API reads; the declared type is only a hint, the API reads the bytes.
export function toInstantPhotoFormData(photo: InstantPhotoUpload): FormData {
    const form = new FormData();
    form.append(
        INSTANT_PHOTO_FORM_FIELD,
        new Blob([photo.bytes], { type: photo.contentType }),
        photo.fileName,
    );
    return form;
}
