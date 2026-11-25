import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { PhonePushGateway } from '../gateways/ports/phone-push.gateway';
import type { PushSubscriptionCommandGateway } from '../gateways/ports/push-subscription-command.gateway';
import {
    PhonePermissionEnum,
    type PhonePushState,
} from '../view-models/push-notifications.view-model';

export type PushNotificationsSwitch = {
    readonly phone: PhonePushGateway;
    readonly server: PushSubscriptionCommandGateway;
    readonly onApiFailed: (error: ApiError) => void;
    readonly onPhoneRefused: () => void;
};

// R11, run from the tap: the permission prompt comes first, so that iOS sees it as the answer to the gesture.
export async function turnOnPushNotifications(
    { phone, server, onApiFailed, onPhoneRefused }: PushNotificationsSwitch,
    state: PhonePushState,
): Promise<PhonePushState> {
    const permission = await phone.requestPermission();
    const asked = { ...state, permission };
    if (permission !== PhonePermissionEnum.GRANTED) return asked;
    const publicKey = await server.getPushPublicKey();
    if (!publicKey.success) {
        onApiFailed(publicKey.error);
        return asked;
    }
    const subscription = await phone.subscribe(publicKey.value);
    if (subscription === null) {
        onPhoneRefused();
        return asked;
    }
    const saved = await server.subscribe(subscription);
    if (saved.success) return { ...asked, subscription };
    onApiFailed(saved.error);
    // The API does not know this subscription: the phone forgets it too, so the card never says ON in vain.
    await phone.unsubscribe();
    return { ...asked, subscription: null };
}

// An API that no longer knows this phone has already forgotten it.
const isAlreadyForgotten = (error: ApiError): boolean =>
    error.backendCode ===
    MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND;

// R11: the API forgets this phone first, then the phone drops its subscription.
export async function turnOffPushNotifications(
    { phone, server, onApiFailed, onPhoneRefused }: PushNotificationsSwitch,
    state: PhonePushState,
): Promise<PhonePushState> {
    if (state.subscription === null) return state;
    const forgotten = await server.unsubscribe(state.subscription.endpoint);
    if (!forgotten.success && !isAlreadyForgotten(forgotten.error)) {
        onApiFailed(forgotten.error);
        return state;
    }
    if (!(await phone.unsubscribe())) {
        onPhoneRefused();
        return state;
    }
    return { ...state, subscription: null };
}
