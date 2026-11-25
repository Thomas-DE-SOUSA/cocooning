import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type {
    PhonePermission,
    PhonePushState,
} from '../../view-models/push-notifications.view-model';

// R11: the push side of this phone (Notification, service worker, PushManager). Never rejects: a refusal of the phone
// is null or false, reported by the caller.
export abstract class PhonePushGateway {
    abstract readState(): Promise<PhonePushState>;
    abstract requestPermission(): Promise<PhonePermission>;
    abstract subscribe(
        publicKey: string,
    ): Promise<SubscribePushNotificationsRequest | null>;
    abstract unsubscribe(): Promise<boolean>;
}
