'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { withdrawInstantPhoto } from '../services/message-commands.service';

export async function messagingInstantPhotoWithdrawAction(
    instantPhotoId: string,
): Promise<Result<null, ApiError>> {
    const useCase = messagingModule().withdrawInstantPhoto;
    return withdrawInstantPhoto(instantPhotoId, (id) => useCase.execute(id));
}
