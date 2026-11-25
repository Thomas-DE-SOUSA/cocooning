'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { MESSAGING_NAMESPACE } from '../data/messaging-i18n-namespaces';
import { messagingModule } from '../services/messaging-module.factory';
import { sendFlashMessage } from '../services/message-commands.service';
import type { FlashMessageFormInput } from '../view-models/flash-message-form.view-model';

// The page reads the feed again after router.refresh(): the action only says whether it worked (decision 0036).
export async function messagingFlashMessageSendAction(
    input: FlashMessageFormInput,
): Promise<Result<null, ApiError>> {
    return sendFlashMessage(input, {
        t: await getServerTranslation(MESSAGING_NAMESPACE),
        sendFlashMessage: messagingModule().sendFlashMessage,
    });
}
