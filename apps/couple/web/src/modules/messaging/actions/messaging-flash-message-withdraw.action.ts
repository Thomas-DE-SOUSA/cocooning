'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { withdrawFlashMessage } from '../services/message-commands.service';

export async function messagingFlashMessageWithdrawAction(
    flashMessageId: string,
): Promise<Result<null, ApiError>> {
    const useCase = messagingModule().withdrawFlashMessage;
    return withdrawFlashMessage(flashMessageId, (id) => useCase.execute(id));
}
