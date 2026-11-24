import { PushDeliveryOutcomeEnum } from '../enums/push-delivery-outcome.enum';
import type {
    PushDelivery,
    PushDeliveryReport,
    PushNotification,
} from './push-notification';
import type { PushSubscription } from './push-subscription.aggregate';

// R10: every phone of the couple, but never those of the partner who acted.
const isRecipient = (
    notification: PushNotification,
    subscription: PushSubscription,
): boolean =>
    subscription.coupleId === notification.coupleId &&
    subscription.ownerId !== notification.excludedPartnerId;

export function deliveriesOf(
    notifications: ReadonlyArray<PushNotification>,
    subscriptions: ReadonlyArray<PushSubscription>,
): ReadonlyArray<PushDelivery> {
    return notifications.flatMap((notification) =>
        subscriptions
            .filter((subscription) => isRecipient(notification, subscription))
            .map((subscription) => ({ subscription, kind: notification.kind })),
    );
}

// R11: the subscriptions the push service no longer knows, each once.
export function goneSubscriptionsOf(
    reports: ReadonlyArray<PushDeliveryReport>,
): ReadonlyArray<PushSubscription> {
    const gone = reports
        .filter(({ outcome }) => outcome === PushDeliveryOutcomeEnum.GONE)
        .map(({ delivery }) => delivery.subscription);
    return [...new Map(gone.map((s) => [s.id.getValue(), s])).values()];
}
