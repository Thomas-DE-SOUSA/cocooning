import { PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// R11: the https address of a phone's push service, as the browser's PushSubscription gives it.
export const PushEndpointSchema = z
    .url({ protocol: /^https$/ })
    .max(PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH);
