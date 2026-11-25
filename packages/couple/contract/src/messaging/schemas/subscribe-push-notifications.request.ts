import { PUSH_SUBSCRIPTION_KEY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import { PushEndpointSchema } from './push-endpoint.zod';

const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

const PushKeySchema = z
    .string()
    .min(1)
    .max(PUSH_SUBSCRIPTION_KEY_MAX_LENGTH)
    .regex(BASE64URL);

// R11: the JSON of the browser's PushSubscription; its other fields (expirationTime) are dropped.
export const SubscribePushNotificationsRequestSchema = z.object({
    endpoint: PushEndpointSchema,
    keys: z.object({ p256dh: PushKeySchema, auth: PushKeySchema }),
});

export type SubscribePushNotificationsRequest = z.infer<
    typeof SubscribePushNotificationsRequestSchema
>;
