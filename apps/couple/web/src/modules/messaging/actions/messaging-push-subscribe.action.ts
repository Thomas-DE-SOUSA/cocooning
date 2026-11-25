'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { subscribePushNotifications } from '../services/push-subscription-commands.service';

export async function messagingPushSubscribeAction(
    subscription: SubscribePushNotificationsRequest,
): Promise<Result<null, ApiError>> {
    return subscribePushNotifications(
        subscription,
        messagingModule().subscribePushNotifications,
    );
}
