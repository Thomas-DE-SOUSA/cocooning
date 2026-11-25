import 'server-only';
import type {
    GetPushPublicKeyUseCase,
    SubscribePushNotificationsUseCase,
    UnsubscribePushNotificationsUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import {
    SubscribePushNotificationsRequestSchema,
    UnsubscribePushNotificationsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { invalidInput } from './message-commands.service';

// R11: the VAPID public key the phone subscribes with, nothing else of the response.
export async function readPushPublicKey(
    useCase: GetPushPublicKeyUseCase,
): Promise<Result<string, ApiError>> {
    const result = await useCase.execute();
    return result.success ? ok(result.value.publicKey) : result;
}

// core-frontend.md rule 14: a server action is a public endpoint, the subscription is validated again here (R11).
export async function subscribePushNotifications(
    input: unknown,
    useCase: SubscribePushNotificationsUseCase,
): Promise<Result<null, ApiError>> {
    const request = SubscribePushNotificationsRequestSchema.safeParse(input);
    if (!request.success)
        return fail(invalidInput('Invalid push subscription'));
    return useCase.execute(request.data);
}

export async function unsubscribePushNotifications(
    input: unknown,
    useCase: UnsubscribePushNotificationsUseCase,
): Promise<Result<null, ApiError>> {
    const request = UnsubscribePushNotificationsRequestSchema.safeParse({
        endpoint: input,
    });
    if (!request.success) return fail(invalidInput('Invalid push endpoint'));
    return useCase.execute(request.data);
}
