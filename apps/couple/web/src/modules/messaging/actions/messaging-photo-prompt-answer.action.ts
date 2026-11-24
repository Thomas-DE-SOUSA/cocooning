'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { answerPhotoPrompt } from '../services/instant-photo-commands.service';

export async function messagingPhotoPromptAnswerAction(
    photoPromptId: string,
    form: FormData,
): Promise<Result<null, ApiError>> {
    return answerPhotoPrompt(
        photoPromptId,
        form.get(INSTANT_PHOTO_FORM_FIELD),
        messagingModule().answerPhotoPrompt,
    );
}
