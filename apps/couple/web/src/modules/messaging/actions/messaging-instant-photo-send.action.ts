'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { sendInstantPhoto } from '../services/instant-photo-commands.service';

// The photo arrives in a FormData, within serverActions.bodySizeLimit of next.config.ts.
export async function messagingInstantPhotoSendAction(
    form: FormData,
): Promise<Result<null, ApiError>> {
    return sendInstantPhoto(
        form.get(INSTANT_PHOTO_FORM_FIELD),
        messagingModule().sendInstantPhoto,
    );
}
