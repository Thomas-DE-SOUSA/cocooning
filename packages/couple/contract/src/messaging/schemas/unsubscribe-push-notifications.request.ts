import { z } from 'zod';
import { PushEndpointSchema } from './push-endpoint.zod';

// R11: a partner forgets the subscription of one of their phones, named by its endpoint.
export const UnsubscribePushNotificationsRequestSchema = z.object({
    endpoint: PushEndpointSchema,
});

export type UnsubscribePushNotificationsRequest = z.infer<
    typeof UnsubscribePushNotificationsRequestSchema
>;
