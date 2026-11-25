'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { readPushPublicKey } from '../services/push-subscription-commands.service';

export async function messagingPushPublicKeyAction(): Promise<
    Result<string, ApiError>
> {
    return readPushPublicKey(messagingModule().getPushPublicKey);
}
