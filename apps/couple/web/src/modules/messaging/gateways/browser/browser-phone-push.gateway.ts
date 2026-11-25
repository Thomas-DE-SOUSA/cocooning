import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import {
    type PhonePermission,
    PhonePermissionEnum,
    type PhonePushState,
} from '../../view-models/push-notifications.view-model';
import { PhonePushGateway } from '../ports/phone-push.gateway';
import {
    applicationServerKeyOf,
    subscriptionRequestOf,
} from './push-subscription-codec';

const UNSUPPORTED: PhonePushState = {
    isSupported: false,
    permission: PhonePermissionEnum.DEFAULT,
    subscription: null,
};

// Safari on iPhone exposes PushManager only to the app installed on the home screen (R11).
const isPushSupported = (): boolean =>
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

// Read lazily, never at import: the server renders the containers without navigator.
export class BrowserPhonePushGateway extends PhonePushGateway {
    override async readState(): Promise<PhonePushState> {
        if (!isPushSupported()) return UNSUPPORTED;
        try {
            const registration =
                await navigator.serviceWorker.getRegistration();
            // No service worker on this page (next dev): nothing to subscribe with.
            if (registration === undefined) return UNSUPPORTED;
            const subscription =
                await registration.pushManager.getSubscription();
            return {
                isSupported: true,
                permission: Notification.permission,
                subscription:
                    subscription === null
                        ? null
                        : subscriptionRequestOf(subscription.toJSON()),
            };
        } catch {
            // A browser that fails to answer is treated as one without push: the card says so instead of spinning.
            return UNSUPPORTED;
        }
    }

    override async requestPermission(): Promise<PhonePermission> {
        try {
            return await Notification.requestPermission();
        } catch {
            // The prompt failed to open: the permission stays what it was.
            return Notification.permission;
        }
    }

    override async subscribe(
        publicKey: string,
    ): Promise<SubscribePushNotificationsRequest | null> {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKeyOf(publicKey),
            });
            return subscriptionRequestOf(subscription.toJSON());
        } catch {
            // The push service or the phone refused: null, reported by the caller.
            return null;
        }
    }

    override async unsubscribe(): Promise<boolean> {
        try {
            const registration =
                await navigator.serviceWorker.getRegistration();
            if (registration === undefined) return true;
            const subscription =
                await registration.pushManager.getSubscription();
            return subscription === null
                ? true
                : await subscription.unsubscribe();
        } catch {
            // The phone kept its subscription: false, reported by the caller.
            return false;
        }
    }
}
