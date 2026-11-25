'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { unsubscribePushNotifications } from '../services/push-subscription-commands.service';

export async function messagingPushUnsubscribeAction(
    endpoint: string,
): Promise<Result<null, ApiError>> {
    return unsubscribePushNotifications(
        endpoint,
        messagingModule().unsubscribePushNotifications,
    );
}
